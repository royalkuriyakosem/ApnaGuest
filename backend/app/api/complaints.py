from fastapi import APIRouter, HTTPException, Depends
from typing import List
from app.core.config import supabase
from app.models.schemas import Complaint, ComplaintCreate, ComplaintUpdate

router = APIRouter()

@router.get("/", response_model=List[Complaint])
def get_complaints():
    # In a real app, filter by user role/ID
    response = supabase.table("complaints").select("*").execute()
    return response.data

@router.post("/", response_model=Complaint)
def create_complaint(complaint: ComplaintCreate, user_id: str): # user_id should come from auth token
    data = complaint.dict()
    data["tenant_id"] = user_id # Map user_id to tenant_id
    response = supabase.table("complaints").insert(data).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Could not create complaint")
    return response.data[0]

@router.put("/{complaint_id}", response_model=Complaint)
def update_complaint(complaint_id: str, complaint: ComplaintUpdate):
    response = supabase.table("complaints").update(complaint.dict(exclude_unset=True)).eq("id", complaint_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Complaint not found or update failed")
    return response.data[0]
