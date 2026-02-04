from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, FileResponse
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List
import shutil
import os
from . import models, schemas, auth, database, rag_engine
from .database import engine

# Create the database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

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

# --- Auth Routes ---

@app.post("/token", response_model=schemas.Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = auth.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/register", response_model=schemas.User)
def register_user(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = auth.get_password_hash(user.password)
    new_user = models.User(email=user.email, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.get("/users/me", response_model=schemas.User)
async def read_users_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

@app.put("/users/me", response_model=schemas.User)
async def update_user(
    user_update: schemas.UserUpdate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    if user_update.username is not None:
        current_user.username = user_update.username
    if user_update.email is not None:
        # Check if email is taken
        existing = db.query(models.User).filter(models.User.email == user_update.email).first()
        if existing and existing.id != current_user.id:
            raise HTTPException(status_code=400, detail="Email already registered")
        current_user.email = user_update.email
    
    db.commit()
    db.refresh(current_user)
    return current_user

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

@app.post("/users/me/avatar", response_model=schemas.User)
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
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
    # This assumes backend is served at root or we use relative paths in frontend
    current_user.avatar_path = f"/uploads/{avatar_filename}"
    db.commit()
    db.refresh(current_user)
    
    return current_user

# --- Config Routes ---

@app.get("/config", response_model=schemas.ConfigUpdate)
def get_config(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    if not current_user.config:
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
    return {
        "api_keys": current_user.config.api_keys or {},
        "custom_instructions": current_user.config.custom_instructions or "",
        "context_script": current_user.config.context_script or "",
        "custom_context": current_user.config.custom_context or "",
        "model_preference": current_user.config.model_preference or "gemini-2.0-flash-thinking-exp",
        "generation_controls": current_user.config.generation_controls or {},
        "settings": current_user.config.settings or {},
        "mind_maps": current_user.config.mind_maps or []
    }

@app.post("/config", response_model=schemas.ConfigUpdate)
def update_config(config: schemas.ConfigUpdate, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    user_config = current_user.config
    if not user_config:
        user_config = models.UserConfig(user_id=current_user.id)
        db.add(user_config)
    
    # Debug logging
    print(f"[Config Update] User {current_user.id}: Received api_keys={config.api_keys}")
    print(f"[Config Update] User {current_user.id}: Existing api_keys={user_config.api_keys}")
    
    # MERGE api_keys instead of replacing (preserve existing keys)
    if config.api_keys is not None:
        existing_keys = user_config.api_keys or {}
        # Only merge if there are actual keys to merge
        if config.api_keys:
            merged_keys = {**existing_keys, **config.api_keys}
            # Remove keys that are explicitly set to empty string
            merged_keys = {k: v for k, v in merged_keys.items() if v}
            user_config.api_keys = merged_keys
            print(f"[Config Update] User {current_user.id}: Updated api_keys={user_config.api_keys}")
        else:
            print(f"[Config Update] User {current_user.id}: Empty api_keys sent, preserving existing")
        # If empty dict sent, don't change anything (preserve existing)
    if config.custom_instructions is not None:
        user_config.custom_instructions = config.custom_instructions
    if config.context_script is not None:
        user_config.context_script = config.context_script
    if config.custom_context is not None:
        user_config.custom_context = config.custom_context
    if config.model_preference is not None:
        user_config.model_preference = config.model_preference
    if config.generation_controls is not None:
        user_config.generation_controls = config.generation_controls
    # MERGE settings instead of replacing (preserve existing settings)
    if config.settings is not None:
        existing_settings = user_config.settings or {}
        merged_settings = {**existing_settings, **config.settings}
        user_config.settings = merged_settings
    if config.mind_maps is not None:
        user_config.mind_maps = config.mind_maps
        
    db.commit()
    db.refresh(user_config)
    return {
        "api_keys": user_config.api_keys or {},
        "custom_instructions": user_config.custom_instructions or "",
        "context_script": user_config.context_script or "",
        "custom_context": user_config.custom_context or "",
        "model_preference": user_config.model_preference or "gemini-2.0-flash-thinking-exp",
        "generation_controls": user_config.generation_controls or {},
        "settings": user_config.settings or {},
        "mind_maps": user_config.mind_maps or []
    }

# --- File Routes (Placeholder for now) ---

UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

@app.post("/upload")
async def upload_file(
    file: UploadFile = File(...), 
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
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
    new_doc = models.Document(
        user_id=current_user.id,
        filename=file.filename,
        file_type=file.content_type,
        content_hash="todo_hash"
    )
    db.add(new_doc)
    db.commit()
    
    # TODO: Trigger indexing task (RagEngine)
    
    return {"filename": file.filename, "status": "uploaded"}

@app.get("/documents", response_model=List[schemas.DocumentSummary])
def list_documents(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    """Get list of documents without content - only metadata for UI"""
    return db.query(models.Document).filter(models.Document.user_id == current_user.id).all()

@app.post("/documents", response_model=schemas.DocumentMetadata)
def create_document(
    doc: schemas.DocumentCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    """Create or update a document with content"""
    # Check if document with this doc_id already exists
    existing = db.query(models.Document).filter(
        models.Document.user_id == current_user.id,
        models.Document.doc_id == doc.doc_id
    ).first()
    
    if existing:
        # Update existing document
        existing.filename = doc.filename
        existing.content = doc.content
        existing.enabled = doc.enabled
        db.commit()
        db.refresh(existing)
        return existing
    
    # Create new document
    new_doc = models.Document(
        user_id=current_user.id,
        doc_id=doc.doc_id,
        filename=doc.filename,
        file_type="text/plain",  # Can be enhanced
        content=doc.content,
        content_hash="",  # Can add hashing later
        enabled=doc.enabled
    )
    db.add(new_doc)
    db.commit()
    db.refresh(new_doc)
    return new_doc

@app.put("/documents/{doc_id}", response_model=schemas.DocumentMetadata)
def update_document(
    doc_id: str,
    doc_update: schemas.DocumentUpdate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    """Update document enabled status or content"""
    document = db.query(models.Document).filter(
        models.Document.user_id == current_user.id,
        models.Document.doc_id == doc_id
    ).first()
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    if doc_update.enabled is not None:
        document.enabled = doc_update.enabled
    if doc_update.content is not None:
        document.content = doc_update.content
    
    db.commit()
    db.refresh(document)
    return document

@app.delete("/documents/{doc_id}")
def delete_document(
    doc_id: str,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    """Delete a document"""
    document = db.query(models.Document).filter(
        models.Document.user_id == current_user.id,
        models.Document.doc_id == doc_id
    ).first()
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    db.delete(document)
    db.commit()
    return {"status": "deleted", "doc_id": doc_id}

# --- Chat Routes ---

@app.post("/chat/stream")
async def chat_stream(
    request: schemas.ChatRequest,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    """
    Stream chat responses with full RAG pipeline and agent loop
    Sends Server-Sent Events (SSE) for: status updates, file highlights, thoughts, answer chunks
    """
    from . import agent_rag_engine_v2
    
    # Debug: Log received request
    print(f"[Chat] Received request - model_id: {request.model_id}, provider: {request.provider}")
    
    # Get user's documents
    documents = db.query(models.Document).filter(
        models.Document.user_id == current_user.id
    ).all()
    
    docs_data = [{
        'doc_id': doc.doc_id,
        'filename': doc.filename,
        'content': doc.content,
        'enabled': doc.enabled
    } for doc in documents]
    
    # Debug: Log document details
    print(f"[Chat] Documents found: {len(docs_data)}")
    for d in docs_data:
        print(f"  - {d['filename']}: enabled={d['enabled']}, content_len={len(d['content'] or '')}")
    print(f"[Chat] use_vault: {request.use_vault}")
    
    # Create engine instance with model selection and provider
    model_id = request.model_id or 'nvidia/nemotron-3-nano-30b-a3b:free'
    provider = request.provider  # Get provider from frontend
    engine = agent_rag_engine_v2.AgentRAGEngine(current_user, model_id, provider)
    
    # Process query with streaming events
    return StreamingResponse(
        engine.process_query_stream(
            query=request.message,
            documents=docs_data,
            use_vault=request.use_vault,
            use_context_history=request.use_context_history,
            max_iterations=request.max_iterations
        ),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )


@app.post("/documents/approve-edit")
async def approve_edit(
    request: schemas.EditApprovalRequest,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    """
    Approve or reject a proposed file edit.
    If approved, updates the document content in the database.
    """
    print(f"[Edit] Received approval request for {request.filename}: approved={request.approved}")
    
    if not request.approved:
        return {"status": "rejected", "message": "Edit was rejected by user."}
    
    # Find the document
    document = db.query(models.Document).filter(
        models.Document.user_id == current_user.id,
        models.Document.doc_id == request.doc_id
    ).first()
    
    if not document:
        raise HTTPException(status_code=404, detail=f"Document {request.filename} not found")
    
    # Check if it's a text-based file (not PDF)
    if document.file_type.lower() == 'pdf':
        raise HTTPException(status_code=400, detail="Cannot edit PDF files. Only text-based files are supported.")
    
    # Update the document content
    document.content = request.new_content
    db.commit()
    
    print(f"[Edit] Document {request.filename} updated successfully")
    
    return {
        "status": "approved",
        "message": f"Document {request.filename} has been updated.",
        "doc_id": request.doc_id
    }


# ============ CONVERSATION ENDPOINTS ============

@app.get("/conversations", response_model=schemas.ConversationListResponse)
async def list_conversations(
    skip: int = 0,
    limit: int = 20,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    """
    List user's conversations with pagination.
    Returns newest conversations first.
    """
    total = db.query(models.Conversation).filter(
        models.Conversation.user_id == current_user.id
    ).count()
    
    conversations = db.query(models.Conversation).filter(
        models.Conversation.user_id == current_user.id
    ).order_by(models.Conversation.created_at.desc()).offset(skip).limit(limit).all()
    
    return {
        "conversations": conversations,
        "total": total,
        "has_more": (skip + limit) < total
    }


@app.post("/conversations", response_model=schemas.ConversationBase)
async def create_conversation(
    request: schemas.ConversationCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    """
    Create a new conversation.
    """
    conversation = models.Conversation(
        user_id=current_user.id,
        title=request.title or "New Conversation"
    )
    db.add(conversation)
    db.commit()
    db.refresh(conversation)
    return conversation


@app.get("/conversations/{conversation_id}", response_model=schemas.ConversationWithMessages)
async def get_conversation(
    conversation_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    """
    Get a conversation with all its messages.
    """
    conversation = db.query(models.Conversation).filter(
        models.Conversation.id == conversation_id,
        models.Conversation.user_id == current_user.id
    ).first()
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    return conversation


@app.get("/conversations/{conversation_id}/messages", response_model=schemas.MessagesResponse)
async def get_conversation_messages(
    conversation_id: int,
    skip: int = 0,
    limit: int = 50,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    """
    Get messages for a conversation with pagination.
    Returns oldest messages first within the window, but pagination goes from newest.
    Use skip=0, limit=50 to get the 50 most recent messages.
    Use skip=50, limit=50 to get the next 50 older messages, etc.
    """
    # Verify conversation belongs to user
    conversation = db.query(models.Conversation).filter(
        models.Conversation.id == conversation_id,
        models.Conversation.user_id == current_user.id
    ).first()
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    total = db.query(models.Message).filter(
        models.Message.conversation_id == conversation_id
    ).count()
    
    # Get messages in reverse order (newest first for pagination), then reverse to show oldest first
    messages = db.query(models.Message).filter(
        models.Message.conversation_id == conversation_id
    ).order_by(models.Message.timestamp.desc()).offset(skip).limit(limit).all()
    
    # Reverse to show oldest first within this batch
    messages.reverse()
    
    return {
        "messages": messages,
        "total": total,
        "has_more": (skip + limit) < total
    }


@app.post("/conversations/{conversation_id}/messages", response_model=schemas.MessageBase)
async def add_message(
    conversation_id: int,
    request: schemas.MessageCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    """
    Add a message to a conversation.
    """
    # Verify conversation belongs to user
    conversation = db.query(models.Conversation).filter(
        models.Conversation.id == conversation_id,
        models.Conversation.user_id == current_user.id
    ).first()
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    message = models.Message(
        conversation_id=conversation_id,
        role=request.role,
        content=request.content,
        extra_data=request.extra_data or {}
    )
    db.add(message)
    
    # Update conversation title from first user message if still default
    if conversation.title == "New Conversation" and request.role == "user":
        # Use first 50 chars of message as title
        conversation.title = request.content[:50] + ("..." if len(request.content) > 50 else "")
    
    db.commit()
    db.refresh(message)
    return message


@app.delete("/conversations/{conversation_id}")
async def delete_conversation(
    conversation_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    """
    Delete a conversation and all its messages.
    """
    conversation = db.query(models.Conversation).filter(
        models.Conversation.id == conversation_id,
        models.Conversation.user_id == current_user.id
    ).first()
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    # Delete all messages first
    db.query(models.Message).filter(
        models.Message.conversation_id == conversation_id
    ).delete()
    
    # Delete conversation
    db.delete(conversation)
    db.commit()
    
    return {"status": "deleted", "conversation_id": conversation_id}


@app.patch("/conversations/{conversation_id}", response_model=schemas.ConversationBase)
async def update_conversation(
    conversation_id: int,
    request: schemas.ConversationCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    """
    Update conversation title.
    """
    conversation = db.query(models.Conversation).filter(
        models.Conversation.id == conversation_id,
        models.Conversation.user_id == current_user.id
    ).first()
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    if request.title:
        conversation.title = request.title
    
    db.commit()
    db.refresh(conversation)
    return conversation


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
