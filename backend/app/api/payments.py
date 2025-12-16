from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.sql_models import User, Payment, PaymentStatus
from app.api.deps import get_current_user, get_current_admin
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()

class PaymentResponse(BaseModel):
    id: int
    amount: float
    payment_date: datetime
    status: str
    month_for: str
    transaction_id: str = None
    tenant_name: str = None # Optional, for admin view

    class Config:
        from_attributes = True

class PaymentCreate(BaseModel):
    tenant_id: int
    amount: float
    month_for: str
    status: str = "paid"
    transaction_id: str = None

class PaymentSubmit(BaseModel):
    amount: float
    month_for: str
    transaction_id: str

@router.get("/my-history", response_model=List[PaymentResponse])
def get_my_payments(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Payment).filter(Payment.tenant_id == current_user.id).order_by(Payment.payment_date.desc()).all()

@router.get("/all", response_model=List[PaymentResponse])
def get_all_payments(db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    payments = db.query(Payment).order_by(Payment.payment_date.desc()).all()
    response = []
    for p in payments:
        p_dict = p.__dict__
        if p.tenant:
            p_dict['tenant_name'] = p.tenant.full_name or p.tenant.email
        response.append(p_dict)
    return response

@router.post("/submit")
def submit_payment(payment: PaymentSubmit, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_payment = Payment(
        tenant_id=current_user.id,
        amount=payment.amount,
        month_for=payment.month_for,
        transaction_id=payment.transaction_id,
        status=PaymentStatus.PENDING
    )
    db.add(new_payment)
    db.commit()
    db.refresh(new_payment)
    return {"message": "Payment submitted successfully", "id": new_payment.id}

@router.put("/{payment_id}/approve")
def approve_payment(payment_id: int, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    payment.status = PaymentStatus.PAID
    db.commit()
    return {"message": "Payment approved successfully"}

@router.put("/{payment_id}/reject")
def reject_payment(payment_id: int, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    payment.status = PaymentStatus.OVERDUE # Or some other rejected status, but overdue makes sense if they need to pay again
    db.commit()
    return {"message": "Payment rejected"}

@router.post("/record")
def record_payment(payment: PaymentCreate, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    tenant = db.query(User).filter(User.id == payment.tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    
    new_payment = Payment(
        tenant_id=payment.tenant_id,
        amount=payment.amount,
        month_for=payment.month_for,
        status=payment.status,
        transaction_id=payment.transaction_id
    )
    db.add(new_payment)
    db.commit()
    db.refresh(new_payment)
    return {"message": "Payment recorded successfully", "id": new_payment.id}
