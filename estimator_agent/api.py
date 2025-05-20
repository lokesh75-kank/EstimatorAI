from fastapi import FastAPI, HTTPException
from typing import Dict, Optional
from pydantic import BaseModel
from .models import ProjectLocation, ProjectEstimate, Proposal
from .agent import EstimatorAgent
import json

app = FastAPI(
    title="Fire & Security Systems Estimator API",
    description="API for generating cost estimates and proposals for fire protection and security systems",
    version="1.0.0"
)

estimator = EstimatorAgent()

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