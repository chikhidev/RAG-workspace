#!/usr/bin/env python3
"""
Database migration script to add new columns to existing database
"""
import sqlite3
import os

# Update to match the actual database path used by the app
DB_PATH = "database/sql_app_v3.db"

def migrate():
    if not os.path.exists(DB_PATH):
        print("Database does not exist yet, will be created on first run")
        return
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # Check and add columns to user_configs table
        cursor.execute("PRAGMA table_info(user_configs)")
        columns = [col[1] for col in cursor.fetchall()]
        
        if 'context_script' not in columns:
            print("Adding context_script column...")
            cursor.execute("ALTER TABLE user_configs ADD COLUMN context_script TEXT DEFAULT ''")
        
        if 'custom_context' not in columns:
            print("Adding custom_context column...")
            cursor.execute("ALTER TABLE user_configs ADD COLUMN custom_context TEXT DEFAULT ''")
        
        if 'settings' not in columns:
            print("Adding settings column...")
            cursor.execute("ALTER TABLE user_configs ADD COLUMN settings TEXT DEFAULT '{}'")
        
        if 'mind_maps' not in columns:
            print("Adding mind_maps column...")
            cursor.execute("ALTER TABLE user_configs ADD COLUMN mind_maps TEXT DEFAULT '[]'")
        
        # Check and add columns to documents table
        cursor.execute("PRAGMA table_info(documents)")
        columns = [col[1] for col in cursor.fetchall()]
        
        if 'doc_id' not in columns:
            print("Adding doc_id column...")
            cursor.execute("ALTER TABLE documents ADD COLUMN doc_id TEXT")
            # Populate doc_id for existing documents
            cursor.execute("UPDATE documents SET doc_id = 'doc_' || id WHERE doc_id IS NULL")
        
        if 'content' not in columns:
            print("Adding content column...")
            cursor.execute("ALTER TABLE documents ADD COLUMN content TEXT DEFAULT ''")
        
        if 'enabled' not in columns:
            print("Adding enabled column...")
            cursor.execute("ALTER TABLE documents ADD COLUMN enabled INTEGER DEFAULT 1")
        
        # Check if messages table exists and add metadata column
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='messages'")
        if cursor.fetchone():
            cursor.execute("PRAGMA table_info(messages)")
            columns = [col[1] for col in cursor.fetchall()]
            
            if 'extra_data' not in columns:
                print("Adding extra_data column to messages...")
                cursor.execute("ALTER TABLE messages ADD COLUMN extra_data TEXT DEFAULT '{}'")
        
        conn.commit()
        print("Migration completed successfully!")
        
    except Exception as e:
        print(f"Migration error: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    migrate()
