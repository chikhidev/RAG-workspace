from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class UserBase(BaseModel):
    email: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: str
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
    user_id: str

class ChatRequest(BaseModel):
    message: str
    model_id: Optional[str] = None
    provider: Optional[str] = None
    conversation_id: Optional[str] = None
    use_vault: bool = True
    use_context_history: bool = False
    max_iterations: int = 7
    active_files: List[str] = [] # Filenames to focus on
    skip_research: bool = False  # Skip agent loop and go straight to answer generation
    prior_context: Optional[str] = None  # Knowledge buffer from prior iterations

class DocumentSummary(BaseModel):
    """Document metadata without content - for list endpoint"""
    id: str
    doc_id: str
    filename: str
    enabled: bool
    upload_date: datetime
    
    class Config:
        from_attributes = True

class DocumentMetadata(BaseModel):
    """Full document metadata with content - for create/update operations"""
    id: str
    doc_id: str
    filename: str
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
    title: str

class ConversationCreate(ConversationBase):
    pass

class ConversationUpdate(BaseModel):
    title: Optional[str] = None

class MessageBase(BaseModel):
    role: str
    content: str
    model: Optional[str] = None
    extra_data: Optional[Dict[str, Any]] = None

class MessageCreate(MessageBase):
    conversation_id: str

class Message(MessageBase):
    id: str
    conversation_id: str
    timestamp: datetime
    
    class Config:
        from_attributes = True

class Conversation(ConversationBase):
    id: str
    created_at: datetime
    message_count: Optional[int] = None
    last_message: Optional[str] = None
    
    class Config:
        from_attributes = True

class ConversationWithMessages(Conversation):
    messages: List[Message] = []
    
    class Config:
        from_attributes = True
