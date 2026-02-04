import chromadb
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer
import shutil
import os

CHROMA_PATH = "chroma_db"

# Initialize ChromaDB Client
client = chromadb.PersistentClient(path=CHROMA_PATH)

# Embedding Function
class LocalEmbeddingFunction:
    def __init__(self):
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        
    def __call__(self, input):
        return self.model.encode(input).tolist()

embedding_fn = LocalEmbeddingFunction()

def get_collection(user_id: int):
    collection_name = f"user_{user_id}_docs"
    return client.get_or_create_collection(
        name=collection_name, 
        embedding_function=embedding_fn
    )

def add_documents(user_id: int, documents: list[dict]):
    """
    documents: list of dicts with {'id': str, 'text': str, 'metadata': dict}
    """
    collection = get_collection(user_id)
    
    ids = [d['id'] for d in documents]
    documents_text = [d['text'] for d in documents]
    metadatas = [d['metadata'] for d in documents]
    
    collection.upsert(
        ids=ids,
        documents=documents_text,
        metadatas=metadatas
    )

def search(user_id: int, query: str, n_results: int = 5):
    collection = get_collection(user_id)
    results = collection.query(
        query_texts=[query],
        n_results=n_results
    )
    return results
