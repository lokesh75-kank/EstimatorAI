from enum import Enum
from typing import List, Optional, Dict
from pydantic import BaseModel, Field
from datetime import datetime

class SystemType(str, Enum):
    FIRE_ALARM = "fire_alarm"
    FIRE_SUPPRESSION = "fire_suppression"
    ACCESS_CONTROL = "access_control"
    CCTV = "cctv"
    INTRUSION_DETECTION = "intrusion_detection"

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
    days_needed: float
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

class Proposal(BaseModel):
    estimate: ProjectEstimate
    executive_summary: str
    scope_of_work: str
    technical_specifications: str
    compliance_matrix: Dict[str, bool]
    terms_and_conditions: str
    payment_schedule: str
    timeline: str 