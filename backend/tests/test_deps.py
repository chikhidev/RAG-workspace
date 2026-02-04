try:
    import multipart
    print("python-multipart installed")
except ImportError:
    print("python-multipart NOT installed")

try:
    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    hash = pwd_context.hash("test")
    print(f"Bcrypt hash generated: {hash[:10]}...")
    print("passlib[bcrypt] working")
except Exception as e:
    print(f"passlib error: {e}")

try:
    import google.genai
    print("google-genai installed")
except ImportError:
    print("google-genai NOT installed")
