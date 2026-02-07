from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import MongoClient
import os
from typing import Optional
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DATABASE_NAME = "rag_workspace"

# MongoDB client instances
client: Optional[AsyncIOMotorClient] = None
db = None

def get_database():
    """Get the database instance"""
    global client, db
    if client is None:
        client = AsyncIOMotorClient(MONGO_URI)
        db = client[DATABASE_NAME]
    return db

async def connect_to_mongo():
    """Initialize MongoDB connection"""
    global client, db
    try:
        # Debug: Show sanitized connection string
        sanitized_uri = MONGO_URI.split('@')[1] if '@' in MONGO_URI else MONGO_URI
        print(f"🔌 Connecting to MongoDB: {sanitized_uri}")
        
        client = AsyncIOMotorClient(MONGO_URI)
        db = client[DATABASE_NAME]
        # Test the connection
        await client.admin.command('ping')
        print(f"✅ Connected to MongoDB at {sanitized_uri}")
        
        # Create indexes
        await create_indexes()
        
    except Exception as e:
        print(f"❌ Could not connect to MongoDB: {e}")
        raise

async def close_mongo_connection():
    """Close MongoDB connection"""
    global client
    if client:
        client.close()
        print("MongoDB connection closed")

async def create_indexes():
    """Create necessary indexes for better query performance"""
    db = get_database()
    
    # Users indexes
    await db.users.create_index("email", unique=True)
    await db.users.create_index([("oauth_provider", 1), ("oauth_id", 1)])
    
    # Documents indexes
    await db.documents.create_index("doc_id", unique=True)
    await db.documents.create_index("user_id")
    await db.documents.create_index("content_hash")
    
    # Conversations indexes
    await db.conversations.create_index("user_id")
    await db.conversations.create_index("created_at")
    
    # Messages indexes  
    await db.messages.create_index("conversation_id")
    await db.messages.create_index("timestamp")
    
    print("✅ Database indexes created")

# Dependency for FastAPI endpoints
async def get_db():
    """Dependency for FastAPI routes"""
    db = get_database()
    try:
        yield db
    finally:
        pass  # Connection pooling handles this
