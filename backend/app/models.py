from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Text, JSON, DateTime
from sqlalchemy.orm import relationship
from .database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    username = Column(String, nullable=True)
    hashed_password = Column(String)
    avatar_path = Column(String, nullable=True)
    
    config = relationship("UserConfig", back_populates="user", uselist=False)
    documents = relationship("Document", back_populates="owner")
    conversations = relationship("Conversation", back_populates="owner")

class UserConfig(Base):
    __tablename__ = "user_configs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    
    # API Keys (encrypted in production)
    api_keys = Column(JSON, default={})  # {"openai": "...", "gemini": "..."}
    
    # Custom Instructions & Context
    custom_instructions = Column(Text, default="")
    context_script = Column(Text, default="")
    custom_context = Column(Text, default="")
    
    # Model & Generation Settings
    model_preference = Column(String, default="gemini-2.0-flash-thinking-exp")
    generation_controls = Column(JSON, default={})  # {"temperature": 0.7, "maxTokens": 2000, ...}
    
    # Settings
    settings = Column(JSON, default={})  # {"useVault": true, "useContextHistory": false, ...}
    
    # Mind Maps
    mind_maps = Column(JSON, default=[])  # Array of mind map objects
    
    user = relationship("User", back_populates="config")

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # Document metadata
    doc_id = Column(String, unique=True, index=True)  # Frontend ID like "c25togxfx"
    filename = Column(String)
    file_type = Column(String)
    content = Column(Text)  # Full document content
    content_hash = Column(String)  # For duplicate detection
    enabled = Column(Boolean, default=True)  # Whether document is active for RAG
    upload_date = Column(DateTime, default=datetime.utcnow)
    
    owner = relationship("User", back_populates="documents")

class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    owner = relationship("User", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation")

class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id"))
    role = Column(String) # user, assistant, system
    content = Column(Text)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    conversation = relationship("Conversation", back_populates="messages")
