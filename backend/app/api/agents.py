from fastapi import APIRouter, HTTPException, Depends
from typing import List
from app.core.config import supabase
from app.models.schemas import ServiceAgent, ServiceAgentCreate

router = APIRouter()

@router.get("/", response_model=List[ServiceAgent])
def get_agents():
    # Fetch all service agents
    response = supabase.table("service_agents").select("*, profile:profiles(*)").execute()
    return response.data

@router.get("/{agent_id}", response_model=ServiceAgent)
def get_agent(agent_id: str):
    response = supabase.table("service_agents").select("*, profile:profiles(*)").eq("id", agent_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Agent not found")
    return response.data[0]

@router.put("/{agent_id}/status")
def update_agent_status(agent_id: str, status: str):
    response = supabase.table("service_agents").update({"availability_status": status}).eq("id", agent_id).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Could not update status")
    return response.data[0]
