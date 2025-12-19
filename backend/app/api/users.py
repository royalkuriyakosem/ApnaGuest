from fastapi import APIRouter, HTTPException, Depends
from typing import List
from uuid import UUID
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.sql_models import User
from app.models.schemas import UserResponse
from app.api.deps import get_current_user

router = APIRouter()

@router.get("/", response_model=List[UserResponse])
def get_profiles(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(User).all()

@router.get("/{user_id}", response_model=UserResponse)
def get_profile(user_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Profile not found")
    return user
