from fastapi import APIRouter, HTTPException, Depends
from typing import List
from uuid import UUID
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.sql_models import Tenant as TenantModel, Room, User, RoomStatus, UserRole
from app.models.schemas import TenantResponse, TenantCreate
from app.api.deps import get_current_admin, get_current_user

router = APIRouter()

@router.get("/", response_model=List[TenantResponse])
def get_tenants(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Admin can see all.
    if current_user.role == UserRole.ADMIN:
        return db.query(TenantModel).all()
    else:
        # Tenant can see own? Or forbidden?
        # Let's return own profile
         return db.query(TenantModel).filter(TenantModel.user_id == current_user.id).all()

@router.post("/", response_model=TenantResponse)
def create_tenant_admin(tenant: TenantCreate, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    # This duplicates /admin/allot-room logic but keeps /tenants endpoint alive
    
    # Check room
    room = db.query(Room).filter(Room.id == tenant.room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    if room.status != RoomStatus.VACANT:
        raise HTTPException(status_code=400, detail="Room is not vacant")

    # Create tenant
    new_tenant = TenantModel(
        user_id=tenant.user_id,
        room_id=room.id,
        check_in_date=tenant.check_in_date,
        check_out_date=tenant.check_out_date
    )
    
    # Update room
    room.status = RoomStatus.OCCUPIED
    
    db.add(new_tenant)
    db.commit()
    db.refresh(new_tenant)
    return new_tenant

@router.delete("/{tenant_id}")
def remove_tenant(tenant_id: UUID, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    # tenant_id here refers to the ID of the Tenant record (allocation), NOT the user ID
    tenant_record = db.query(TenantModel).filter(TenantModel.id == tenant_id).first()
    if not tenant_record:
        raise HTTPException(status_code=404, detail="Tenant record not found")
    
    room_id = tenant_record.room_id
    
    db.delete(tenant_record)
    
    # Update room status
    room = db.query(Room).filter(Room.id == room_id).first()
    if room:
        room.status = RoomStatus.VACANT
    
    db.commit()
    return {"message": "Tenant removed and room marked as vacant"}
