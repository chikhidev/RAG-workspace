from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
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

# --- Config Routes ---

@app.get("/config", response_model=schemas.ConfigUpdate)
def get_config(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    if not current_user.config:
        return {}
    return {
        "api_keys": current_user.config.api_keys,
        "custom_instructions": current_user.config.custom_instructions,
        "model_preference": current_user.config.model_preference,
        "generation_controls": current_user.config.generation_controls
    }

@app.post("/config", response_model=schemas.ConfigUpdate)
def update_config(config: schemas.ConfigUpdate, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    user_config = current_user.config
    if not user_config:
        user_config = models.UserConfig(user_id=current_user.id)
        db.add(user_config)
    
    if config.api_keys:
        user_config.api_keys = config.api_keys
    if config.custom_instructions:
        user_config.custom_instructions = config.custom_instructions
    if config.model_preference:
        user_config.model_preference = config.model_preference
    if config.generation_controls:
        user_config.generation_controls = config.generation_controls
        
    db.commit()
    db.refresh(user_config)
    return config

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
    file_path = os.path.join(UPLOAD_DIR, f"{current_user.id}_{file.filename}")
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
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

@app.get("/documents", response_model=List[schemas.DocumentMetadata])
def list_documents(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    return db.query(models.Document).filter(models.Document.user_id == current_user.id).all()

# --- Chat Routes ---

@app.post("/chat/stream")
async def chat_stream(
    request: schemas.ChatRequest,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    engine = rag_engine.RagEngine(current_user)
    
    return StreamingResponse(
        engine.generate_stream(request.message, request.use_vault, request.active_files),
        media_type="text/event-stream"
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
