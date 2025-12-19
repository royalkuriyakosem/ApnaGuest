import uuid
from sqlalchemy import Column, String, Integer, Float, Boolean, ForeignKey, DateTime, Enum as SQLEnum, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.core.database import Base

# Enums
class UserRole(str, enum.Enum):
    ADMIN = "admin"
    TENANT = "tenant"
    SERVICE_AGENT = "service_agent"

class RoomStatus(str, enum.Enum):
    VACANT = "vacant"
    OCCUPIED = "occupied"
    MAINTENANCE = "maintenance"

class ComplaintStatus(str, enum.Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"

class PaymentStatus(str, enum.Enum):
    PAID = "paid"
    PENDING = "pending"
    OVERDUE = "overdue"

class ServiceType(str, enum.Enum):
    PLUMBER = "plumber"
    ELECTRICIAN = "electrician"
    CLEANER = "cleaner"
    OTHER = "other"

# Models

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    # Add password_hash
    password_hash = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    role = Column(SQLEnum(UserRole), default=UserRole.TENANT, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    tenant_profile = relationship("Tenant", back_populates="user", uselist=False, cascade="all, delete-orphan")
    service_agent_profile = relationship("ServiceAgent", back_populates="user", uselist=False, cascade="all, delete-orphan")
    complaints_reported = relationship("Complaint", foreign_keys="[Complaint.tenant_id]", back_populates="reporter")
    complaints_assigned = relationship("Complaint", foreign_keys="[Complaint.assigned_agent_id]", back_populates="assignee")
    payments = relationship("Payment", back_populates="user")

class ServiceAgent(Base): 
    __tablename__ = "service_agents"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False)
    service_type = Column(SQLEnum(ServiceType), default=ServiceType.OTHER, nullable=False)
    experience_years = Column(Integer, default=0)
    rating = Column(Float, default=0.0)
    is_verified = Column(Boolean, default=False)
    
    user = relationship("User", back_populates="service_agent_profile")

class Room(Base):
    __tablename__ = "rooms"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    room_number = Column(String, unique=True, index=True, nullable=False)
    floor = Column(Integer, nullable=False)
    rent_amount = Column(Float, nullable=False)
    capacity = Column(Integer, default=1)
    status = Column(SQLEnum(RoomStatus), default=RoomStatus.VACANT)
    
    # Relationships
    tenants = relationship("Tenant", back_populates="room")
    complaints = relationship("Complaint", back_populates="room")

class Tenant(Base):
    __tablename__ = "tenants"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False)
    room_id = Column(UUID(as_uuid=True), ForeignKey("rooms.id"), nullable=False)
    check_in_date = Column(DateTime(timezone=True), server_default=func.now())
    check_out_date = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="tenant_profile")
    room = relationship("Room", back_populates="tenants")

class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False) # Reporter (Tenant)
    room_id = Column(UUID(as_uuid=True), ForeignKey("rooms.id"), nullable=True)
    title = Column(String, nullable=True) # made optional as frontend doesnt send it
    description = Column(Text, nullable=False)
    service_type = Column(SQLEnum(ServiceType), default=ServiceType.OTHER, nullable=False)
    status = Column(SQLEnum(ComplaintStatus), default=ComplaintStatus.OPEN)
    assigned_agent_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    reporter = relationship("User", foreign_keys=[tenant_id], back_populates="complaints_reported")
    assignee = relationship("User", foreign_keys=[assigned_agent_id], back_populates="complaints_assigned")
    room = relationship("Room", back_populates="complaints")

class Payment(Base):
    __tablename__ = "payments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False) # Link to User (Tenant)
    amount = Column(Float, nullable=False)
    payment_date = Column(DateTime(timezone=True), server_default=func.now())
    month_for = Column(String, nullable=False)
    status = Column(SQLEnum(PaymentStatus), default=PaymentStatus.PENDING)
    transaction_id = Column(String, nullable=True)

    # Relationships
    user = relationship("User", back_populates="payments")
