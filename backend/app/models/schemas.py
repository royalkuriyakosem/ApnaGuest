from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import date, datetime
from enum import Enum
from uuid import UUID

# Enums
class UserRole(str, Enum):
    admin = "admin"
    tenant = "tenant"
    service_agent = "service_agent"

class ServiceType(str, Enum):
    plumber = "plumber"
    electrician = "electrician"
    cleaner = "cleaner"
    other = "other"

class AvailabilityStatus(str, Enum):
    available = "available"
    busy = "busy"
    inactive = "inactive"

class ComplaintStatus(str, Enum):
    open = "open"
    assigned = "assigned"
    in_progress = "in_progress"
    resolved = "resolved"

class TaskStatus(str, Enum):
    assigned = "assigned"
    in_progress = "in_progress"
    completed = "completed"

class RoomStatus(str, Enum):
    vacant = "vacant"
    occupied = "occupied"
    maintenance = "maintenance"

# Profile Schemas
class ProfileBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    address: Optional[str] = None
    aadhaar_id: Optional[str] = None
    role: UserRole = UserRole.tenant
    is_active: bool = True

class ProfileCreate(ProfileBase):
    password: str

class Profile(ProfileBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

# Service Agent Schemas
class ServiceAgentBase(BaseModel):
    service_type: ServiceType
    experience_years: int = 0
    availability_status: AvailabilityStatus = AvailabilityStatus.available
    is_approved: bool = False
    rating: float = 0.0

class ServiceAgentCreate(ServiceAgentBase):
    user_id: UUID

class ServiceAgent(ServiceAgentBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    # Optional: Include profile details if joined
    profile: Optional[Profile] = None

    class Config:
        from_attributes = True

# Complaint Schemas
class ComplaintBase(BaseModel):
    service_type: ServiceType
    description: str
    room_id: Optional[UUID] = None

class ComplaintCreate(ComplaintBase):
    pass

class ComplaintUpdate(BaseModel):
    status: Optional[ComplaintStatus] = None
    agent_id: Optional[UUID] = None

class Complaint(ComplaintBase):
    id: UUID
    tenant_id: UUID
    agent_id: Optional[UUID] = None
    status: ComplaintStatus
    created_at: datetime
    updated_at: datetime
    
    # Optional: Include related data
    tenant: Optional[Profile] = None
    agent: Optional[ServiceAgent] = None

    class Config:
        from_attributes = True

# Agent Rating Schemas
class AgentRatingBase(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    feedback: Optional[str] = None

class AgentRatingCreate(AgentRatingBase):
    complaint_id: UUID
    agent_id: UUID

class AgentRating(AgentRatingBase):
    id: UUID
    tenant_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

# Room Schemas
class RoomBase(BaseModel):
    room_number: str
    capacity: int
    floor: int
    status: RoomStatus = RoomStatus.vacant

class RoomCreate(RoomBase):
    pass

class RoomUpdate(BaseModel):
    room_number: Optional[str] = None
    capacity: Optional[int] = None
    floor: Optional[int] = None
    status: Optional[RoomStatus] = None

class Room(RoomBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

# Tenant Schemas
class TenantBase(BaseModel):
    room_id: UUID
    check_in_date: date
    check_out_date: Optional[date] = None
    rent_amount: float

class TenantCreate(TenantBase):
    user_id: UUID

class Tenant(TenantBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    
    # Optional: Include related data
    user: Optional[Profile] = None
    room: Optional[Room] = None

    class Config:
        from_attributes = True
