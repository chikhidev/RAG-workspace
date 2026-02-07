from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, FileResponse, RedirectResponse
from fastapi.security import OAuth2PasswordRequestForm
from starlette.middleware.sessions import SessionMiddleware
from typing import List
import shutil
import os
import httpx
from bson import ObjectId
from . import models, schemas, auth, database, rag_engine, encryption

app = FastAPI()

@app.on_event("startup")
async def startup_db_client():
    await database.connect_to_mongo()

@app.on_event("shutdown")
async def shutdown_db_client():
    await database.close_mongo_connection()

# Secure file access - NO STATIC MOUNT FOR UPLOADS
UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

# Custom file serving endpoint with security check
@app.get("/uploads/{filename}")
async def get_uploaded_file(
    filename: str,
    current_user: models.User = Depends(auth.get_current_user)
):
    # Security: Ensure user can only access their own files
    # ID check based on naming convention
    is_own_avatar = filename.startswith(f"avatar_{current_user.id}.")
    is_own_doc = filename.startswith(f"{current_user.id}_")
    
    if not (is_own_avatar or is_own_doc):
        raise HTTPException(status_code=403, detail="Not authorized to access this file")
        
    file_path = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
        
    return FileResponse(file_path)

# CORS configuration
origins = [
    "http://localhost:5173",  # Vite dev server
    "http://127.0.0.1:5173",
    "*"  # For development purposes
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add Session Middleware for OAuth (configured for Codespaces/HTTPS)
app.add_middleware(
    SessionMiddleware,
    secret_key=os.getenv("SECRET_KEY", "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"),
    same_site="none",  # Allow cross-site cookies for OAuth
    https_only=True    # Secure cookies for HTTPS (Codespaces)
)

# --- Google OAuth Routes (Only Authentication Method) ---

@app.get("/auth/google/login")
async def google_login(request: Request):
    """Initiate Google OAuth flow (stateless for Codespaces compatibility)"""
    # Build Google OAuth URL manually to avoid session issues
    google_auth_url = "https://accounts.google.com/o/oauth2/v2/auth"
    
    params = {
        "client_id": auth.GOOGLE_CLIENT_ID,
        "redirect_uri": auth.GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "online",
    }
    
    # Build the authorization URL
    from urllib.parse import urlencode
    auth_url = f"{google_auth_url}?{urlencode(params)}"
    
    return RedirectResponse(url=auth_url)

@app.get("/auth/google/callback")
async def google_callback(request: Request, code: str = None, db = Depends(database.get_db)):
    """Handle Google OAuth callback (stateless)"""
    try:
        if not code:
            raise HTTPException(status_code=400, detail="No authorization code provided")
        
        # Exchange code for tokens
        token_url = "https://oauth2.googleapis.com/token"
        token_data = {
            "code": code,
            "client_id": auth.GOOGLE_CLIENT_ID,
            "client_secret": auth.GOOGLE_CLIENT_SECRET,
            "redirect_uri": auth.GOOGLE_REDIRECT_URI,
            "grant_type": "authorization_code",
        }
        
        async with httpx.AsyncClient() as client:
            token_response = await client.post(token_url, data=token_data)
            
            if token_response.status_code != 200:
                print(f"Token exchange error: {token_response.text}")
                raise HTTPException(status_code=400, detail="Failed to exchange code for token")
            
            tokens = token_response.json()
            id_token = tokens.get("id_token")
            
            # Verify and decode the ID token
            userinfo_url = "https://www.googleapis.com/oauth2/v3/userinfo"
            userinfo_response = await client.get(
                userinfo_url,
                headers={"Authorization": f"Bearer {tokens.get('access_token')}"}
            )
            
            if userinfo_response.status_code != 200:
                raise HTTPException(status_code=400, detail="Failed to get user info")
            
            user_info = userinfo_response.json()
        
        email = user_info.get('email')
        name = user_info.get('name')
        picture = user_info.get('picture')
        google_id = user_info.get('sub')
        
        if not email:
            raise HTTPException(status_code=400, detail="Email not provided by Google")
        
        # Get or create user
        user = await auth.get_or_create_oauth_user(
            db=db,
            email=email,
            oauth_provider='google',
            oauth_id=google_id,
            name=name,
            picture=picture
        )
        
        # Create access token
        access_token = auth.create_access_token(data={"sub": user.email})
        
        # Redirect to frontend /app with token
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
        return RedirectResponse(url=f"{frontend_url}/app?token={access_token}")
        
    except Exception as e:
        print(f"OAuth error: {str(e)}")
        import traceback
        traceback.print_exc()
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
        return RedirectResponse(url=f"{frontend_url}/app?error=oauth_failed")

@app.post("/auth/google/verify")
async def verify_google_token(token_data: dict, db = Depends(database.get_db)):
    """Verify Google ID token from frontend (alternative flow)"""
    try:
        id_token = token_data.get('credential')
        if not id_token:
            raise HTTPException(status_code=400, detail="No credential provided")
        
        # Verify the token with Google
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://oauth2.googleapis.com/tokeninfo?id_token={id_token}"
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=401, detail="Invalid token")
            
            user_info = response.json()
            
            # Verify audience
            if user_info.get('aud') != auth.GOOGLE_CLIENT_ID:
                raise HTTPException(status_code=401, detail="Invalid token audience")
            
            email = user_info.get('email')
            name = user_info.get('name')
            picture = user_info.get('picture')
            google_id = user_info.get('sub')
            
            if not email:
                raise HTTPException(status_code=400, detail="Email not provided by Google")
            
            # Get or create user
            user = await auth.get_or_create_oauth_user(
                db=db,
                email=email,
                oauth_provider='google',
                oauth_id=google_id,
                name=name,
                picture=picture
            )
            
            # Create access token
            access_token = auth.create_access_token(data={"sub": user.email})
            
            return {"access_token": access_token, "token_type": "bearer"}
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"Token verification error: {str(e)}")
        raise HTTPException(status_code=401, detail="Token verification failed")

@app.get("/users/me", response_model=schemas.User)
async def read_users_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

@app.put("/users/me", response_model=schemas.User)
async def update_user(
    user_update: schemas.UserUpdate,
    current_user: models.User = Depends(auth.get_current_user),
    db = Depends(database.get_db)
):
    update_data = {}
    if user_update.username is not None:
        update_data["username"] = user_update.username
    if user_update.email is not None:
        # Check if email is taken
        existing = await db.users.find_one({"email": user_update.email})
        if existing and str(existing["_id"]) != str(current_user.id):
            raise HTTPException(status_code=400, detail="Email already registered")
        update_data["email"] = user_update.email
    
    if update_data:
        await db.users.update_one(
            {"_id": ObjectId(current_user.id)},
            {"$set": update_data}
        )
    
    # Get updated user
    updated_user = await db.users.find_one({"_id": ObjectId(current_user.id)})
    updated_user["id"] = str(updated_user.pop("_id"))
    return schemas.User(**updated_user)

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

@app.post("/users/me/avatar", response_model=schemas.User)
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: models.User = Depends(auth.get_current_user),
    db = Depends(database.get_db)
):
    # Security: Validate file type
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=400, detail="Invalid file type. Only images are allowed.")
    
    # Security: Validate file extension
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in {".jpg", ".jpeg", ".png", ".gif", ".webp"}:
        raise HTTPException(status_code=400, detail="Invalid file extension.")

    # Ensure uploads directory exists
    if not os.path.exists(UPLOAD_DIR):
        os.makedirs(UPLOAD_DIR)
        
    # Generate unique filename for avatar
    avatar_filename = f"avatar_{current_user.id}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, avatar_filename)
    
    # Save file with size limit check
    size = 0
    with open(file_path, "wb") as buffer:
        while True:
            chunk = await file.read(1024 * 1024) # Read 1MB chunks
            if not chunk:
                break
            size += len(chunk)
            if size > MAX_FILE_SIZE:
                os.remove(file_path)
                raise HTTPException(status_code=400, detail="File too large. Limit is 5MB.")
            buffer.write(chunk)
        
    # Update user model with full URL path relative to backend
    avatar_path = f"/uploads/{avatar_filename}"
    await db.users.update_one(
        {"_id": ObjectId(current_user.id)},
        {"$set": {"avatar_path": avatar_path}}
    )
    
    # Get updated user
    updated_user = await db.users.find_one({"_id": ObjectId(current_user.id)})
    updated_user["id"] = str(updated_user.pop("_id"))
    return schemas.User(**updated_user)

# --- Config Routes ---

@app.get("/config", response_model=schemas.ConfigUpdate)
async def get_config(current_user: models.User = Depends(auth.get_current_user), db = Depends(database.get_db)):
    print(f"[GET /config] Loading config for user: {current_user.email} (ID: {current_user.id})")
    user_config = await db.user_configs.find_one({"user_id": str(current_user.id)})
    
    if not user_config:
        print(f"[GET /config] No config found for user {current_user.email}, returning defaults")
        # Return empty config with defaults
        return {
            "api_keys": {},
            "custom_instructions": "",
            "context_script": "",
            "custom_context": "",
            "model_preference": "gemini-2.0-flash-thinking-exp",
            "generation_controls": {},
            "settings": {},
            "mind_maps": []
        }
    
    # Decrypt API keys before sending to client
    encrypted_keys = user_config.get("api_keys", {})
    print(f"[GET /config] Found config with {len(encrypted_keys)} encrypted key(s)")
    
    try:
        decrypted_keys = encryption.decrypt_api_keys(encrypted_keys)
        print(f"[GET /config] Successfully decrypted {len(decrypted_keys)} key(s)")
    except Exception as e:
        print(f"[GET /config] ERROR decrypting API keys: {e}")
        decrypted_keys = {}
    
    return {
        "api_keys": decrypted_keys,
        "custom_instructions": user_config.get("custom_instructions", ""),
        "context_script": user_config.get("context_script", ""),
        "custom_context": user_config.get("custom_context", ""),
        "model_preference": user_config.get("model_preference", "gemini-2.0-flash-thinking-exp"),
        "generation_controls": user_config.get("generation_controls", {}),
        "settings": user_config.get("settings", {}),
        "mind_maps": user_config.get("mind_maps", [])
    }

@app.post("/config", response_model=schemas.ConfigUpdate)
async def update_config(config: schemas.ConfigUpdate, current_user: models.User = Depends(auth.get_current_user), db = Depends(database.get_db)):
    print(f"[POST /config] Updating config for user: {current_user.email} (ID: {current_user.id})")
    print(f"[POST /config] Received API keys: {list(config.api_keys.keys()) if config.api_keys else 'None'}")
    print(f"[POST /config] Model preference: {config.model_preference}")
    
    user_config = await db.user_configs.find_one({"user_id": str(current_user.id)})
    
    if not user_config:
        # Encrypt API keys before storing
        encrypted_keys = encryption.encrypt_api_keys(config.api_keys or {})
        print(f"[POST /config] No existing config - creating new with {len(encrypted_keys)} encrypted key(s)")
        
        # Create new config
        config_data = {
            "user_id": str(current_user.id),
            "api_keys": encrypted_keys,
            "custom_instructions": config.custom_instructions or "",
            "context_script": config.context_script or "",
            "custom_context": config.custom_context or "",
            "model_preference": config.model_preference or "gemini-2.0-flash-thinking-exp",
            "generation_controls": config.generation_controls or {},
            "settings": config.settings or {},
            "mind_maps": config.mind_maps or []
        }
        await db.user_configs.insert_one(config_data)
        user_config = config_data
    else:
        # Update existing config
        print(f"[POST /config] Found existing config - merging updates")
        update_data = {}
        
        # MERGE api_keys instead of replacing (preserve existing keys)
        if config.api_keys is not None:
            # Decrypt existing keys first
            existing_encrypted = user_config.get("api_keys", {})
            existing_keys = encryption.decrypt_api_keys(existing_encrypted)
            print(f"[POST /config] Existing keys: {list(existing_keys.keys())}, New keys: {list(config.api_keys.keys())}")
            
            # Only merge if there are actual keys to merge
            if config.api_keys:
                merged_keys = {**existing_keys, **config.api_keys}
                # Remove keys that are explicitly set to empty string
                merged_keys = {k: v for k, v in merged_keys.items() if v}
                # Encrypt before saving
                update_data["api_keys"] = encryption.encrypt_api_keys(merged_keys)
                print(f"[POST /config] Merged keys: {list(merged_keys.keys())}")
            # If empty dict sent, don't change anything (preserve existing)
        if config.custom_instructions is not None:
            update_data["custom_instructions"] = config.custom_instructions
        if config.context_script is not None:
            update_data["context_script"] = config.context_script
        if config.custom_context is not None:
            update_data["custom_context"] = config.custom_context
        if config.model_preference is not None:
            update_data["model_preference"] = config.model_preference
        if config.generation_controls is not None:
            update_data["generation_controls"] = config.generation_controls
        # MERGE settings instead of replacing (preserve existing settings)
        if config.settings is not None:
            existing_settings = user_config.get("settings", {})
            merged_settings = {**existing_settings, **config.settings}
            update_data["settings"] = merged_settings
        if config.mind_maps is not None:
            update_data["mind_maps"] = config.mind_maps
        
        if update_data:
            await db.user_configs.update_one(
                {"user_id": str(current_user.id)},
                {"$set": update_data}
            )
            print(f"[POST /config] Successfully updated config in database")
            # Refresh config
            user_config = await db.user_configs.find_one({"user_id": str(current_user.id)})
        else:
            print(f"[POST /config] No updates to apply")
    
    # Decrypt API keys before returning to client
    encrypted_keys = user_config.get("api_keys", {})
    decrypted_keys = encryption.decrypt_api_keys(encrypted_keys)
    print(f"[POST /config] Returning config with {len(decrypted_keys)} decrypted key(s)")
    
    return {
        "api_keys": decrypted_keys,
        "custom_instructions": user_config.get("custom_instructions", ""),
        "context_script": user_config.get("context_script", ""),
        "custom_context": user_config.get("custom_context", ""),
        "model_preference": user_config.get("model_preference", "gemini-2.0-flash-thinking-exp"),
        "generation_controls": user_config.get("generation_controls", {}),
        "settings": user_config.get("settings", {}),
        "mind_maps": user_config.get("mind_maps", [])
    }

# --- Conversation Routes ---

@app.get("/conversations", response_model=List[schemas.Conversation])
async def list_conversations(
    current_user: models.User = Depends(auth.get_current_user),
    db = Depends(database.get_db)
):
    """Get all conversations for the current user with message preview"""
    conversations = await db.conversations.find(
        {"user_id": str(current_user.id)}
    ).sort("created_at", -1).to_list(length=None)
    
    result = []
    for conv in conversations:
        # Get message count and last message
        message_count = await db.messages.count_documents(
            {"conversation_id": str(conv["_id"])}
        )
        
        last_message_doc = await db.messages.find_one(
            {"conversation_id": str(conv["_id"])},
            sort=[("timestamp", -1)]
        )
        
        result.append(schemas.Conversation(
            id=str(conv["_id"]),
            title=conv["title"],
            created_at=conv["created_at"],
            message_count=message_count,
            last_message=last_message_doc["content"][:100] if last_message_doc else None
        ))
    
    return result

@app.post("/conversations", response_model=schemas.Conversation)
async def create_conversation(
    conversation: schemas.ConversationCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db = Depends(database.get_db)
):
    """Create a new conversation"""
    from datetime import datetime
    new_conversation_data = {
        "user_id": str(current_user.id),
        "title": conversation.title,
        "created_at": datetime.utcnow()
    }
    result = await db.conversations.insert_one(new_conversation_data)
    
    return schemas.Conversation(
        id=str(result.inserted_id),
        title=new_conversation_data["title"],
        created_at=new_conversation_data["created_at"],
        message_count=0,
        last_message=None
    )

@app.get("/conversations/{conversation_id}", response_model=schemas.ConversationWithMessages)
async def get_conversation(
    conversation_id: str,
    current_user: models.User = Depends(auth.get_current_user),
    db = Depends(database.get_db)
):
    """Get a specific conversation with all messages"""
    # Validate ObjectId format
    if len(conversation_id) != 24:
        raise HTTPException(status_code=400, detail="Invalid conversation ID format")
    
    try:
        conv_obj_id = ObjectId(conversation_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid conversation ID")
    
    conversation = await db.conversations.find_one(
        {"_id": conv_obj_id, "user_id": str(current_user.id)}
    )
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    messages = await db.messages.find(
        {"conversation_id": conversation_id}
    ).sort("timestamp", 1).to_list(length=None)
    
    return schemas.ConversationWithMessages(
        id=str(conversation["_id"]),
        title=conversation["title"],
        created_at=conversation["created_at"],
        messages=[schemas.Message(
            id=str(msg["_id"]),
            conversation_id=msg["conversation_id"],
            role=msg["role"],
            content=msg["content"],
            model=msg.get("model"),
            extra_data=msg.get("extra_data", {}),
            timestamp=msg["timestamp"]
        ) for msg in messages]
    )

@app.put("/conversations/{conversation_id}", response_model=schemas.Conversation)
async def update_conversation(
    conversation_id: str,
    update: schemas.ConversationUpdate,
    current_user: models.User = Depends(auth.get_current_user),
    db = Depends(database.get_db)
):
    """Update conversation title"""
    conversation = await db.conversations.find_one(
        {"_id": ObjectId(conversation_id), "user_id": str(current_user.id)}
    )
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    if update.title is not None:
        await db.conversations.update_one(
            {"_id": ObjectId(conversation_id)},
            {"$set": {"title": update.title}}
        )
        conversation["title"] = update.title
    
    # Get message count for response
    message_count = await db.messages.count_documents(
        {"conversation_id": conversation_id}
    )
    
    return schemas.Conversation(
        id=str(conversation["_id"]),
        title=conversation["title"],
        created_at=conversation["created_at"],
        message_count=message_count
    )

@app.delete("/conversations/{conversation_id}")
async def delete_conversation(
    conversation_id: str,
    current_user: models.User = Depends(auth.get_current_user),
    db = Depends(database.get_db)
):
    """Delete a conversation and all its messages"""
    conversation = await db.conversations.find_one(
        {"_id": ObjectId(conversation_id), "user_id": str(current_user.id)}
    )
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    # Delete all messages first
    await db.messages.delete_many({"conversation_id": conversation_id})
    
    # Delete conversation
    await db.conversations.delete_one({"_id": ObjectId(conversation_id)})
    
    return {"message": "Conversation deleted successfully"}

@app.post("/conversations/{conversation_id}/messages", response_model=schemas.Message)
async def add_message(
    conversation_id: str,
    message: schemas.MessageBase,
    current_user: models.User = Depends(auth.get_current_user),
    db = Depends(database.get_db)
):
    """Add a message to a conversation"""
    # Verify conversation belongs to user
    conversation = await db.conversations.find_one(
        {"_id": ObjectId(conversation_id), "user_id": str(current_user.id)}
    )
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    from datetime import datetime
    new_message_data = {
        "conversation_id": conversation_id,
        "role": message.role,
        "content": message.content,
        "model": message.model,
        "extra_data": message.extra_data or {},
        "timestamp": datetime.utcnow()
    }
    result = await db.messages.insert_one(new_message_data)
    
    return schemas.Message(
        id=str(result.inserted_id),
        conversation_id=new_message_data["conversation_id"],
        role=new_message_data["role"],
        content=new_message_data["content"],
        model=new_message_data["model"],
        extra_data=new_message_data["extra_data"],
        timestamp=new_message_data["timestamp"]
    )

# --- File Routes (Placeholder for now) ---

UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

@app.post("/upload")
async def upload_file(
    file: UploadFile = File(...), 
    current_user: models.User = Depends(auth.get_current_user),
    db = Depends(database.get_db)
):
    # Security: Basic extension check for docs
    allowed_exts = {".pdf", ".txt", ".md", ".docx"}
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in allowed_exts:
        raise HTTPException(status_code=400, detail="Unsupported file format")

    file_path = os.path.join(UPLOAD_DIR, f"{current_user.id}_{file.filename}")
    
    # Save with size limit
    size = 0
    with open(file_path, "wb") as buffer:
        while True:
            chunk = await file.read(1024 * 1024)
            if not chunk:
                break
            size += len(chunk)
            if size > MAX_FILE_SIZE * 4: # 20MB for docs
                os.remove(file_path)
                raise HTTPException(status_code=400, detail="File too large")
            buffer.write(chunk)
    
    # Metadata Entry
    from datetime import datetime
    new_doc_data = {
        "user_id": str(current_user.id),
        "filename": file.filename,
        "file_type": file.content_type,
        "content_hash": "todo_hash",
        "doc_id": "",  # Will be set by frontend
        "content": "",
        "enabled": True,
        "upload_date": datetime.utcnow()
    }
    await db.documents.insert_one(new_doc_data)
    
    # TODO: Trigger indexing task (RagEngine)
    
    return {"filename": file.filename, "status": "uploaded"}

@app.get("/documents", response_model=List[schemas.DocumentSummary])
async def list_documents(current_user: models.User = Depends(auth.get_current_user), db = Depends(database.get_db)):
    """Get list of documents without content - only metadata for UI"""
    docs = await db.documents.find({"user_id": str(current_user.id)}).to_list(length=None)
    return [schemas.DocumentSummary(
        id=str(doc["_id"]),
        doc_id=doc["doc_id"],
        filename=doc["filename"],
        enabled=doc["enabled"],
        upload_date=doc["upload_date"]
    ) for doc in docs]

@app.post("/documents", response_model=schemas.DocumentMetadata)
async def create_document(
    doc: schemas.DocumentCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db = Depends(database.get_db)
):
    """Create or update a document with content"""
    # Check if document with this doc_id already exists
    existing = await db.documents.find_one(
        {"user_id": str(current_user.id), "doc_id": doc.doc_id}
    )
    
    if existing:
        # Update existing document
        await db.documents.update_one(
            {"_id": existing["_id"]},
            {"$set": {
                "filename": doc.filename,
                "content": doc.content,
                "enabled": doc.enabled
            }}
        )
        updated_doc = await db.documents.find_one({"_id": existing["_id"]})
        return schemas.DocumentMetadata(
            id=str(updated_doc["_id"]),
            doc_id=updated_doc["doc_id"],
            filename=updated_doc["filename"],
            enabled=updated_doc["enabled"],
            content=updated_doc["content"],
            upload_date=updated_doc["upload_date"]
        )
    
    # Create new document
    from datetime import datetime
    new_doc_data = {
        "user_id": str(current_user.id),
        "doc_id": doc.doc_id,
        "filename": doc.filename,
        "file_type": "text/plain",  # Can be enhanced
        "content": doc.content,
        "content_hash": "",  # Can add hashing later
        "enabled": doc.enabled,
        "upload_date": datetime.utcnow()
    }
    result = await db.documents.insert_one(new_doc_data)
    new_doc_data["_id"] = result.inserted_id
    
    return schemas.DocumentMetadata(
        id=str(new_doc_data["_id"]),
        doc_id=new_doc_data["doc_id"],
        filename=new_doc_data["filename"],
        enabled=new_doc_data["enabled"],
        content=new_doc_data["content"],
        upload_date=new_doc_data["upload_date"]
    )

@app.put("/documents/{doc_id}", response_model=schemas.DocumentMetadata)
async def update_document(
    doc_id: str,
    doc_update: schemas.DocumentUpdate,
    current_user: models.User = Depends(auth.get_current_user),
    db = Depends(database.get_db)
):
    """Update document enabled status or content"""
    document = await db.documents.find_one(
        {"user_id": str(current_user.id), "doc_id": doc_id}
    )
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    update_data = {}
    if doc_update.enabled is not None:
        update_data["enabled"] = doc_update.enabled
    if doc_update.content is not None:
        update_data["content"] = doc_update.content
    
    if update_data:
        await db.documents.update_one(
            {"_id": document["_id"]},
            {"$set": update_data}
        )
        document = await db.documents.find_one({"_id": document["_id"]})
    
    return schemas.DocumentMetadata(
        id=str(document["_id"]),
        doc_id=document["doc_id"],
        filename=document["filename"],
        enabled=document["enabled"],
        content=document["content"],
        upload_date=document["upload_date"]
    )

@app.delete("/documents/{doc_id}")
async def delete_document(
    doc_id: str,
    current_user: models.User = Depends(auth.get_current_user),
    db = Depends(database.get_db)
):
    """Delete a document"""
    document = await db.documents.find_one(
        {"user_id": str(current_user.id), "doc_id": doc_id}
    )
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    await db.documents.delete_one({"_id": document["_id"]})
    return {"status": "deleted", "doc_id": doc_id}

# --- Chat Routes ---

@app.post("/chat/stream")
async def chat_stream(
    request: schemas.ChatRequest,
    current_user: models.User = Depends(auth.get_current_user),
    db = Depends(database.get_db)
):
    """
    Stream chat responses with full RAG pipeline and agent loop
    Sends Server-Sent Events (SSE) for: status updates, file highlights, thoughts, answer chunks
    """
    from . import agent_rag_engine_v2
    
    # Debug: Log received request
    print(f"[Chat] Received request - model_id: {request.model_id}, provider: {request.provider}")
    
    # Get user's documents
    documents = await db.documents.find(
        {"user_id": str(current_user.id)}
    ).to_list(length=None)
    
    docs_data = [{
        'doc_id': doc['doc_id'],
        'filename': doc['filename'],
        'content': doc['content'],
        'enabled': doc['enabled']
    } for doc in documents]
    
    # Debug: Log document details
    print(f"[Chat] Documents found: {len(docs_data)}")
    for d in docs_data:
        print(f"  - {d['filename']}: enabled={d['enabled']}, content_len={len(d['content'] or '')}")
    print(f"[Chat] use_vault: {request.use_vault}")
    
    # Get user config and decrypt API keys
    user_config = await db.user_configs.find_one({"user_id": str(current_user.id)})
    encrypted_keys = user_config.get("api_keys", {}) if user_config else {}
    decrypted_keys = encryption.decrypt_api_keys(encrypted_keys)
    
    # Create engine instance with model selection and provider
    model_id = request.model_id or 'nvidia/nemotron-3-nano-30b-a3b:free'
    provider = request.provider  # Get provider from frontend
    engine = agent_rag_engine_v2.AgentRAGEngine(current_user, model_id, provider, decrypted_keys)
    
    # Process query with streaming events
    return StreamingResponse(
        engine.process_query_stream(
            query=request.message,
            documents=docs_data,
            use_vault=request.use_vault,
            use_context_history=request.use_context_history,
            max_iterations=request.max_iterations,
            skip_research=request.skip_research,
            prior_context=request.prior_context
        ),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
