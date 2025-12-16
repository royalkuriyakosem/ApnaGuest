from fastapi import APIRouter, HTTPException
from typing import List
from app.core.config import supabase
from app.models.schemas import Profile

router = APIRouter()

@router.get("/", response_model=List[Profile])
def get_profiles():
    response = supabase.table("profiles").select("*").execute()
    return response.data

@router.get("/{user_id}", response_model=Profile)
def get_profile(user_id: str):
    response = supabase.table("profiles").select("*").eq("id", user_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Profile not found")
    return response.data[0]
