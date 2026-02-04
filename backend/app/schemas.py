from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class UserBase(BaseModel):
    email: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    username: Optional[str] = None
    avatar_path: Optional[str] = None
    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class ConfigUpdate(BaseModel):
    api_keys: Optional[Dict[str, str]] = None
    custom_instructions: Optional[str] = None
    context_script: Optional[str] = None
    custom_context: Optional[str] = None
    model_preference: Optional[str] = None
    generation_controls: Optional[Dict[str, Any]] = None
    settings: Optional[Dict[str, Any]] = None
    mind_maps: Optional[List[Dict[str, Any]]] = None

class UserConfig(ConfigUpdate):
    user_id: int

class ChatRequest(BaseModel):
    message: str
    model_id: Optional[str] = None
    provider: Optional[str] = None
    conversation_id: Optional[int] = None
    use_vault: bool = True
    use_context_history: bool = False
    max_iterations: int = 7
    active_files: List[str] = [] # Filenames to focus on

class DocumentSummary(BaseModel):
    """Document metadata without content - for list endpoint"""
    id: int
    doc_id: str
    filename: str
    file_type: str
    enabled: bool
    upload_date: datetime
    
    class Config:
        from_attributes = True

class DocumentMetadata(BaseModel):
    """Full document metadata with content - for create/update operations"""
    id: int
    doc_id: str
    filename: str
    file_type: str
    content: str
    enabled: bool
    upload_date: datetime
    
    class Config:
        from_attributes = True

class DocumentCreate(BaseModel):
    doc_id: str
    filename: str
    content: str
    enabled: bool = True

class DocumentUpdate(BaseModel):
    enabled: Optional[bool] = None
    content: Optional[str] = None

class ConversationBase(BaseModel):
    id: int
    title: str
    created_at: datetime
    
class MessageBase(BaseModel):
    role: str
    content: str
    timestamp: datetime
