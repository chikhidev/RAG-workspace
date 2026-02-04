"""
Comprehensive RAG Engine with Agent Loop, Multi-Step Reasoning, and Streaming Events
"""
from google import genai
from typing import AsyncGenerator, Dict, List, Optional, Any
import json
import re
import asyncio
from . import models, vector_store

class AgentRAGEngine:
    """Advanced RAG engine with agentic behavior and streaming events"""
    
    def __init__(self, user: models.User):
        self.user = user
        self.api_keys = user.config.api_keys if user.config else {}
        self.model_pref = user.config.model_preference if user.config else "gemini-2.0-flash-thinking-exp"
        self.settings = user.config.settings if user.config else {}
        self.context_script = user.config.context_script if user.config else ""
        self.custom_context = user.config.custom_context if user.config else ""
        
    async def process_query_stream(
        self,
        query: str,
        documents: List[Dict],
        use_vault: bool = True,
        use_context_history: bool = False,
        max_iterations: int = 7
    ) -> AsyncGenerator[str, None]:
        """
        Main entry point for query processing with full agent loop
        Yields Server-Sent Events (SSE) formatted messages
        """
        
        if not use_vault or not documents:
            # Direct query without RAG
            async for event in self._direct_generation(query):
                yield event
            return
        
        # Start agent loop
        knowledge_buffer = ""
        sources = []
        iteration = 0
        
        yield self._sse_event('status', {
            'status': 'planning',
            'message': 'Analyzing query and planning research...'
        })
        
        while iteration < max_iterations:
            iteration += 1
            
            yield self._sse_event('iteration', {
                'iteration': iteration,
                'max_iterations': max_iterations
            })
            
            # Decide next action
            action = await self._decide_next_action(
                query=query,
                knowledge_buffer=knowledge_buffer,
                documents=documents,
                iteration=iteration
            )
            
            yield self._sse_event('thought', {
                'step': action.get('type', 'unknown'),
                'thought': action.get('thought', ''),
                'iteration': iteration
            })
            
            if action['type'] == 'conclude':
                break
            
            # Execute action and update knowledge
            if action['type'] == 'search':
                yield self._sse_event('status', {
                    'status': 'searching',
                    'message': f"Searching: {action.get('query', '')[:50]}..."
                })
                
                # Highlight files
                target_files = action.get('target_files', [])
                if target_files:
                    yield self._sse_event('highlight', {
                        'files': target_files
                    })
                
                # Perform search
                results = await self._semantic_search(
                    action.get('query', query),
                    documents,
                    target_files,
                    top_k=action.get('expected_chunks', 3)
                )
                
                # Clear highlights
                yield self._sse_event('highlight', {
                    'files': []
                })
                
                # Update knowledge buffer
                result_text = '\n'.join([f"[{r['filename']}]: {r['text']}" for r in results])
                knowledge_buffer += f"\n--- Search Result (Iter {iteration}) ---\n{result_text}\n"
                sources.extend(results)
                
            elif action['type'] == 'grep':
                yield self._sse_event('status', {
                    'status': 'searching',
                    'message': f"Grep: {action.get('pattern', '')}"
                })
                
                target_files = action.get('target_files', [])
                if target_files:
                    yield self._sse_event('highlight', {
                        'files': target_files
                    })
                
                grep_results = await self._grep_search(
                    pattern=action.get('pattern', ''),
                    documents=documents,
                    target_files=target_files,
                    case_sensitive=action.get('case_sensitive', False)
                )
                
                yield self._sse_event('highlight', {
                    'files': []
                })
                
                knowledge_buffer += f"\n--- Grep Result (Iter {iteration}) ---\n{grep_results}\n"
                
            elif action['type'] == 'read_lines':
                yield self._sse_event('status', {
                    'status': 'searching',
                    'message': f"Reading {action.get('filename', '')}..."
                })
                
                filename = action.get('filename', '')
                if filename:
                    yield self._sse_event('highlight', {
                        'files': [filename]
                    })
                
                lines_result = await self._read_lines(
                    filename=filename,
                    start_line=action.get('start_line', 1),
                    end_line=action.get('end_line', 100),
                    documents=documents
                )
                
                yield self._sse_event('highlight', {
                    'files': []
                })
                
                knowledge_buffer += f"\n--- Read Lines (Iter {iteration}) ---\n{lines_result}\n"
        
        # Generate final answer
        yield self._sse_event('status', {
            'status': 'generating',
            'message': 'Generating comprehensive answer...'
        })
        
        async for chunk in self._generate_answer_stream(query, knowledge_buffer, sources):
            yield self._sse_event('answer', {
                'content': chunk
            })
        
        # Send completion
        yield self._sse_event('complete', {
            'sources': sources,
            'iterations': iteration
        })
    
    def _sse_event(self, event_type: str, data: Dict) -> str:
        """Format data as Server-Sent Event"""
        return f"event: {event_type}\ndata: {json.dumps(data)}\n\n"
    
    async def _decide_next_action(
        self,
        query: str,
        knowledge_buffer: str,
        documents: List[Dict],
        iteration: int
    ) -> Dict:
        """Use LLM to decide what to do next"""
        
        available_files = [doc['filename'] for doc in documents if doc.get('enabled', True)]
        file_previews = [f"{doc['filename']}: {doc['content'][:300]}..." for doc in documents if doc.get('enabled', True)]
        
        prompt = f"""You are a research assistant. Decide the next action to answer the user's query.

USER QUERY: {query}

AVAILABLE FILES:
{chr(10).join(available_files)}

FILE PREVIEWS:
{chr(10).join(file_previews[:5])}

CURRENT KNOWLEDGE:
{knowledge_buffer[:1000] if knowledge_buffer else "No information gathered yet"}

ITERATION: {iteration}

Choose ONE action:
1. "search" - Semantic search with a specific query
2. "grep" - Search for exact patterns/keywords
3. "read_lines" - Read specific lines from a file
4. "conclude" - Enough information gathered, generate answer

Respond in JSON format:
{{
    "type": "search|grep|read_lines|conclude",
    "query": "search query" (for search),
    "pattern": "pattern" (for grep),
    "filename": "file.txt" (for read_lines),
    "start_line": 1 (for read_lines),
    "end_line": 100 (for read_lines),
    "target_files": ["file1.txt"] (optional),
    "expected_chunks": 3 (for search),
    "case_sensitive": false (for grep),
    "thought": "why this action"
}}
"""
        
        try:
            # Call LLM to decide
            client = genai.Client(api_key=self.api_keys.get('google', ''))
            response = client.models.generate_content(
                model=self.model_pref,
                contents=prompt
            )
            
            # Parse JSON response
            text = response.text
            # Extract JSON from markdown code blocks if present
            json_match = re.search(r'```json\n(.*?)\n```', text, re.DOTALL)
            if json_match:
                text = json_match.group(1)
            
            action = json.loads(text)
            return action
            
        except Exception as e:
            # Default action on error
            if iteration == 1:
                return {
                    'type': 'search',
                    'query': query,
                    'expected_chunks': 3,
                    'thought': 'Initial semantic search'
                }
            else:
                return {
                    'type': 'conclude',
                    'thought': 'Error in planning, concluding'
                }
    
    async def _semantic_search(
        self,
        query: str,
        documents: List[Dict],
        target_files: List[str] = None,
        top_k: int = 3
    ) -> List[Dict]:
        """Perform semantic search using vector store"""
        try:
            # Use the existing vector_store
            search_results = vector_store.search(
                user_id=self.user.id,
                query_text=query,
                n_results=top_k
            )
            
            results = []
            if search_results and search_results.get('documents'):
                docs = search_results['documents'][0]
                metadatas = search_results.get('metadatas', [[]])[0]
                
                for i, doc_text in enumerate(docs):
                    metadata = metadatas[i] if i < len(metadatas) else {}
                    filename = metadata.get('filename', 'unknown')
                    
                    # Filter by target files if specified
                    if target_files and filename not in target_files:
                        continue
                    
                    results.append({
                        'filename': filename,
                        'text': doc_text,
                        'doc_id': metadata.get('doc_id', '')
                    })
            
            return results
        except Exception as e:
            return []
    
    async def _grep_search(
        self,
        pattern: str,
        documents: List[Dict],
        target_files: List[str] = None,
        case_sensitive: bool = False
    ) -> str:
        """Search for exact patterns in documents"""
        results = []
        
        for doc in documents:
            if not doc.get('enabled', True):
                continue
            
            filename = doc['filename']
            if target_files and filename not in target_files:
                continue
            
            content = doc['content']
            lines = content.split('\n')
            
            for line_num, line in enumerate(lines, 1):
                if case_sensitive:
                    if pattern in line:
                        results.append(f"{filename}:{line_num}: {line.strip()}")
                else:
                    if pattern.lower() in line.lower():
                        results.append(f"{filename}:{line_num}: {line.strip()}")
                
                if len(results) >= 20:
                    break
        
        return '\n'.join(results) if results else "No matches found"
    
    async def _read_lines(
        self,
        filename: str,
        start_line: int,
        end_line: int,
        documents: List[Dict]
    ) -> str:
        """Read specific lines from a document"""
        for doc in documents:
            if doc['filename'] == filename:
                lines = doc['content'].split('\n')
                selected_lines = lines[start_line-1:end_line]
                return '\n'.join([f"{i+start_line}: {line}" for i, line in enumerate(selected_lines)])
        
        return f"File {filename} not found"
    
    async def _generate_answer_stream(
        self,
        query: str,
        knowledge_buffer: str,
        sources: List[Dict]
    ) -> AsyncGenerator[str, None]:
        """Generate final answer using LLM with streaming"""
        
        context_text = knowledge_buffer
        history = self.context_script if self.context_script else ""
        
        prompt = f"""You are a knowledgeable assistant. Answer the user's question based on the research findings.

{"CONVERSATION HISTORY:" + chr(10) + history + chr(10) if history else ""}

RESEARCH FINDINGS:
{context_text}

USER QUESTION:
{query}

Provide a comprehensive, well-structured answer based on the research findings. Cite sources when relevant.
"""
        
        try:
            client = genai.Client(api_key=self.api_keys.get('google', ''))
            response = client.models.generate_content_stream(
                model=self.model_pref,
                contents=prompt,
                config={
                    'system_instruction': self.custom_context or "You are a helpful AI assistant."
                }
            )
            
            for chunk in response:
                if chunk.text:
                    yield chunk.text
                    
        except Exception as e:
            yield f"\n\nError generating response: {str(e)}"
    
    async def _direct_generation(self, query: str) -> AsyncGenerator[str, None]:
        """Generate answer without RAG"""
        yield self._sse_event('status', {
            'status': 'generating',
            'message': 'Generating answer...'
        })
        
        try:
            client = genai.Client(api_key=self.api_keys.get('google', ''))
            response = client.models.generate_content_stream(
                model=self.model_pref,
                contents=query,
                config={
                    'system_instruction': self.custom_context or "You are a helpful AI assistant."
                }
            )
            
            for chunk in response:
                if chunk.text:
                    yield self._sse_event('answer', {
                        'content': chunk.text
                    })
                    
        except Exception as e:
            yield self._sse_event('error', {
                'message': str(e)
            })
        
        yield self._sse_event('complete', {
            'sources': [],
            'iterations': 0
        })
