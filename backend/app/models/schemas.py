from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import date, datetime
from enum import Enum
from uuid import UUID

# Enums (matching sql_models)
class UserRole(str, Enum):
    admin = "admin"
    tenant = "tenant"
    service_agent = "service_agent"

class RoomStatus(str, Enum):
    vacant = "vacant"
    occupied = "occupied"
    maintenance = "maintenance"

class ComplaintStatus(str, Enum):
    open = "open"
    in_progress = "in_progress"
    resolved = "resolved"

class ServiceType(str, Enum):
    plumber = "plumber"
    electrician = "electrician"
    cleaner = "cleaner"
    other = "other"

class PaymentStatus(str, Enum):
    paid = "paid"
    pending = "pending"
    overdue = "overdue"

# User/Auth Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    role: UserRole = UserRole.tenant
    is_active: bool = True

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: UUID
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

# Service Agent Schemas
class ServiceAgentBase(BaseModel):
    service_type: ServiceType
    experience_years: int = 0
    rating: float = 0.0
    is_verified: bool = False

class ServiceAgentCreate(ServiceAgentBase):
    user_id: UUID

class ServiceAgentResponse(ServiceAgentBase):
    id: UUID
    user_id: UUID
    user: Optional[UserResponse] = None

    class Config:
        from_attributes = True

# Room Schemas
class RoomBase(BaseModel):
    room_number: str
    floor: int
    rent_amount: float
    capacity: int = 1
    status: RoomStatus = RoomStatus.vacant

class RoomCreate(RoomBase):
    pass

class RoomUpdate(BaseModel):
    room_number: Optional[str] = None
    floor: Optional[int] = None
    rent_amount: Optional[float] = None
    capacity: Optional[int] = None
    status: Optional[RoomStatus] = None

class RoomResponse(RoomBase):
    id: UUID
    
    class Config:
        from_attributes = True

# Tenant/Allocation Schemas
class TenantBase(BaseModel):
    room_id: UUID
    check_in_date: Optional[datetime] = None
    check_out_date: Optional[datetime] = None

class TenantCreate(TenantBase):
    user_id: UUID

class TenantResponse(TenantBase):
    id: UUID
    user_id: UUID
    user: Optional[UserResponse] = None
    room: Optional[RoomResponse] = None

    class Config:
        from_attributes = True

# Complaint Schemas
class ComplaintBase(BaseModel):
    title: Optional[str] = None
    description: str
    service_type: ServiceType = ServiceType.other
    room_id: Optional[UUID] = None

class ComplaintCreate(ComplaintBase):
    pass

class ComplaintUpdate(BaseModel):
    status: Optional[ComplaintStatus] = None
    assigned_agent_id: Optional[UUID] = None

class ComplaintResponse(ComplaintBase):
    id: UUID
    tenant_id: UUID # Reporter
    status: ComplaintStatus
    assigned_agent_id: Optional[UUID] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Payment Schemas
class PaymentBase(BaseModel):
    amount: float
    month_for: str
    status: PaymentStatus = PaymentStatus.pending
    transaction_id: Optional[str] = None

class PaymentCreate(PaymentBase):
    tenant_id: UUID

class PaymentResponse(PaymentBase):
    id: UUID
    tenant_id: UUID
    payment_date: datetime
    
    class Config:
        from_attributes = True
