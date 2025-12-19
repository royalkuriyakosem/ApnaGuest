from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from datetime import datetime
from app.core.database import get_db
from app.models.sql_models import User, Payment, PaymentStatus
from app.models.schemas import PaymentResponse, PaymentCreate
from app.api.deps import get_current_user, get_current_admin

router = APIRouter()

@router.get("/my-history", response_model=List[PaymentResponse])
def get_my_payments(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Payment).filter(Payment.tenant_id == current_user.id).order_by(Payment.payment_date.desc()).all()

@router.get("/all", response_model=List[PaymentResponse])
def get_all_payments(db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    payments = db.query(Payment).order_by(Payment.payment_date.desc()).all()
    # Schema handles conversion, but if we needed formatted names, we can relying on schema or enrich here
    return payments

@router.post("/submit", response_model=PaymentResponse)
def submit_payment(payment: PaymentCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Verify user_id in payment matches current_user (security check)
    # Actually, usually submit payment assumes current user.
    # But schema assumes ID is passed.
    # Let's override it to be safe
    
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
    return new_payment

@router.put("/{payment_id}/approve")
def approve_payment(payment_id: UUID, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    payment.status = PaymentStatus.PAID
    db.commit()
    return {"message": "Payment approved successfully"}

@router.put("/{payment_id}/reject")
def reject_payment(payment_id: UUID, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    payment.status = PaymentStatus.OVERDUE
    db.commit()
    return {"message": "Payment rejected"}

@router.post("/record")
def record_payment(payment: PaymentCreate, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    tenant = db.query(User).filter(User.id == payment.tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant/User not found")
    
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
