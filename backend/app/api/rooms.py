from fastapi import APIRouter, HTTPException, Depends
from typing import List
from app.core.config import supabase
from app.models.schemas import Room, RoomCreate, RoomUpdate

router = APIRouter()

@router.get("/", response_model=List[Room])
def get_rooms():
    response = supabase.table("rooms").select("*").execute()
    return response.data

@router.post("/", response_model=Room)
def create_room(room: RoomCreate):
    response = supabase.table("rooms").insert(room.dict()).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Could not create room")
    return response.data[0]

@router.get("/{room_id}", response_model=Room)
def get_room(room_id: str):
    response = supabase.table("rooms").select("*").eq("id", room_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Room not found")
    return response.data[0]

@router.put("/{room_id}", response_model=Room)
def update_room(room_id: str, room: RoomUpdate):
    response = supabase.table("rooms").update(room.dict(exclude_unset=True)).eq("id", room_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Room not found or update failed")
    return response.data[0]

@router.delete("/{room_id}")
def delete_room(room_id: str):
    response = supabase.table("rooms").delete().eq("id", room_id).execute()
    return {"message": "Room deleted successfully"}
