from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine, Base
from app.models.sql_models import User, UserRole, Room, RoomStatus
from app.core.security import get_password_hash

def seed_data():
    db = SessionLocal()
    
    # 1. Seed Rooms
    rooms = [
        {"room_number": "101", "capacity": 2, "rent": 5000.0, "status": RoomStatus.AVAILABLE},
        {"room_number": "102", "capacity": 1, "rent": 8000.0, "status": RoomStatus.AVAILABLE},
        {"room_number": "103", "capacity": 3, "rent": 4000.0, "status": RoomStatus.MAINTENANCE},
    ]
    
    for r in rooms:
        existing = db.query(Room).filter(Room.room_number == r["room_number"]).first()
        if not existing:
            db.add(Room(**r))
            print(f"Created Room {r['room_number']}")

    # 2. Seed Users
    users = [
        {
            "email": "tenant1@example.com",
            "password": "password",
            "full_name": "John Doe (Approved)",
            "role": UserRole.TENANT,
            "is_approved": True
        },
        {
            "email": "tenant2@example.com",
            "password": "password",
            "full_name": "Jane Smith (Pending)",
            "role": UserRole.TENANT,
            "is_approved": False
        },
        {
            "email": "agent1@example.com",
            "password": "password",
            "full_name": "Mike Plumber",
            "role": UserRole.SERVICE_AGENT,
            "is_approved": True
        }
    ]

    for u in users:
        existing = db.query(User).filter(User.email == u["email"]).first()
        if not existing:
            u["password_hash"] = get_password_hash(u.pop("password"))
            db.add(User(**u))
            print(f"Created User {u['email']}")

    db.commit()
    db.close()

if __name__ == "__main__":
    print("Seeding dummy data...")
    seed_data()
    print("Done!")

# Helper functions for extended seeding
def create_allocations(db: Session):
    # Allocate approved tenants to available rooms (first fit)
    approved_tenants = db.query(User).filter(User.role == UserRole.TENANT, User.is_approved == True).all()
    available_rooms = db.query(Room).filter(Room.status == RoomStatus.AVAILABLE).all()
    for tenant, room in zip(approved_tenants, available_rooms):
        # Create allocation
        allocation = Allocation(tenant_id=tenant.id, room_id=room.id)
        db.add(allocation)
        # Mark room as occupied
        room.status = RoomStatus.OCCUPIED
        print(f"Allocated Tenant {tenant.email} to Room {room.room_number}")
    db.commit()

def create_complaints(db: Session):
    # Simple complaint from first tenant about plumbing
    tenant = db.query(User).filter(User.email == "tenant1@example.com").first()
    agent = db.query(User).filter(User.role == UserRole.SERVICE_AGENT).first()
    room = db.query(Room).join(Allocation, Allocation.room_id == Room.id).filter(Allocation.tenant_id == tenant.id).first()
    if tenant and agent and room:
        complaint = {
            "tenant_id": tenant.id,
            "room_id": room.id,
            "service_type": "plumber",
            "agent_id": agent.id,
            "description": "Leaking faucet in bathroom",
            "status": "open",
        }
        # Direct insert using SQLAlchemy core for simplicity
        from sqlalchemy import insert, table, column, text
        complaints_table = table('complaints', column('id'), column('tenant_id'), column('room_id'), column('service_type'), column('agent_id'), column('description'), column('status'))
        db.execute(insert(complaints_table).values(**complaint))
        print("Created complaint for tenant1")
    db.commit()

def create_service_tasks_and_ratings(db: Session):
    # Assume the complaint created above has id 1 (since SQLite autoincrement starts at 1)
    complaint_id = db.execute(text('SELECT id FROM complaints WHERE description = :desc'), {'desc': 'Leaking faucet in bathroom'}).scalar()
    if complaint_id:
        # Create a service task linked to the complaint and agent
        agent = db.query(User).filter(User.role == UserRole.SERVICE_AGENT).first()
        task = {
            "complaint_id": complaint_id,
            "agent_id": agent.id,
            "status": "assigned",
        }
        service_tasks_table = table('service_tasks', column('id'), column('complaint_id'), column('agent_id'), column('status'))
        db.execute(insert(service_tasks_table).values(**task))
        print("Created service task for complaint")
        # Create an agent rating for the completed task
        rating = {
            "agent_id": agent.id,
            "tenant_id": db.query(User).filter(User.email == "tenant1@example.com").first().id,
            "complaint_id": complaint_id,
            "rating": 5,
            "feedback": "Great service, quick fix!",
        }
        agent_ratings_table = table('agent_ratings', column('id'), column('agent_id'), column('tenant_id'), column('complaint_id'), column('rating'), column('feedback'))
        db.execute(insert(agent_ratings_table).values(**rating))
        print("Created agent rating")
    db.commit()

def seed_data():
    db = SessionLocal()
    # Existing room and user seeding (unchanged)
    # ... (previous code unchanged) ...
    # After committing users and rooms, add allocations and related data
    create_allocations(db)
    create_complaints(db)
    create_service_tasks_and_ratings(db)
    db.close()

