from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
import bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from authlib.integrations.starlette_client import OAuth
from authlib.jose import jwt as authlib_jwt
from authlib.jose.errors import JoseError
import os
from . import models, schemas, database

SECRET_KEY = os.getenv("SECRET_KEY", "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 3000

# Google OAuth Configuration
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:8000/api/auth/google/callback")

# Initialize OAuth
oauth = OAuth()
oauth.register(
    name='google',
    client_id=GOOGLE_CLIENT_ID,
    client_secret=GOOGLE_CLIENT_SECRET,
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={
        'scope': 'openid email profile'
    }
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def verify_password(plain_password, hashed_password):
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def get_password_hash(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme), db = Depends(database.get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = schemas.TokenData(email=email)
    except JWTError:
        raise credentials_exception
    
    user_doc = await db.users.find_one({"email": token_data.email})
    if user_doc is None:
        raise credentials_exception
    
    # Convert MongoDB document to User model
    user_doc["id"] = str(user_doc.pop("_id"))
    return models.User(**user_doc)

async def verify_google_token(token: str) -> dict:
    """Verify Google OAuth token and extract user information"""
    try:
        # Verify the token with Google
        idinfo = authlib_jwt.decode(
            token,
            key=None,  # Google's public keys will be fetched automatically
        )
        
        # Verify the token is for our client
        if idinfo.get('aud') != GOOGLE_CLIENT_ID:
            raise HTTPException(status_code=401, detail="Invalid token audience")
        
        # Verify token issuer
        if idinfo.get('iss') not in ['accounts.google.com', 'https://accounts.google.com']:
            raise HTTPException(status_code=401, detail="Invalid token issuer")
        
        return {
            'email': idinfo.get('email'),
            'name': idinfo.get('name'),
            'picture': idinfo.get('picture'),
            'google_id': idinfo.get('sub')
        }
    except JoseError as e:
        raise HTTPException(status_code=401, detail=f"Invalid Google token: {str(e)}")

async def get_or_create_oauth_user(db, email: str, oauth_provider: str, oauth_id: str, name: str = None, picture: str = None):
    """Get existing OAuth user or create new one"""
    # Check if user exists with this email
    user_doc = await db.users.find_one({"email": email})
    
    if user_doc:
        # Update OAuth info if user exists but doesn't have it
        if not user_doc.get("oauth_provider"):
            update_data = {
                "oauth_provider": oauth_provider,
                "oauth_id": oauth_id
            }
            if name and not user_doc.get("username"):
                update_data["username"] = name
            if picture and not user_doc.get("avatar_path"):
                update_data["avatar_path"] = picture
            
            await db.users.update_one(
                {"_id": user_doc["_id"]},
                {"$set": update_data}
            )
            user_doc = await db.users.find_one({"_id": user_doc["_id"]})
        
        user_id = str(user_doc["_id"])
        
        # Ensure user has a config (create default if missing)
        existing_config = await db.user_configs.find_one({"user_id": user_id})
        if not existing_config:
            print(f"[OAuth] Creating default config for existing user: {email}")
            default_config = {
                "user_id": user_id,
                "api_keys": {},
                "custom_instructions": "",
                "context_script": "",
                "custom_context": "",
                "model_preference": "gemini-2.0-flash-thinking-exp",
                "generation_controls": {},
                "settings": {},
                "mind_maps": []
            }
            await db.user_configs.insert_one(default_config)
        
        # Convert _id to id for Pydantic model
        user_doc.pop("_id")
        user_doc["id"] = user_id
        return models.User(**user_doc)
    
    # Create new user
    new_user_data = {
        "email": email,
        "username": name,
        "hashed_password": None,  # OAuth users don't need password
        "oauth_provider": oauth_provider,
        "oauth_id": oauth_id,
        "avatar_path": picture
    }
    
    result = await db.users.insert_one(new_user_data)
    user_id = str(result.inserted_id)
    
    # Create default config for new user
    print(f"[OAuth] Creating default config for new user: {email}")
    default_config = {
        "user_id": user_id,
        "api_keys": {},
        "custom_instructions": "",
        "context_script": "",
        "custom_context": "",
        "model_preference": "gemini-2.0-flash-thinking-exp",
        "generation_controls": {},
        "settings": {},
        "mind_maps": []
    }
    await db.user_configs.insert_one(default_config)
    
    # Remove _id if present and add id as string
    new_user_data.pop("_id", None)
    new_user_data["id"] = user_id
    
    return models.User(**new_user_data)
