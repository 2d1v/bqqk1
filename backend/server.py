from fastapi import FastAPI, APIRouter, HTTPException, Query
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import httpx
from groq import Groq

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Groq client
groq_client = Groq(api_key=os.environ.get('GROQ_API_KEY'))

# Auth key
AUTH_KEY = "Āă↺↙₥Ⅱ₲ď℉⁐ↈă﷼↙ɱə"

# Whitelist
WHITELIST = ["Player1", "Player2", "TestUser"]

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# Models
class UserInfo(BaseModel):
    userId: int
    username: str
    displayName: str
    created: Optional[str] = None

class ScriptData(BaseModel):
    model_config = ConfigDict(extra="ignore")
    placeId: int
    userId: int
    CanExecutable: bool = False
    Source: str = ""
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ScriptDataUpdate(BaseModel):
    CanExecutable: Optional[bool] = None
    Source: Optional[str] = None

class ScriptHubItem(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    subtitle: str
    category: str  # Admin, Troll, Fun
    code: str

class ScriptHubItemCreate(BaseModel):
    title: str
    subtitle: str
    category: str
    code: str

class Tab(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    placeId: int
    userId: int
    name: str
    content: str = ""
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TabCreate(BaseModel):
    placeId: int
    userId: int
    name: str
    content: str = ""

class TabUpdate(BaseModel):
    name: Optional[str] = None
    content: Optional[str] = None

class ChatMessage(BaseModel):
    message: str
    placeId: Optional[int] = None
    userId: Optional[int] = None

class ChatResponse(BaseModel):
    response: str

# Roblox API via proxy
async def get_roblox_user(user_id: int) -> UserInfo:
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"https://users.roblox.com/v1/users/{user_id}")
            if response.status_code == 200:
                data = response.json()
                return UserInfo(
                    userId=data.get('id', user_id),
                    username=data.get('name', 'Unknown'),
                    displayName=data.get('displayName', 'Unknown'),
                    created=data.get('created')
                )
        except Exception as e:
            logging.error(f"Error fetching Roblox user: {e}")
    
    # Fallback
    return UserInfo(userId=user_id, username="Unknown", displayName="Unknown")

# Routes
@api_router.get("/")
async def root():
    return {"message": "Roblox Script Commander API"}

@api_router.get("/v1/user/{user_id}", response_model=UserInfo)
async def get_user_info(user_id: int):
    user_info = await get_roblox_user(user_id)
    return user_info

@api_router.get("/v1/place")
async def get_script_data(
    id: int = Query(..., alias="id"),
    user_id: int = Query(..., alias="user?id"),
    auth_key: str = Query(..., alias="auth?key")
):
    if auth_key != AUTH_KEY:
        raise HTTPException(status_code=403, detail="Invalid auth key")
    
    # Get user info
    user_info = await get_roblox_user(user_id)
    
    # Check whitelist
    if user_info.username not in WHITELIST:
        raise HTTPException(status_code=403, detail="User not whitelisted")
    
    # Get script data
    script_data = await db.script_data.find_one(
        {"placeId": id, "userId": user_id},
        {"_id": 0}
    )
    
    if not script_data:
        # Create default
        default_data = {
            "placeId": id,
            "userId": user_id,
            "CanExecutable": False,
            "Source": "",
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        await db.script_data.insert_one(default_data)
        return {"CanExecutable": False, "Source": ""}
    
    return {
        "CanExecutable": script_data.get("CanExecutable", False),
        "Source": script_data.get("Source", "")
    }

@api_router.post("/v1/place")
async def update_script_data(
    update: ScriptDataUpdate,
    id: int = Query(..., alias="id"),
    user_id: int = Query(..., alias="user?id"),
    auth_key: str = Query(..., alias="auth?key")
):
    if auth_key != AUTH_KEY:
        raise HTTPException(status_code=403, detail="Invalid auth key")
    
    # Get user info
    user_info = await get_roblox_user(user_id)
    
    # Check whitelist
    if user_info.username not in WHITELIST:
        raise HTTPException(status_code=403, detail="User not whitelisted")
    
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.script_data.update_one(
        {"placeId": id, "userId": user_id},
        {"$set": update_data},
        upsert=True
    )
    
    return {"status": "updated", **update_data}

# Script Hub
@api_router.get("/v1/scripts", response_model=List[ScriptHubItem])
async def get_scripts():
    scripts = await db.script_hub.find({}, {"_id": 0}).to_list(100)
    return scripts

@api_router.post("/v1/scripts", response_model=ScriptHubItem)
async def create_script(script: ScriptHubItemCreate):
    script_obj = ScriptHubItem(**script.model_dump())
    doc = script_obj.model_dump()
    await db.script_hub.insert_one(doc)
    return script_obj

# Tabs
@api_router.get("/v1/tabs")
async def get_tabs(placeId: int, userId: int):
    tabs = await db.tabs.find(
        {"placeId": placeId, "userId": userId},
        {"_id": 0}
    ).to_list(50)
    return tabs

@api_router.post("/v1/tabs", response_model=Tab)
async def create_tab(tab: TabCreate):
    tab_obj = Tab(**tab.model_dump())
    doc = tab_obj.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.tabs.insert_one(doc)
    return tab_obj

@api_router.put("/v1/tabs/{tab_id}")
async def update_tab(tab_id: str, update: TabUpdate):
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    result = await db.tabs.update_one(
        {"id": tab_id},
        {"$set": update_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Tab not found")
    return {"status": "updated"}

@api_router.delete("/v1/tabs/{tab_id}")
async def delete_tab(tab_id: str):
    result = await db.tabs.delete_one({"id": tab_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Tab not found")
    return {"status": "deleted"}

# AI Chat
@api_router.post("/v1/ai/chat", response_model=ChatResponse)
async def ai_chat(msg: ChatMessage):
    try:
        chat_completion = groq_client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful Roblox Luau coding assistant. You help write scripts, fix bugs, and provide code examples. Be concise and provide working Luau code."
                },
                {
                    "role": "user",
                    "content": msg.message
                }
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.7,
            max_tokens=1500
        )
        
        response_text = chat_completion.choices[0].message.content
        return ChatResponse(response=response_text)
    except Exception as e:
        logging.error(f"Groq API error: {e}")
        raise HTTPException(status_code=500, detail="AI service error")

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
