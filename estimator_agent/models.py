from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, EmailStr
from datetime import datetime

class SystemType(str, Enum):
    FIRE_ALARM = "Fire Alarm"
    FIRE_SUPPRESSION = "Fire Suppression"
    ACCESS_CONTROL = "Access Control"
    CCTV = "CCTV"
    INTRUSION_DETECTION = "Intrusion Detection"

class ProjectStatus(str, Enum):
    DRAFT = "draft"
    ESTIMATION_IN_PROGRESS = "estimation_in_progress"
    ANALYZED = "analyzed"
    PROPOSAL_SENT = "proposal_sent"
    NEGOTIATION = "negotiation"
    WON = "won"
    LOST = "lost"

class ProjectLocation(BaseModel):
    country: str
    state_province: str
    city: str
    postal_code: str
    seismic_zone: Optional[str] = None
    climate_zone: Optional[str] = None

class Material(BaseModel):
    sku: str
    description: str
    unit: str
    quantity: float
    unit_cost: float
    total_cost: float
    supplier: str
    lead_time_days: int

class Labor(BaseModel):
    category: str
    hours: float
    rate_per_hour: float
    total_cost: float
    skill_level: str

class Equipment(BaseModel):
    name: str
    daily_rate: float
    days_needed: int
    total_cost: float

class Subcontractor(BaseModel):
    company: str
    scope: str
    cost: float
    payment_terms: str

class CostBreakdown(BaseModel):
    materials: List[Material]
    labor: List[Labor]
    equipment: List[Equipment]
    subcontractors: List[Subcontractor]
    total_cost: float
    contingency_percentage: float = 0.10
    contingency_amount: float
    tax_rate: float
    tax_amount: float
    grand_total: float

class SystemSpecification(BaseModel):
    system_type: SystemType
    manufacturer: str
    model: str
    features: List[str]
    certifications: List[str]
    warranty_years: int

class ProjectEstimate(BaseModel):
    project_id: str
    client_name: str
    project_name: str
    location: ProjectLocation
    systems: List[SystemSpecification]
    cost_breakdown: CostBreakdown
    created_at: datetime = Field(default_factory=datetime.now)
    valid_until: datetime
    notes: Optional[str] = None
    compliance_codes: List[str]
    risk_factors: List[str]
    value_engineering_suggestions: List[str]
    
    @property
    def total_cost(self) -> float:
        return self.cost_breakdown.grand_total

class Proposal(BaseModel):
    project_id: str
    client_name: str
    project_name: str
    date: datetime
    executive_summary: str
    scope_of_work: str
    technical_specifications: str
    compliance_matrix: Dict[str, bool]
    terms_and_conditions: str
    payment_schedule: str
    timeline: str
    total_cost: float
    valid_until: datetime

class Message(BaseModel):
    sender: str
    recipient: str
    timestamp: datetime
    content: str
    type: str  # 'email', 'ai', 'user'
    status: str  # 'sent', 'read', 'responded'

class Estimate(BaseModel):
    id: str
    project_id: str
    total_cost: float
    breakdown: Dict[str, float]
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    status: str = "draft"
    metadata: Dict[str, Any] = {}

class Project(BaseModel):
    id: str
    projectName: str
    clientName: str
    clientEmail: str
    clientPhone: str
    buildingType: Optional[str] = None
    buildingSize: Optional[str] = None
    location: Optional[Dict[str, Any]] = None
    requirements: Optional[Dict[str, Any]] = None
    status: ProjectStatus = ProjectStatus.DRAFT
    estimate: Optional[Dict[str, Any]] = None
    proposal: Optional[Dict[str, Any]] = None
    messages: List[Message] = []
    history: List[Dict[str, Any]] = []
    metadata: Dict[str, Any] = {}
    createdAt: datetime = Field(default_factory=datetime.now)
    updatedAt: datetime = Field(default_factory=datetime.now)

# New models for Email Integration & Multi-Agent System

class EmailAttachment(BaseModel):
    filename: str
    content_type: str
    size: int
    s3_key: Optional[str] = None
    parsed_content: Optional[Dict[str, Any]] = None

class EmailMessage(BaseModel):
    message_id: str
    sender: EmailStr
    recipients: List[EmailStr]
    subject: str
    body_text: str
    body_html: Optional[str] = None
    attachments: List[EmailAttachment] = []
    received_date: datetime
    s3_key: Optional[str] = None
    processed: bool = False
    project_id: Optional[str] = None

class DocumentType(str, Enum):
    DRAWING = "Drawing"
    SPECIFICATION = "Specification"
    SCOPE_OF_WORK = "Scope of Work"
    RFP = "Request for Proposal"
    OTHER = "Other"

class ParsedDocument(BaseModel):
    document_id: str
    document_type: DocumentType
    filename: str
    content_type: str
    size: int
    s3_key: str
    text_content: Optional[str] = None
    extracted_entities: Optional[Dict[str, Any]] = None
    created_date: datetime
    project_id: Optional[str] = None

class AgentRole(str, Enum):
    DOCUMENT_PARSER = "Document Parser"
    CODE_COMPLIANCE = "Code Compliance"
    COST_ESTIMATOR = "Cost Estimator"
    PROPOSAL_GENERATOR = "Proposal Generator"
    COORDINATOR = "Coordinator"

class AgentAction(BaseModel):
    agent_role: AgentRole
    action_type: str
    input_data: Dict[str, Any]
    output_data: Optional[Dict[str, Any]] = None
    status: str
    timestamp: datetime
    error_message: Optional[str] = None

class AgentWorkflow(BaseModel):
    workflow_id: str
    project_id: str
    status: str
    started_at: datetime
    completed_at: Optional[datetime] = None
    current_step: str
    steps_completed: List[str] = []
    actions: List[AgentAction] = []
    result: Optional[Dict[str, Any]] = None

class ProposalTemplate(BaseModel):
    template_id: str
    name: str
    description: str
    template_html: str
    css_style: Optional[str] = None
    variables: Dict[str, str]
    created_at: datetime
    updated_at: datetime
    is_default: bool = False 