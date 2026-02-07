from pydantic import BaseModel, Field, GetJsonSchemaHandler
from pydantic.json_schema import JsonSchemaValue
from pydantic_core import core_schema
from typing import Optional, List, Dict, Any, Annotated
from datetime import datetime
from bson import ObjectId

class PyObjectId(ObjectId):
    """Custom type for MongoDB ObjectId with Pydantic v2 support"""
    
    @classmethod
    def __get_pydantic_core_schema__(
        cls, source_type: Any, handler: Any
    ) -> core_schema.CoreSchema:
        return core_schema.union_schema([
            core_schema.is_instance_schema(ObjectId),
            core_schema.chain_schema([
                core_schema.str_schema(),
                core_schema.no_info_plain_validator_function(cls.validate),
            ])
        ],
        serialization=core_schema.plain_serializer_function_ser_schema(
            lambda x: str(x)
        ))

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(
        cls, schema: core_schema.CoreSchema, handler: GetJsonSchemaHandler
    ) -> JsonSchemaValue:
        return {"type": "string"}

class User(BaseModel):
    """User model for MongoDB"""
    id: Optional[str] = Field(default=None, alias="_id")
    email: str
    username: Optional[str] = None
    hashed_password: Optional[str] = None  # Nullable for OAuth users
    avatar_path: Optional[str] = None
    
    # OAuth fields
    oauth_provider: Optional[str] = None  # 'google', 'github', etc.
    oauth_id: Optional[str] = None  # Provider's user ID
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class UserInDB(User):
    """User model with additional DB fields"""
    pass

class UserConfig(BaseModel):
    """User configuration model for MongoDB"""
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    user_id: str  # Reference to User._id as string
    
    # API Keys (encrypted in production)
    api_keys: Dict[str, str] = Field(default_factory=dict)  # {"openai": "...", "gemini": "..."}
    
    # Custom Instructions & Context
    custom_instructions: str = ""
    context_script: str = ""
    custom_context: str = ""
    
    # Model & Generation Settings
    model_preference: str = "gemini-2.0-flash-thinking-exp"
    generation_controls: Dict[str, Any] = Field(default_factory=dict)  # {"temperature": 0.7, "maxTokens": 2000, ...}
    
    # Settings
    settings: Dict[str, Any] = Field(default_factory=dict)  # {"useVault": true, "useContextHistory": false, ...}
    
    # Mind Maps
    mind_maps: List[Dict[str, Any]] = Field(default_factory=list)  # Array of mind map objects
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class Document(BaseModel):
    """Document model for MongoDB"""
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    user_id: str  # Reference to User._id as string
    
    # Document metadata
    doc_id: str  # Frontend ID like "c25togxfx"
    filename: str
    file_type: str
    content: str  # Full document content
    content_hash: str  # For duplicate detection
    enabled: bool = True  # Whether document is active for RAG
    upload_date: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str, datetime: lambda v: v.isoformat()}

class Conversation(BaseModel):
    """Conversation model for MongoDB"""
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    user_id: str  # Reference to User._id as string
    title: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str, datetime: lambda v: v.isoformat()}

class Message(BaseModel):
    """Message model for MongoDB"""
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    conversation_id: str  # Reference to Conversation._id as string
    role: str  # user, assistant, system
    content: str
    model: Optional[str] = None  # Store which model generated this message
    extra_data: Dict[str, Any] = Field(default_factory=dict)  # For sources, citations, edit proposals, etc.
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str, datetime: lambda v: v.isoformat()}
