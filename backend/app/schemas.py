from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class UserBase(BaseModel):
    email: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class ConfigUpdate(BaseModel):
    api_keys: Optional[Dict[str, str]] = None
    custom_instructions: Optional[str] = None
    model_preference: Optional[str] = None
    generation_controls: Optional[Dict[str, Any]] = None

class UserConfig(ConfigUpdate):
    user_id: int

class ChatRequest(BaseModel):
    message: str
    model_id: Optional[str] = None
    conversation_id: Optional[int] = None
    use_vault: bool = True
    active_files: List[str] = [] # Filenames to focus on

class DocumentMetadata(BaseModel):
    id: int
    filename: str
    file_type: str
    upload_date: datetime

class ConversationBase(BaseModel):
    id: int
    title: str
    created_at: datetime
    
class MessageBase(BaseModel):
    role: str
    content: str
    timestamp: datetime
