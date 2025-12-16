from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, DateTime, Float, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.core.database import Base

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    TENANT = "tenant"
    SERVICE_AGENT = "service_agent"

class RoomStatus(str, enum.Enum):
    AVAILABLE = "available"
    OCCUPIED = "occupied"
    MAINTENANCE = "maintenance"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=True)
    password_hash = Column(String, nullable=False)
    role = Column(SQLEnum(UserRole), default=UserRole.TENANT, nullable=False)
    is_approved = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    allocation = relationship("Allocation", back_populates="tenant", uselist=False)
    payments = relationship("Payment", back_populates="tenant")

class Room(Base):
    __tablename__ = "rooms"

    id = Column(Integer, primary_key=True, index=True)
    room_number = Column(String, unique=True, index=True, nullable=False)
    capacity = Column(Integer, default=1)
    rent = Column(Float, nullable=False)
    status = Column(SQLEnum(RoomStatus), default=RoomStatus.AVAILABLE)

    # Relationships
    allocation = relationship("Allocation", back_populates="room", uselist=False)

class Allocation(Base):
    __tablename__ = "allocations"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    room_id = Column(Integer, ForeignKey("rooms.id"), unique=True, nullable=False)
    check_in_date = Column(DateTime(timezone=True), server_default=func.now())
    check_out_date = Column(DateTime(timezone=True), nullable=True)

    tenant = relationship("User", back_populates="allocation")
    room = relationship("Room", back_populates="allocation")

class ComplaintStatus(str, enum.Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    CLOSED = "closed"

class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    room_id = Column(Integer, ForeignKey("rooms.id"), nullable=False)
    description = Column(String, nullable=False)
    status = Column(SQLEnum(ComplaintStatus), default=ComplaintStatus.OPEN)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # We can add relationships if needed, but for stats we just need the table query

class PaymentStatus(str, enum.Enum):
    PAID = "paid"
    PENDING = "pending"
    OVERDUE = "overdue"

class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount = Column(Float, nullable=False)
    payment_date = Column(DateTime(timezone=True), server_default=func.now())
    status = Column(SQLEnum(PaymentStatus), default=PaymentStatus.PENDING)
    month_for = Column(String, nullable=False) # e.g. "October 2023"
    transaction_id = Column(String, nullable=True)
    
    tenant = relationship("User", back_populates="payments")

# Update User model to include payments relationship
# We need to add this to the User class above, but since we are appending, we can't easily modify the User class in place without a multi-replace or careful replace.
# Actually, I should check if I can add the relationship to User class.
# Let's just add the Payment model first. I will update User class in a separate step if needed, or just rely on back_populates if I update User.
# Wait, I need to update User class to have `payments = relationship("Payment", back_populates="tenant")`


