/**
 * Backend Chat Service - Handles all communication with backend RAG engine
 * All LLM interactions happen in backend for security
 */

interface ChatRequest {
  message: string;
  model_id?: string;
  provider?: string;
  use_vault: boolean;
  use_context_history: boolean;
  max_iterations: number;
  filtered_sources?: Array<{ docName: string; text: string }>;
}

interface StreamEvent {
  type: 'status' | 'iteration' | 'thought' | 'highlight' | 'answer' | 'complete' | 'error' | 'source' | 'max_iterations_reached';
  data: any;
}

export class BackendChatService {
  private baseUrl: string;
  
  constructor() {
    this.baseUrl = '/api';
  }
  
  /**
   * Stream chat responses from backend
   * Yields events as they arrive via Server-Sent Events (SSE)
   * Supports abortion via AbortSignal
   */
  async *streamChat(
    authToken: string,
    request: ChatRequest,
    signal?: AbortSignal
  ): AsyncGenerator<StreamEvent, void, unknown> {
    // Debug: Log the request being sent
    console.log('[BackendChat] Sending request:', JSON.stringify(request, null, 2));
    
    const response = await fetch(`${this.baseUrl}/chat/stream`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request),
      signal: signal
    });
    
    if (!response.ok) {
      throw new Error(`Chat request failed: ${response.statusText}`);
    }
    
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    
    if (!reader) {
      throw new Error('No response body');
    }
    
    let buffer = '';
    
    try {
      // Track currentEvent across reads — event: and data: lines
      // may be split across TCP chunks
      let currentEvent: string | null = null;
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          // Flush remaining buffer (final decode without stream flag)
          buffer += decoder.decode();
          break;
        }
        
        // Check if aborted
        if (signal?.aborted) {
          console.log('[BackendChat] Stream aborted by user');
          break;
        }
        
        // Decode chunk
        buffer += decoder.decode(value, { stream: true });
        
        // Process complete SSE messages
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer
        
        for (const line of lines) {
          if (line.startsWith('event:')) {
            currentEvent = line.substring(6).trim();
          } else if (line.startsWith('data:')) {
            const dataStr = line.substring(5).trim();
            
            if (dataStr && currentEvent) {
              try {
                const data = JSON.parse(dataStr);
                yield {
                  type: currentEvent as StreamEvent['type'],
                  data
                };
              } catch (e) {
                console.error('Failed to parse SSE data:', dataStr);
              }
            }
            
            currentEvent = null;
          }
        }
      }
      
      // Process any remaining buffer content after stream ends
      if (buffer.trim()) {
        const remainingLines = buffer.split('\n');
        for (const line of remainingLines) {
          if (line.startsWith('event:')) {
            currentEvent = line.substring(6).trim();
          } else if (line.startsWith('data:')) {
            const dataStr = line.substring(5).trim();
            if (dataStr && currentEvent) {
              try {
                const data = JSON.parse(dataStr);
                yield {
                  type: currentEvent as StreamEvent['type'],
                  data
                };
              } catch (e) {
                console.error('Failed to parse remaining SSE data:', dataStr);
              }
            }
            currentEvent = null;
          }
        }
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('[BackendChat] Request aborted');
        // Don't throw, just exit gracefully
        return;
      }
      throw error;
    } finally {
      reader.releaseLock();
    }
  }
}

export const backendChatService = new BackendChatService();
