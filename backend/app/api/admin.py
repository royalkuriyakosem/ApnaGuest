from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.sql_models import User, Room, Allocation, RoomStatus, Complaint, ComplaintStatus
from app.api.deps import get_current_admin
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()

class TenantResponse(BaseModel):
    id: int
    email: str
    full_name: str
    is_approved: bool
    role: str

    class Config:
        from_attributes = True

class RoomResponse(BaseModel):
    id: int
    room_number: str
    capacity: int
    rent: float
    status: str

    class Config:
        from_attributes = True

class AllocationCreate(BaseModel):
    tenant_id: int
    room_id: int

class ApproveTenantRequest(BaseModel):
    room_id: int

@router.get("/pending-tenants", response_model=List[TenantResponse])
def get_pending_tenants(db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    return db.query(User).filter(User.role == "tenant", User.is_approved == False).all()

@router.get("/tenants", response_model=List[TenantResponse])
def get_all_tenants(db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    return db.query(User).filter(User.role == "tenant", User.is_approved == True).all()

@router.put("/approve-tenant/{tenant_id}")
def approve_tenant(tenant_id: int, request: ApproveTenantRequest, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    tenant = db.query(User).filter(User.id == tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    
    # Check if room exists and is available
    room = db.query(Room).filter(Room.id == request.room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    if room.status != RoomStatus.AVAILABLE:
        raise HTTPException(status_code=400, detail="Room is not available")

    # Approve tenant
    tenant.is_approved = True
    
    # Allocate room
    new_allocation = Allocation(
        tenant_id=tenant.id,
        room_id=room.id,
        check_in_date=datetime.utcnow()
    )
    
    # Update room status
    room.status = RoomStatus.OCCUPIED
    
    db.add(new_allocation)
    db.commit()
    return {"message": f"Tenant {tenant.email} approved and allocated to Room {room.room_number}"}

@router.get("/rooms", response_model=List[RoomResponse])
def get_rooms(db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    return db.query(Room).all()

@router.post("/allot-room")
def allot_room(allocation: AllocationCreate, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    # 1. Check if tenant exists and is approved
    tenant = db.query(User).filter(User.id == allocation.tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    if not tenant.is_approved:
        raise HTTPException(status_code=400, detail="Tenant is not approved")
    
    # 2. Check if tenant already has a room
    existing_allocation = db.query(Allocation).filter(Allocation.tenant_id == tenant.id, Allocation.check_out_date == None).first()
    if existing_allocation:
        raise HTTPException(status_code=400, detail="Tenant already has a room allocated")

    # 3. Check if room exists and is available
    room = db.query(Room).filter(Room.id == allocation.room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    if room.status != RoomStatus.AVAILABLE:
        raise HTTPException(status_code=400, detail="Room is not available")

    # 4. Create allocation
    new_allocation = Allocation(
        tenant_id=tenant.id,
        room_id=room.id,
        check_in_date=datetime.utcnow()
    )
    
    # 5. Update room status
    room.status = RoomStatus.OCCUPIED
    
    db.add(new_allocation)
    db.commit()
    
    return {"message": "Room allocated successfully"}

@router.get("/stats")
def get_admin_stats(db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    total_tenants = db.query(User).filter(User.role == "tenant").count()
    pending_approvals = db.query(User).filter(User.role == "tenant", User.is_approved == False).count()
    total_rooms = db.query(Room).count()
    active_complaints = db.query(Complaint).filter(
        Complaint.status.in_([ComplaintStatus.OPEN, ComplaintStatus.IN_PROGRESS])
    ).count()

    return {
        "total_tenants": total_tenants,
        "pending_approvals": pending_approvals,
        "total_rooms": total_rooms,
        "active_complaints": active_complaints
    }
