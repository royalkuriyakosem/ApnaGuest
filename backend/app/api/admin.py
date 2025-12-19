from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from app.core.database import get_db
from app.models.sql_models import User, Room, Tenant, RoomStatus, Complaint, ComplaintStatus
from app.api.deps import get_current_admin
from app.models.schemas import UserResponse, RoomResponse, TenantCreate
from datetime import datetime

router = APIRouter()

@router.get("/pending-tenants", response_model=List[UserResponse])
def get_pending_tenants(db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    # Users with role='tenant' who do NOT have a Tenant record
    # This is a bit complex in SQLA, maybe list all tenants and filter in python or use left join
    # For simplicity/speed:
    assigned_user_ids = db.query(Tenant.user_id).all()
    assigned_ids = [uid[0] for uid in assigned_user_ids]
    
    pending = db.query(User).filter(
        User.role == "tenant",
        User.id.notin_(assigned_ids)
    ).all()
    return pending

@router.get("/tenants", response_model=List[UserResponse])
def get_all_tenants(db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    # Users who ARE assigned to a room
    assigned_user_ids = db.query(Tenant.user_id).all()
    assigned_ids = [uid[0] for uid in assigned_user_ids]
    
    tenants = db.query(User).filter(User.id.in_(assigned_ids)).all()
    return tenants

@router.post("/allot-room")
def allot_room(allocation: TenantCreate, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    # 1. Check if user exists
    user = db.query(User).filter(User.id == allocation.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if already has a room
    existing = db.query(Tenant).filter(Tenant.user_id == user.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="User already has a room allocated")

    # 2. Check room
    room = db.query(Room).filter(Room.id == allocation.room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    if room.status != RoomStatus.VACANT:
        raise HTTPException(status_code=400, detail="Room is not vacant")

    # 3. Create Tenant record (Allocation)
    new_tenant = Tenant(
        user_id=user.id,
        room_id=room.id,
        check_in_date=allocation.check_in_date or datetime.utcnow(),
        check_out_date=allocation.check_out_date
    )
    
    # 4. Update room status
    room.status = RoomStatus.OCCUPIED
    
    db.add(new_tenant)
    db.commit()
    return {"message": "Room allocated successfully"}

@router.get("/rooms", response_model=List[RoomResponse])
def get_rooms(db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    return db.query(Room).all()

@router.get("/stats")
def get_admin_stats(db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    total_tenants = db.query(Tenant).count() # Active tenants with rooms
    total_users = db.query(User).filter(User.role == "tenant").count()
    pending_allocations = total_users - total_tenants
    
    total_rooms = db.query(Room).count()
    active_complaints = db.query(Complaint).filter(
        Complaint.status.in_([ComplaintStatus.OPEN, ComplaintStatus.IN_PROGRESS])
    ).count()

    return {
        "total_tenants": total_tenants,
        "pending_allocations": pending_allocations,
        "total_rooms": total_rooms,
        "active_complaints": active_complaints
    }
