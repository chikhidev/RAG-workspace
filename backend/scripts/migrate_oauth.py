"""
Database migration to add OAuth fields to User model and model field to Message
Run this script to update your existing database with OAuth and conversation improvements
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from sqlalchemy import create_engine, text
from app.database import SQLALCHEMY_DATABASE_URL

def migrate():
    engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
    
    with engine.connect() as conn:
        # OAuth migrations
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN oauth_provider VARCHAR"))
            print("✓ Added oauth_provider column")
        except Exception as e:
            print(f"oauth_provider column might already exist: {e}")
        
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN oauth_id VARCHAR"))
            print("✓ Added oauth_id column")
        except Exception as e:
            print(f"oauth_id column might already exist: {e}")
        
        # Message model field migration
        try:
            conn.execute(text("ALTER TABLE messages ADD COLUMN model VARCHAR"))
            print("✓ Added model column to messages")
        except Exception as e:
            print(f"model column might already exist: {e}")
        
        try:
            print("⚠ Note: hashed_password nullability must be updated manually for SQLite")
            print("  For PostgreSQL/MySQL, you can run: ALTER TABLE users MODIFY COLUMN hashed_password VARCHAR NULL")
        except Exception as e:
            print(f"Error updating hashed_password: {e}")
        
        conn.commit()
        print("\n✓ Migration completed successfully!")
        print("\nNext steps:")
        print("1. Copy backend/.env.example to backend/.env")
        print("2. Add your Google OAuth credentials to backend/.env")
        print("3. Restart your backend server")

if __name__ == "__main__":
    print("Starting database migration for OAuth and conversation improvements...\n")
    migrate()
