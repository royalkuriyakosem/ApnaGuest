from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from app.core.database import engine, Base, get_db
from app.models.sql_models import User, UserRole
from app.core.security import get_password_hash
from app.api import auth, admin, payments, rooms

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="ApnaGuest Strict Backend")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Seed Admin User on Startup
@app.on_event("startup")
def seed_admin():
    db = next(get_db())
    admin_email = "nair@gmail.com"
    existing_admin = db.query(User).filter(User.email == admin_email).first()
    
    if not existing_admin:
        print("Seeding Admin User...")
        admin_user = User(
            email=admin_email,
            password_hash=get_password_hash("123456"),
            full_name="System Admin",
            role=UserRole.ADMIN,
            is_active=True
        )
        db.add(admin_user)
        db.commit()
        print("Admin seeded successfully.")
    else:
        existing_admin.password_hash = get_password_hash("123456")
        db.commit()
        print("Admin password updated to 123456.")

app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(payments.router, prefix="/api/payments", tags=["Payments"])
app.include_router(rooms.router, prefix="/api/rooms", tags=["Rooms"])

@app.get("/")
def read_root():
    return {"message": "ApnaGuest Strict Backend Running"}

@app.get("/health")
def health_check():
    return {"status": "ok"}
