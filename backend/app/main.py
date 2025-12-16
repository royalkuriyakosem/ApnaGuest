from fastapi import FastAPI
from app.core.config import supabase
from app.api import rooms, complaints, tenants, users, agents
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="ApnaGuest API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(rooms.router, prefix="/api/rooms", tags=["Rooms"])
app.include_router(complaints.router, prefix="/api/complaints", tags=["Complaints"])
app.include_router(tenants.router, prefix="/api/tenants", tags=["Tenants"])
app.include_router(agents.router, prefix="/api/agents", tags=["Agents"])

@app.get("/")
def read_root():
    return {"message": "Welcome to PG Management System API"}

@app.get("/health")
def health_check():
    return {"status": "ok", "supabase_connected": bool(supabase)}
