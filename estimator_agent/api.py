from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import APIKeyHeader
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from typing import Dict, Optional, List, Any
from pydantic import BaseModel
from estimator_agent.models import ProjectLocation, ProjectEstimate, Proposal, Project, ProjectStatus, Message
from estimator_agent.agent import EstimatorAgent
import json
import uuid
from datetime import datetime
import os
import base64
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Email, To, Content, Attachment, FileContent, FileName, FileType, Disposition
import openai
from estimator_agent.services import AgentService
import logging
from logging.handlers import RotatingFileHandler
import time
from functools import wraps
from fastapi.responses import JSONResponse

# Logging configuration
LOG_FILE = "backend_debug.log"
LOG_LEVEL = logging.DEBUG

# Create a rotating file handler (5MB per file, keep 3 backups)
file_handler = RotatingFileHandler(LOG_FILE, maxBytes=5*1024*1024, backupCount=3)
file_handler.setLevel(LOG_LEVEL)
file_formatter = logging.Formatter("%(asctime)s [%(levelname)s] %(name)s: %(message)s")
file_handler.setFormatter(file_formatter)

# Create a stream handler for console output
console_handler = logging.StreamHandler()
console_handler.setLevel(LOG_LEVEL)
console_formatter = logging.Formatter("%(asctime)s [%(levelname)s] %(name)s: %(message)s")
console_handler.setFormatter(console_formatter)

# Get the root logger and configure it
logging.basicConfig(level=LOG_LEVEL, handlers=[file_handler, console_handler])
logger = logging.getLogger(__name__)

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)

# Initialize FastAPI app
app = FastAPI(
    title="Fire & Security Systems Estimator API",
    description="API for generating cost estimates and proposals for fire protection and security systems",
    version="1.0.0"
)

# Add rate limiter error handler
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Configure CORS with specific origins
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Add trusted host middleware
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=os.getenv("ALLOWED_HOSTS", "*").split(",")
)

# API Key security
API_KEY_NAME = "X-API-Key"
api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=True)

# Verify API key
async def verify_api_key(api_key: str = Depends(api_key_header)):
    if api_key != os.getenv("API_KEY"):
        raise HTTPException(
            status_code=403,
            detail="Invalid API key"
        )
    return api_key

# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    duration = time.time() - start_time
    
    logger.info(
        f"Method: {request.method} Path: {request.url.path} "
        f"Status: {response.status_code} Duration: {duration:.2f}s"
    )
    
    return response

# Error handling middleware
@app.middleware("http")
async def error_handling(request: Request, call_next):
    try:
        return await call_next(request)
    except Exception as e:
        logger.error(f"Unhandled error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Internal server error"
        )

# Health check endpoint
@app.get("/health")
@limiter.limit("30/minute")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }

estimator = EstimatorAgent()

# In-memory storage for demo
PROJECTS = {}
ESTIMATES = {}
FILES = {}

SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
openai.api_key = OPENAI_API_KEY

def send_email(to_email, subject, body, attachment_bytes=None, attachment_filename=None):
    sg = SendGridAPIClient(api_key=SENDGRID_API_KEY)
    from_email = Email("estimator@yourdomain.com")
    to = To(to_email)
    content = Content("text/plain", body)
    mail = Mail(from_email, to, subject, content)
    if attachment_bytes and attachment_filename:
        encoded = base64.b64encode(attachment_bytes).decode()
        attachment = Attachment(
            FileContent(encoded),
            FileName(attachment_filename),
            FileType('application/pdf'),
            Disposition('attachment')
        )
        mail.attachment = attachment
    response = sg.send(mail)
    return response.status_code

class ProjectRequest(BaseModel):
    projectName: str
    clientName: str
    clientEmail: str
    clientPhone: str
    buildingType: str
    buildingSize: str
    location: dict
    requirements: dict

@app.post("/projects")
@limiter.limit("10/minute")
async def create_project(request: Request, api_key: str = Depends(verify_api_key)):
    """
    Create a new project from either JSON or form data.
    """
    try:
        logger.info("Received project creation request")
        content_type = request.headers.get('content-type', '').lower()
        now = datetime.now()
        if 'application/json' in content_type:
            logger.info("Processing JSON request")
            json_data = await request.json()
            logger.info(f"Received JSON data: {json_data}")
            project_id = str(uuid.uuid4())
            logger.info(f"Generated project ID: {project_id}")
            project = Project(
                id=project_id,
                projectName=json_data.get("projectName", "Unnamed Project"),
                clientName=json_data.get("clientName", "Unknown Client"),
                clientEmail=json_data.get("clientEmail", ""),
                clientPhone=json_data.get("clientPhone", ""),
                buildingType=json_data.get("buildingType", ""),
                buildingSize=json_data.get("buildingSize", ""),
                location=json_data.get("location", {}),
                requirements=json_data.get("requirements", {}),
                status=ProjectStatus.DRAFT,
                estimate=None,
                proposal=None,
                messages=[],
                history=[{"status": ProjectStatus.DRAFT, "timestamp": now.isoformat(), "reason": "Project created"}],
                metadata={},
                createdAt=now,
                updatedAt=now
            )
            PROJECTS[project_id] = project.dict()
            logger.info(f"Project stored successfully. Project data: {project.dict()}")
            return project.dict()
        else:
            logger.info("Processing multipart form data")
            form_data = await request.form()
            logger.info(f"Received form data with {len(form_data)} fields")
            data = {}
            files = []
            for key, value in form_data.items():
                logger.info(f"Processing field: {key}")
                if isinstance(value, UploadFile):
                    logger.info(f"- File field: {key}, filename: {value.filename}")
                    files.append(value)
                else:
                    try:
                        if key in ['location', 'requirements'] or key.endswith('json'):
                            logger.info(f"- Parsing JSON field: {key}")
                            data[key] = json.loads(value)
                        else:
                            logger.info(f"- String field: {key}={value}")
                            data[key] = value
                    except Exception as e:
                        logger.error(f"- Error parsing field {key}: {str(e)}")
                        data[key] = value
            project_id = str(uuid.uuid4())
            logger.info(f"Generated project ID: {project_id}")
            project = Project(
                id=project_id,
                projectName=data.get("projectName", "Unnamed Project"),
                clientName=data.get("clientName", "Unknown Client"),
                clientEmail=data.get("clientEmail", ""),
                clientPhone=data.get("clientPhone", ""),
                buildingType=data.get("buildingType", ""),
                buildingSize=data.get("buildingSize", ""),
                location=data.get("location", {}),
                requirements=data.get("requirements", {}),
                status=ProjectStatus.DRAFT,
                estimate=None,
                proposal=None,
                messages=[],
                history=[{"status": ProjectStatus.DRAFT, "timestamp": now.isoformat(), "reason": "Project created"}],
                metadata={},
                createdAt=now,
                updatedAt=now
            )
            PROJECTS[project_id] = project.dict()
            logger.info(f"Project stored successfully. Project data: {project.dict()}")
            # Store files for this project if any
            if files:
                FILES[project_id] = []
                for file in files:
                    file_content = await file.read()
                    FILES[project_id].append({
                        "filename": file.filename,
                        "content_type": file.content_type,
                        "content": file_content
                    })
                logger.info(f"Stored {len(files)} files for project {project_id}")
            return project.dict()
    except Exception as e:
        logger.error(f"Error creating project: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to create project: {str(e)}")

@app.get("/projects/{project_id}")
@limiter.limit("30/minute")
async def get_project(project_id: str, api_key: str = Depends(verify_api_key)):
    project = PROJECTS.get(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@app.get("/projects")
async def list_projects():
    return list(PROJECTS.values())

class AnalysisRequest(BaseModel):
    promptTemplate: str = "Analyze this project and provide a detailed cost estimate."
    templateType: str = "detailed"

@app.post("/projects/{project_id}/analyze")
async def analyze_project(project_id: str, request: AnalysisRequest = None):
    """
    Analyze a project using the AI estimator with optional custom prompt.
    """
    project = PROJECTS.get(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    try:
        logger.info(f"Analyzing project {project_id}")
        # Update status to estimation_in_progress
        now = datetime.now()
        project['status'] = ProjectStatus.ESTIMATION_IN_PROGRESS
        project['updatedAt'] = now
        project.setdefault('history', []).append({"status": ProjectStatus.ESTIMATION_IN_PROGRESS, "timestamp": now.isoformat(), "reason": "Estimation started"})
        PROJECTS[project_id] = project
        if request:
            logger.info(f"Using custom prompt: {request.promptTemplate}")
            logger.info(f"Template type: {request.templateType}")
        else:
            logger.info("Using default prompt")
        
        # For demo purposes, return a mock AI analysis
        # In a real implementation, you would use the custom prompt with your LLM
        analysis = {
            "id": str(uuid.uuid4()),
            "projectId": project_id,
            "estimatedCost": 150000,
            "confidence": 0.85,
            "recommendations": [
                "Include additional fire alarm pull stations in corridors",
                "Upgrade to addressable smoke detectors for improved location accuracy",
                "Consider adding CO detection in garage areas"
            ],
            "timeline": "8-10 weeks",
            "breakdown": [
                {
                    "category": "Fire Alarm System",
                    "items": [
                        {
                            "name": "Control Panel",
                            "quantity": 1,
                            "unitCost": 5000,
                            "totalCost": 5000,
                            "confidence": 0.9
                        },
                        {
                            "name": "Smoke Detectors",
                            "quantity": 45,
                            "unitCost": 120,
                            "totalCost": 5400,
                            "confidence": 0.85
                        }
                    ]
                },
                {
                    "category": "Access Control",
                    "items": [
                        {
                            "name": "Card Readers",
                            "quantity": 12,
                            "unitCost": 450,
                            "totalCost": 5400,
                            "confidence": 0.8
                        }
                    ]
                }
            ],
            "riskAssessment": {
                "level": "medium",
                "factors": [
                    "Building size requires extensive wiring runs",
                    "Local code compliance may require additional devices",
                    "Installation time might be affected by working hours restrictions"
                ]
            },
            "optimizationSuggestions": {
                "costSaving": 15000,
                "suggestions": [
                    "Combine fire alarm and security system wiring where possible",
                    "Use wireless devices in hard-to-reach areas",
                    "Schedule installation during regular business hours"
                ]
            }
        }
        
        # In a real implementation, you would make different analyses based on the template type
        if request and request.templateType == "executive":
            # Simplified executive summary with less detail
            analysis["recommendations"] = analysis["recommendations"][:3]  # Only top 3
            analysis["breakdown"] = []  # No detailed breakdown
        elif request and request.templateType == "technical":
            # More technical information
            analysis["technicalSpecs"] = {
                "fireAlarm": {
                    "standard": "NFPA 72",
                    "components": ["Control panel", "Smoke detectors", "Heat detectors", "Pull stations"]
                },
                "accessControl": {
                    "standard": "UL 294",
                    "components": ["Card readers", "Door controllers", "Electronic locks"]
                }
            }
        
        # Update project with estimate and status
        project['estimate'] = analysis
        project['status'] = ProjectStatus.ANALYZED
        project['updatedAt'] = now
        project.setdefault('history', []).append({"status": ProjectStatus.ANALYZED, "timestamp": now.isoformat(), "reason": "Estimation complete"})
        PROJECTS[project_id] = project
        return analysis
    except Exception as e:
        logger.error(f"Error analyzing project: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

class EstimateRequest(BaseModel):
    project_id: str
    client_name: str
    project_name: str
    location: ProjectLocation
    drawings: Optional[Dict] = {}
    specifications: Optional[Dict] = {}

@app.post("/estimate", response_model=ProjectEstimate)
async def create_estimate(request: EstimateRequest):
    """
    Generate a project estimate based on provided information.
    """
    try:
        estimate = estimator.generate_estimate(
            project_id=request.project_id,
            client_name=request.client_name,
            project_name=request.project_name,
            location=request.location,
            drawings=request.drawings or {},
            specifications=request.specifications or {}
        )
        return estimate
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/proposal", response_model=Proposal)
async def create_proposal(estimate: ProjectEstimate):
    """
    Generate a proposal based on an existing estimate.
    """
    try:
        proposal = estimator.generate_proposal(estimate)
        return proposal
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/codes/{country}")
async def get_regional_codes(country: str):
    """
    Get applicable codes and standards for a specific country.
    """
    if country not in estimator.regional_codes:
        raise HTTPException(status_code=404, detail=f"No codes found for country: {country}")
    return estimator.regional_codes[country]

@app.get("/labor-rates/{country}")
async def get_labor_rates(country: str):
    """
    Get labor rates for a specific country.
    """
    if country not in estimator.labor_rates:
        raise HTTPException(status_code=404, detail=f"No labor rates found for country: {country}")
    return estimator.labor_rates[country]

@app.post("/projects/{project_id}/proposal")
async def generate_project_proposal(project_id: str):
    project = PROJECTS.get(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    try:
        now = datetime.now()
        proposal_id = str(uuid.uuid4())
        proposal = {
            "id": proposal_id,
            "projectId": project_id,
            "proposalUrl": proposal_id,
            "title": f"Proposal for {project.get('projectName', 'Unknown Project')}",
            "clientName": project.get('clientName', 'Unknown Client'),
            "createdAt": now.isoformat(),
            "status": "draft"
        }
        # AI-generated proposal content
        prompt = f"""
        You are a professional estimator. Write a detailed, client-friendly proposal for the following project:\n\nProject: {project.get('projectName')}\nClient: {project.get('clientName')}\nRequirements: {project.get('requirements')}\nEstimate: {project.get('estimate')}\n"""
        ai_response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[{"role": "system", "content": prompt}]
        )
        proposal_body = ai_response['choices'][0]['message']['content']
        # Send proposal email
        send_email(
            to_email=project.get('clientEmail'),
            subject=proposal['title'],
            body=proposal_body
        )
        # Log the sent email as a message
        project.setdefault('messages', []).append({
            "sender": "AI Agent",
            "recipient": project.get('clientEmail'),
            "timestamp": now.isoformat(),
            "content": proposal_body,
            "type": "email",
            "status": "sent"
        })
        # Update project with proposal and status
        project['proposal'] = proposal
        project['status'] = ProjectStatus.PROPOSAL_SENT
        project['updatedAt'] = now
        project.setdefault('history', []).append({"status": ProjectStatus.PROPOSAL_SENT, "timestamp": now.isoformat(), "reason": "Proposal sent"})
        PROJECTS[project_id] = project
        return proposal
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/projects/{project_id}/messages")
async def add_project_message(project_id: str, message: Message):
    project = PROJECTS.get(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    project.setdefault('messages', []).append(message.dict())
    project['updatedAt'] = datetime.now()
    PROJECTS[project_id] = project
    return {"status": "ok"}

@app.get("/projects/{project_id}/messages")
async def get_project_messages(project_id: str):
    project = PROJECTS.get(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project.get('messages', [])

@app.post("/projects/{project_id}/negotiate")
async def negotiate_project(project_id: str, message: Message):
    project = PROJECTS.get(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    now = datetime.now()
    project.setdefault('messages', []).append(message.dict())
    project['status'] = ProjectStatus.NEGOTIATION
    project['updatedAt'] = now
    project.setdefault('history', []).append({"status": ProjectStatus.NEGOTIATION, "timestamp": now.isoformat(), "reason": "Negotiation/feedback"})
    # AI-generated negotiation response
    prompt = f"""
    You are a professional estimator negotiating with a client. The client said: '{message.content}'.\nProject details: {project.get('requirements')}.\nDraft a persuasive, professional response to win the project at a good margin."""
    ai_response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[{"role": "system", "content": prompt}]
    )
    ai_reply = ai_response['choices'][0]['message']['content']
    # Send negotiation email
    send_email(
        to_email=project.get('clientEmail'),
        subject=f"Re: {project.get('projectName')} - Negotiation",
        body=ai_reply
    )
    # Log the AI's message
    project.setdefault('messages', []).append({
        "sender": "AI Agent",
        "recipient": project.get('clientEmail'),
        "timestamp": now.isoformat(),
        "content": ai_reply,
        "type": "email",
        "status": "sent"
    })
    PROJECTS[project_id] = project
    return {"status": "ok"}

@app.get("/test")
async def test_api():
    """
    Simple test endpoint to verify API is running.
    """
    return {"status": "ok", "message": "API is running correctly"}

class AIProjectCreationRequest(BaseModel):
    documents: List[Dict[str, Any]]  # List of documents with content and metadata
    email: Optional[str] = None  # Optional email for communication

@app.post("/projects/ai-create")
async def create_project_ai(request: AIProjectCreationRequest):
    """
    Create a new project using AI agents to extract information from documents.
    """
    try:
        now = datetime.now()
        project_id = str(uuid.uuid4())
        
        # Initialize agent service
        agent_service = AgentService(openai_api_key=OPENAI_API_KEY)
        
        # Create and execute project workflow
        workflow = agent_service.create_project_workflow(project_id, request.documents)
        
        # Extract project information from workflow results
        project_info = workflow.result.get('output', {})
        
        # Create project object
        project = Project(
            id=project_id,
            projectName=project_info.get('project_name', 'AI Generated Project'),
            clientName=project_info.get('client_name', 'Unknown Client'),
            clientEmail=request.email or project_info.get('client_email', ''),
            clientPhone=project_info.get('client_phone', ''),
            buildingType=project_info.get('building_type', ''),
            buildingSize=project_info.get('building_size', ''),
            location=project_info.get('location', {}),
            requirements=project_info.get('requirements', {}),
            status=ProjectStatus.DRAFT,
            estimate=project_info.get('estimate'),
            proposal=project_info.get('proposal'),
            messages=[],
            history=[{"status": ProjectStatus.DRAFT, "timestamp": now.isoformat(), "reason": "Project created by AI"}],
            metadata={
                "created_by": "AI Agent",
                "workflow_id": workflow.workflow_id,
                "document_count": len(request.documents)
            },
            createdAt=now,
            updatedAt=now
        )
        
        # Store project
        PROJECTS[project_id] = project.dict()
        
        return project.dict()
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating project: {str(e)}")

class ReviewRequest(BaseModel):
    reviewStatus: Dict[str, str]
    reviewNotes: Dict[str, str]

@app.post("/projects/{project_id}/finalize")
async def finalize_project(project_id: str, request: ReviewRequest):
    """
    Finalize a project after review and generate the final proposal.
    """
    try:
        project = PROJECTS.get(project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        now = datetime.now()
        
        # Update project with review information
        project['review_status'] = request.reviewStatus
        project['review_notes'] = request.reviewNotes
        
        # Check if any step was rejected
        if any(status == 'rejected' for status in request.reviewStatus.values()):
            project['status'] = ProjectStatus.REVISION_NEEDED
            project['updatedAt'] = now
            project.setdefault('history', []).append({
                "status": ProjectStatus.REVISION_NEEDED,
                "timestamp": now.isoformat(),
                "reason": "Project needs revision based on review"
            })
            return project
        
        # All steps approved, generate final proposal
        project['status'] = ProjectStatus.FINALIZING
        project['updatedAt'] = now
        project.setdefault('history', []).append({
            "status": ProjectStatus.FINALIZING,
            "timestamp": now.isoformat(),
            "reason": "Generating final proposal"
        })
        
        # Initialize agent service
        agent_service = AgentService(openai_api_key=OPENAI_API_KEY)
        
        # Generate final proposal incorporating review feedback
        final_proposal = agent_service.generate_final_proposal(
            project_id=project_id,
            project_data=project,
            review_notes=request.reviewNotes
        )
        
        # Update project with final proposal
        project['proposal'] = final_proposal
        project['status'] = ProjectStatus.COMPLETED
        project['updatedAt'] = now
        project.setdefault('history', []).append({
            "status": ProjectStatus.COMPLETED,
            "timestamp": now.isoformat(),
            "reason": "Project finalized with approved proposal"
        })
        
        # Send email notification
        if project.get('clientEmail'):
            send_email(
                to_email=project['clientEmail'],
                subject=f"Final Proposal: {project.get('projectName', 'Project')}",
                body=f"""Dear {project.get('clientName', 'Client')},

Your project proposal has been finalized and is ready for review. You can access it at:
{project.get('proposal', {}).get('proposalUrl', '#')}

Best regards,
The Estimator AI Team"""
            )
        
        PROJECTS[project_id] = project
        return project
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error finalizing project: {str(e)}")

# Add metrics endpoint
@app.get("/metrics")
@limiter.limit("5/minute")
async def get_metrics(api_key: str = Depends(verify_api_key)):
    """
    Get API metrics and statistics
    """
    return {
        "total_projects": len(PROJECTS),
        "total_estimates": len(ESTIMATES),
        "total_files": sum(len(files) for files in FILES.values()),
        "timestamp": datetime.now().isoformat()
    }

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )

file_handler = logging.FileHandler("backend_debug.log")
file_handler.setLevel(logging.DEBUG)
formatter = logging.Formatter("%(asctime)s [%(levelname)s] %(name)s: %(message)s")
file_handler.setFormatter(formatter)
logging.getLogger().addHandler(file_handler) 