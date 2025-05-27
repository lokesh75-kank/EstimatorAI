from typing import List, Dict, Any, Optional
from datetime import datetime
from crewai import Agent, Task, Crew, Process
from langchain.tools import tool
from langchain_community.tools import DuckDuckGoSearchRun
from ..models import AgentRole, AgentAction, AgentWorkflow, ParsedDocument, ProjectEstimate, Proposal
import json

class AgentService:
    def __init__(self, openai_api_key: str):
        self.openai_api_key = openai_api_key
        self.search_tool = DuckDuckGoSearchRun()
        
    def create_document_parser_agent(self) -> Agent:
        """
        Create an agent responsible for parsing documents
        """
        return Agent(
            role="Document Parser",
            goal="Extract all relevant information from project documents",
            backstory="""You are an expert at analyzing construction documents, drawings, and specifications. 
            Your goal is to extract key information about fire protection and security system requirements.
            You can understand technical drawings, specifications, and project requirements documents.""",
            verbose=True,
            allow_delegation=False,
            tools=[self.search_tool],
            llm_model="gpt-4"
        )
        
    def create_requirements_agent(self) -> Agent:
        """
        Create an agent responsible for analyzing requirements
        """
        return Agent(
            role="Requirements Analyst",
            goal="Analyze and structure project requirements",
            backstory="""You are an expert in fire protection and security systems requirements analysis.
            You can identify system requirements, compliance needs, and technical specifications from project documents.
            You understand building codes, safety standards, and industry best practices.""",
            verbose=True,
            allow_delegation=True,
            tools=[self.search_tool],
            llm_model="gpt-4"
        )
        
    def create_cost_estimator_agent(self) -> Agent:
        """
        Create an agent responsible for cost estimation
        """
        return Agent(
            role="Cost Estimator",
            goal="Generate accurate cost estimates for fire protection and security systems",
            backstory="""You are an expert in estimating costs for fire protection and security systems.
            You understand material costs, labor rates, equipment costs, and regional variations.
            You can provide detailed cost breakdowns and identify potential cost-saving opportunities.""",
            verbose=True,
            allow_delegation=True,
            tools=[self.search_tool],
            llm_model="gpt-4"
        )
        
    def create_proposal_generator_agent(self) -> Agent:
        """
        Create an agent responsible for generating proposals
        """
        return Agent(
            role="Proposal Writer",
            goal="Create professional and compelling project proposals",
            backstory="""You are an expert in writing professional proposals for fire protection and security systems.
            You can create clear, persuasive proposals that highlight the value proposition and technical excellence.
            You understand how to present costs, timelines, and technical specifications in a client-friendly format.""",
            verbose=True,
            allow_delegation=True,
            tools=[self.search_tool],
            llm_model="gpt-4"
        )
        
    @tool
    def parse_document(self, document: Dict[str, Any]) -> ParsedDocument:
        """
        Parse a document and extract relevant information
        
        Args:
            document: Dictionary containing document metadata and content
            
        Returns:
            ParsedDocument object with extracted information
        """
        # Implementation would use LangChain to process the document
        # This is a placeholder for the actual implementation
        return ParsedDocument(
            document_id=document.get('id', ''),
            document_type=document.get('type', 'OTHER'),
            filename=document.get('filename', ''),
            content_type=document.get('content_type', ''),
            size=document.get('size', 0),
            s3_key=document.get('s3_key', ''),
            text_content=document.get('content', ''),
            extracted_entities={},
            created_date=datetime.now(),
            project_id=document.get('project_id', '')
        )
        
    @tool
    def check_code_compliance(self, project_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Check code compliance for a project
        
        Args:
            project_data: Dictionary containing project details
            
        Returns:
            Dictionary with compliance information
        """
        # Implementation would look up relevant codes based on location and system types
        # This is a placeholder for the actual implementation
        return {
            'compliant': True,
            'applicable_codes': [
                'NFPA 72',
                'NFPA 101',
                'UL 864'
            ],
            'issues': []
        }
        
    @tool
    def estimate_project_cost(self, project_data: Dict[str, Any]) -> ProjectEstimate:
        """
        Generate a cost estimate for a project
        
        Args:
            project_data: Dictionary containing project details
            
        Returns:
            ProjectEstimate object with detailed cost breakdown
        """
        # Implementation would call the EstimatorAgent to generate the estimate
        # This is a placeholder for the actual implementation
        from ..agent import EstimatorAgent
        
        estimator = EstimatorAgent()
        return estimator.generate_estimate(
            project_id=project_data.get('project_id', ''),
            client_name=project_data.get('client_name', ''),
            project_name=project_data.get('project_name', ''),
            location=project_data.get('location', {}),
            drawings=project_data.get('drawings', {}),
            specifications=project_data.get('specifications', {})
        )
        
    @tool
    def generate_proposal(self, estimate: ProjectEstimate) -> Proposal:
        """
        Generate a proposal from an estimate
        
        Args:
            estimate: ProjectEstimate object
            
        Returns:
            Proposal object
        """
        # Implementation would call the EstimatorAgent to generate the proposal
        # This is a placeholder for the actual implementation
        from ..agent import EstimatorAgent
        
        estimator = EstimatorAgent()
        return estimator.generate_proposal(estimate)
        
    def create_project_workflow(self, project_id: str, documents: List[Dict[str, Any]]) -> AgentWorkflow:
        """
        Create and execute a workflow for a project with review steps
        
        Args:
            project_id: Project identifier
            documents: List of documents to process
            
        Returns:
            AgentWorkflow object with results
        """
        # Create the agents
        parser_agent = self.create_document_parser_agent()
        requirements_agent = self.create_requirements_agent()
        estimator_agent = self.create_cost_estimator_agent()
        proposal_agent = self.create_proposal_generator_agent()
        
        # Step 1: Document Parsing and Requirements Extraction
        parsing_task = Task(
            description=f"""Analyze the following documents and extract all relevant information:
            {', '.join([doc.get('filename', 'Unknown') for doc in documents])}
            
            Extract:
            1. Project name and basic information
            2. Client details
            3. Building information (type, size, location)
            4. System requirements and specifications
            5. Compliance requirements
            6. Timeline and budget constraints
            
            Provide a structured JSON output with all extracted information.
            Format the output for easy review and validation.""",
            agent=parser_agent,
            expected_output="A detailed analysis of the documents with extracted information in JSON format"
        )
        
        # Step 2: Requirements Analysis and Structuring
        requirements_task = Task(
            description="""Analyze the extracted information and structure the project requirements.
            Include:
            1. Required systems and their specifications
            2. Compliance requirements
            3. Technical requirements
            4. Quality standards
            5. Timeline requirements
            6. Budget constraints
            
            Provide a structured JSON output with all requirements.
            Include confidence scores for each requirement.
            Highlight any areas that need human review or clarification.""",
            agent=requirements_agent,
            expected_output="A structured JSON of project requirements with confidence scores",
            context=[parsing_task]
        )
        
        # Step 3: Cost Estimation
        estimation_task = Task(
            description="""Generate a detailed cost estimate based on the requirements.
            Include:
            1. Material costs breakdown
            2. Labor costs breakdown
            3. Equipment costs
            4. Subcontractor costs
            5. Contingency and tax calculations
            6. Value engineering suggestions
            
            Provide a structured JSON output with the cost estimate.
            Include confidence scores for each cost item.
            Highlight any assumptions or areas that need review.""",
            agent=estimator_agent,
            expected_output="A comprehensive cost estimate in JSON format with confidence scores",
            context=[requirements_task]
        )
        
        # Step 4: Proposal Generation
        proposal_task = Task(
            description="""Create a professional proposal based on the requirements and estimate.
            Include:
            1. Executive summary
            2. Scope of work
            3. Technical specifications
            4. Compliance matrix
            5. Terms and conditions
            6. Payment schedule
            7. Project timeline
            
            Provide a structured JSON output with the proposal content.
            Include placeholders for any information that needs human review or approval.
            Format the output for easy review and editing.""",
            agent=proposal_agent,
            expected_output="A complete proposal in JSON format with review placeholders",
            context=[estimation_task]
        )
        
        # Create the crew with sequential processing
        crew = Crew(
            agents=[parser_agent, requirements_agent, estimator_agent, proposal_agent],
            tasks=[parsing_task, requirements_task, estimation_task, proposal_task],
            verbose=2,
            process=Process.sequential
        )
        
        # Execute the workflow
        result = crew.kickoff()
        
        # Create workflow record with review status
        workflow = AgentWorkflow(
            workflow_id=f"wf-{project_id}-{datetime.now().strftime('%Y%m%d%H%M%S')}",
            project_id=project_id,
            status="pending_review",  # Changed to indicate review is needed
            started_at=datetime.now(),
            completed_at=datetime.now(),
            current_step="proposal_generation",
            steps_completed=[
                "document_parsing",
                "requirements_analysis",
                "cost_estimation",
                "proposal_generation"
            ],
            actions=[],
            result={
                "output": result,
                "review_status": {
                    "requirements": "pending",
                    "estimate": "pending",
                    "proposal": "pending"
                },
                "review_notes": []
            }
        )
        
        return workflow 

    def generate_final_proposal(self, project_id: str, project_data: Dict[str, Any], review_notes: Dict[str, str]) -> Dict[str, Any]:
        """
        Generate the final proposal incorporating review feedback
        
        Args:
            project_id: Project identifier
            project_data: Project data including requirements and estimates
            review_notes: Notes from the review process
            
        Returns:
            Dictionary containing the final proposal
        """
        # Create the proposal agent
        proposal_agent = self.create_proposal_generator_agent()
        
        # Create the task for final proposal generation
        proposal_task = Task(
            description=f"""Create a final proposal incorporating all review feedback.
            
            Project Information:
            - Name: {project_data.get('projectName')}
            - Client: {project_data.get('clientName')}
            - Location: {project_data.get('location')}
            
            Requirements:
            {json.dumps(project_data.get('requirements', {}), indent=2)}
            
            Cost Estimate:
            {json.dumps(project_data.get('estimate', {}), indent=2)}
            
            Review Notes:
            {json.dumps(review_notes, indent=2)}
            
            Create a comprehensive proposal that:
            1. Addresses all review feedback
            2. Includes all approved requirements
            3. Uses the approved cost estimates
            4. Provides clear technical specifications
            5. Includes compliance information
            6. Details terms and conditions
            7. Outlines payment schedule
            8. Provides project timeline
            
            Format the output as a structured JSON with all proposal sections.""",
            agent=proposal_agent,
            expected_output="A complete final proposal in JSON format"
        )
        
        # Execute the task
        result = proposal_agent.execute(proposal_task)
        
        # Parse the result and create the final proposal
        try:
            proposal_data = json.loads(result)
        except json.JSONDecodeError:
            # If the result isn't valid JSON, create a structured proposal
            proposal_data = {
                "executiveSummary": result,
                "scopeOfWork": "See executive summary",
                "technicalSpecifications": "See executive summary",
                "complianceMatrix": "See executive summary",
                "termsAndConditions": "See executive summary",
                "paymentSchedule": "See executive summary",
                "projectTimeline": "See executive summary"
            }
        
        # Add metadata
        proposal_data.update({
            "projectId": project_id,
            "version": "final",
            "generatedAt": datetime.now().isoformat(),
            "reviewNotes": review_notes
        })
        
        return proposal_data 