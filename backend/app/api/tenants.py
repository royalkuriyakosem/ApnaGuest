from fastapi import APIRouter, HTTPException, Depends
from typing import List
from app.core.config import supabase
from app.models.schemas import Tenant, TenantCreate

router = APIRouter()

@router.get("/", response_model=List[Tenant])
def get_tenants():
    response = supabase.table("tenants").select("*").execute()
    return response.data

@router.post("/", response_model=Tenant)
def create_tenant(tenant: TenantCreate):
    # Check if room is vacant
    room_response = supabase.table("rooms").select("status").eq("id", str(tenant.room_id)).execute()
    if not room_response.data or room_response.data[0]['status'] != 'vacant':
        raise HTTPException(status_code=400, detail="Room is not vacant or does not exist")

    # Create tenant
    response = supabase.table("tenants").insert(tenant.dict()).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Could not create tenant")
    
    # Update room status to occupied
    supabase.table("rooms").update({"status": "occupied"}).eq("id", str(tenant.room_id)).execute()
    
    return response.data[0]

@router.delete("/{tenant_id}")
def remove_tenant(tenant_id: str):
    # Get tenant to find room_id
    tenant_res = supabase.table("tenants").select("room_id").eq("id", tenant_id).execute()
    if not tenant_res.data:
        raise HTTPException(status_code=404, detail="Tenant not found")
    
    room_id = tenant_res.data[0]['room_id']
    
    # Delete tenant
    response = supabase.table("tenants").delete().eq("id", tenant_id).execute()
    
    # Update room status to vacant
    supabase.table("rooms").update({"status": "vacant"}).eq("id", room_id).execute()
    
    return {"message": "Tenant removed and room marked as vacant"}
