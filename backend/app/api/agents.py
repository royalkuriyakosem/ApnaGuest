from fastapi import APIRouter, HTTPException, Depends
from typing import List
from uuid import UUID
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.sql_models import ServiceAgent, User
from app.models.schemas import ServiceAgentResponse
from app.api.deps import get_current_user

router = APIRouter()

@router.get("/", response_model=List[ServiceAgentResponse])
def get_agents(db: Session = Depends(get_db)):
    return db.query(ServiceAgent).all()

@router.get("/{agent_id}", response_model=ServiceAgentResponse)
def get_agent(agent_id: UUID, db: Session = Depends(get_db)):
    agent = db.query(ServiceAgent).filter(ServiceAgent.id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return agent

@router.put("/{agent_id}/status")
def update_agent_status(agent_id: UUID, status: str, db: Session = Depends(get_db)):
    # Assuming 'status' means verification status for now as we don't have availability status in new model yet
    # or maybe we want to add availability. 
    # For now, let's assume it updates 'is_verified' if status is 'verified'
    agent = db.query(ServiceAgent).filter(ServiceAgent.id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    if status == "verified":
        agent.is_verified = True
    elif status == "unverified":
        agent.is_verified = False
        
    db.commit()
    db.refresh(agent)
    return agent
