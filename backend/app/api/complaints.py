from fastapi import APIRouter, HTTPException, Depends
from typing import List
from uuid import UUID
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.sql_models import Complaint as ComplaintModel, User, UserRole
from app.models.schemas import ComplaintResponse, ComplaintCreate, ComplaintUpdate
from app.api.deps import get_current_user

router = APIRouter()

@router.get("/", response_model=List[ComplaintResponse])
def get_complaints(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # If admin, show all. If tenant, show own.
    if current_user.role == UserRole.ADMIN:
        return db.query(ComplaintModel).order_by(ComplaintModel.created_at.desc()).all()
    else:
        return db.query(ComplaintModel).filter(ComplaintModel.tenant_id == current_user.id).order_by(ComplaintModel.created_at.desc()).all()

@router.post("/", response_model=ComplaintResponse)
def create_complaint(complaint: ComplaintCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_complaint = ComplaintModel(
        tenant_id=current_user.id,
        room_id=complaint.room_id,
        title=complaint.title,
        description=complaint.description,
        service_type=complaint.service_type
    )
    db.add(new_complaint)
    db.commit()
    db.refresh(new_complaint)
    return new_complaint

@router.put("/{complaint_id}", response_model=ComplaintResponse)
def update_complaint(complaint_id: UUID, complaint: ComplaintUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_complaint = db.query(ComplaintModel).filter(ComplaintModel.id == complaint_id).first()
    if not db_complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
        
    # Permission check: Only admin or assigned agent can update status/assignment
    # Tenant can update description? For now let's allow updates if admin.
    if current_user.role != UserRole.ADMIN and current_user.id != db_complaint.assigned_agent_id:
         raise HTTPException(status_code=403, detail="Not authorized to update this complaint")

    update_data = complaint.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_complaint, key, value)
    
    db.commit()
    db.refresh(db_complaint)
    return db_complaint
