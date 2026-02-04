from google import genai
from typing import AsyncGenerator
from . import models, vector_store

class RagEngine:
    def __init__(self, user: models.User):
        self.user = user
        self.api_keys = user.config.api_keys if user.config else {}
        self.model_pref = user.config.model_preference if user.config else "gemini-1.5-pro"
        
    async def generate_stream(self, message: str, use_vault: bool, active_files: list[str]) -> AsyncGenerator[str, None]:
        # 1. Setup Provider
        gemini_key = self.api_keys.get("google")
        
        if not gemini_key:
            yield "Error: Google API Key not found in configuration."
            return

        client = genai.Client(api_key=gemini_key)
        
        # 2. Retrieve Context if Vault is used
        context_text = ""
        if use_vault:
            # Perform search
            search_results = vector_store.search(self.user.id, message, n_results=5)
            
            # Extract text from results
            if search_results and search_results['documents']:
                retrieved_docs = search_results['documents'][0]
                metadatas = search_results['metadatas'][0]
                
                context_parts = []
                for i, doc_text in enumerate(retrieved_docs):
                    source = metadatas[i].get('filename', 'Unknown')
                    context_parts.append(f"[Source: {source}]\n{doc_text}")
                
                context_text = "\n\n".join(context_parts)
        
        # 3. Construct Prompt
        system_instruction = self.user.config.custom_instructions if self.user.config and self.user.config.custom_instructions else "You are a helpful AI assistant."
        
        full_prompt = message
        if context_text:
            full_prompt = f"""Use the following context to answer the user's question. if the answer is not in the context, say so.
            
CONTEXT:
{context_text}

USER QUESTION:
{message}
"""
        
        # 4. Stream Response
        try:
            # Using the new google-genai SDK
            response = client.models.generate_content_stream(
                model='gemini-1.5-pro',
                contents=full_prompt,
                config={
                    'system_instruction': system_instruction
                }
            )
            
            for chunk in response:
                if chunk.text:
                    yield chunk.text
        except Exception as e:
            yield f"\n\nError generating response: {str(e)}"

