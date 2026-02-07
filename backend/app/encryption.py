"""
Lightweight encryption utilities for sensitive data like API keys.
Uses Fernet (symmetric encryption based on AES-128) for fast encryption/decryption.
"""
import os
from cryptography.fernet import Fernet
from typing import Dict, Optional
import base64
from dotenv import load_dotenv
from time import time
from pathlib import Path

# Load .env from backend directory (parent of app/)
env_path = Path(__file__).parent.parent / '.env'
load_dotenv(dotenv_path=env_path)
print(f"🔐 Loading encryption config from: {env_path}")
print(f"   ENCRYPTION_KEY found: {'Yes' if os.getenv('ENCRYPTION_KEY') else 'No'}")

# In-memory cache for decrypted keys (lightweight and fast)
_decryption_cache: Dict[str, tuple[str, float]] = {}
_CACHE_TTL = 300  # 5 minutes TTL for cached decrypted values


def _get_from_cache(cache_key: str) -> Optional[str]:
    """Get value from cache if not expired"""
    if cache_key in _decryption_cache:
        value, timestamp = _decryption_cache[cache_key]
        if time() - timestamp < _CACHE_TTL:
            return value
        else:
            # Expired, remove from cache
            del _decryption_cache[cache_key]
    return None


def _set_in_cache(cache_key: str, value: str):
    """Store value in cache with current timestamp"""
    _decryption_cache[cache_key] = (value, time())
    
    # Simple cache cleanup: remove expired entries if cache gets too large
    if len(_decryption_cache) > 1000:
        current_time = time()
        expired_keys = [k for k, (_, ts) in _decryption_cache.items() if current_time - ts >= _CACHE_TTL]
        for k in expired_keys:
            del _decryption_cache[k]

def get_encryption_key() -> bytes:
    """
    Get or generate encryption key from environment.
    In production, this should be stored securely (e.g., AWS Secrets Manager, Azure Key Vault).
    """
    key = os.getenv("ENCRYPTION_KEY")
    
    if not key:
        # Generate a new key if not exists
        key = Fernet.generate_key().decode()
        print("⚠️  WARNING: No ENCRYPTION_KEY found in .env. Generated new key:")
        print(f"   Add this to your .env file: ENCRYPTION_KEY={key}")
        print("   ⚠️  IMPORTANT: Save this key securely! Without it, encrypted data cannot be decrypted!")
        print("   ❌ ALL PREVIOUSLY ENCRYPTED DATA WILL BE LOST!")
        
    # Ensure key is bytes and properly formatted
    if isinstance(key, str):
        key = key.strip()  # Remove any whitespace
        key = key.encode()
    
    return key


# Initialize Fernet cipher
try:
    _cipher = Fernet(get_encryption_key())
    print("✅ Encryption initialized successfully")
except Exception as e:
    print(f"❌ FAILED to initialize encryption: {str(e)}")
    print(f"   Check your ENCRYPTION_KEY in .env file")
    raise


def encrypt_value(value: str) -> str:
    """
    Encrypt a string value.
    
    Args:
        value: Plain text string to encrypt
        
    Returns:
        Encrypted string (base64 encoded)
    """
    if not value:
        return value
    
    encrypted_bytes = _cipher.encrypt(value.encode())
    return encrypted_bytes.decode()


def decrypt_value(encrypted_value: str) -> str:
    """
    Decrypt a string value with in-memory caching.
    
    Args:
        encrypted_value: Encrypted string (base64 encoded)
        
    Returns:
        Decrypted plain text string
    """
    if not encrypted_value:
        return encrypted_value
    
    # Check cache first
    cached = _get_from_cache(encrypted_value)
    if cached is not None:
        return cached
    
    try:
        decrypted_bytes = _cipher.decrypt(encrypted_value.encode())
        decrypted_str = decrypted_bytes.decode()
        
        # Store in cache
        _set_in_cache(encrypted_value, decrypted_str)
        
        return decrypted_str
    except Exception as e:
        print(f"❌ DECRYPTION FAILED: {str(e)}")
        print(f"   This usually means:")
        print(f"   1. ENCRYPTION_KEY changed since data was encrypted")
        print(f"   2. Data is corrupted")
        print(f"   3. Wrong encryption key in .env")
        print(f"   ⚠️  Your API keys cannot be recovered without the original key!")
        # Return empty string to avoid breaking the app
        return ""


def encrypt_api_keys(api_keys: Dict[str, str]) -> Dict[str, str]:
    """
    Encrypt all API keys in a dictionary.
    
    Args:
        api_keys: Dictionary of provider -> api_key
        
    Returns:
        Dictionary with encrypted API keys
    """
    if not api_keys:
        return api_keys
    
    return {
        provider: encrypt_value(key)
        for provider, key in api_keys.items()
        if key  # Only encrypt non-empty keys
    }


def decrypt_api_keys(encrypted_keys: Dict[str, str]) -> Dict[str, str]:
    """
    Decrypt all API keys in a dictionary.
    
    Args:
        encrypted_keys: Dictionary of provider -> encrypted_api_key
        
    Returns:
        Dictionary with decrypted API keys
    """
    if not encrypted_keys:
        return encrypted_keys
    
    return {
        provider: decrypt_value(key)
        for provider, key in encrypted_keys.items()
        if key  # Only decrypt non-empty keys
    }
