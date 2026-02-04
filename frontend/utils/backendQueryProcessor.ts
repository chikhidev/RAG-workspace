/**
 * Backend-powered process query function
 * Replaces frontend RAG logic with backend API calls
 */

import { backendChatService } from '../services/backendChatService';

export async function processQueryWithBackend(
  query: string,
  assistantId: string,
  authToken: string,
  state: any,
  setState: Function,
  setActiveFileNames: Function,
  addToast: Function,
  modelId?: string,
  abortSignal?: AbortSignal
) {
  setState((prev: any) => ({ ...prev, isProcessing: true }));
  
  let fullAnswer = '';
  let sources: any[] = [];
  let iterations = 0;
  
  try {
    // Get provider from model service
    const { modelService } = await import('../services/modelService');
    const selectedModelId = modelId || state.selectedModel || 'nvidia/nemotron-3-nano-30b-a3b:free';
    const provider = modelService.getModelProvider(selectedModelId);
    
    // Prepare request
    const request = {
      message: query,
      model_id: selectedModelId,
      provider: provider,
      use_vault: state.useVault,
      use_context_history: state.useContextHistory,
      max_iterations: state.maxAgentIterations || 7
    };
    
    // Stream events from backend with abort signal
    for await (const event of backendChatService.streamChat(authToken, request, abortSignal)) {
      switch (event.type) {
        case 'status':
          setState((prev: any) => ({
            ...prev,
            messages: prev.messages.map((m: any) =>
              m.id === assistantId
                ? {
                    ...m,
                    status: event.data.status,
                    activeSubQuery: event.data.message
                  }
                : m
            )
          }));
          break;
          
        case 'iteration':
          iterations = event.data.iteration;
          setState((prev: any) => ({
            ...prev,
            messages: prev.messages.map((m: any) =>
              m.id === assistantId
                ? {
                    ...m,
                    agentContext: {
                      ...(m.agentContext || {}),
                      iterations: event.data.iteration
                    }
                  }
                : m
            )
          }));
          break;
          
        case 'thought':
          setState((prev: any) => ({
            ...prev,
            messages: prev.messages.map((m: any) =>
              m.id === assistantId
                ? {
                    ...m,
                    thoughtLogs: [
                      ...(m.thoughtLogs || []),
                      {
                        timestamp: Date.now(),
                        step: event.data.step,
                        thought: event.data.thought,
                        turn: event.data.iteration
                      }
                    ]
                  }
                : m
            )
          }));
          break;
          
        case 'highlight':
          setActiveFileNames(event.data.files || []);
          break;
        
        case 'edit_proposal':
          // Add edit proposal to message for user approval
          setState((prev: any) => ({
            ...prev,
            messages: prev.messages.map((m: any) =>
              m.id === assistantId
                ? {
                    ...m,
                    editProposals: [
                      ...(m.editProposals || []),
                      {
                        id: `edit_${Date.now()}`,
                        filename: event.data.filename,
                        doc_id: event.data.doc_id,
                        find: event.data.find,
                        replace: event.data.replace,
                        original_content: event.data.original_content,
                        new_content: event.data.new_content,
                        diff: event.data.diff,
                        changes_count: event.data.changes_count,
                        iteration: event.data.iteration,
                        status: 'pending' // pending, approved, rejected
                      }
                    ]
                  }
                : m
            )
          }));
          break;
          
        case 'answer':
          fullAnswer += event.data.content;
          setState((prev: any) => ({
            ...prev,
            messages: prev.messages.map((m: any) =>
              m.id === assistantId
                ? {
                    ...m,
                    content: fullAnswer,
                    status: 'reasoning'
                  }
                : m
            )
          }));
          break;
          
        case 'complete':
          sources = event.data.sources || [];
          setState((prev: any) => ({
            ...prev,
            messages: prev.messages.map((m: any) =>
              m.id === assistantId
                ? {
                    ...m,
                    status: 'completed',
                    content: fullAnswer,
                    agentContext: {
                      ...(m.agentContext || {}),
                      sources: sources,
                      iterations: event.data.iterations
                    }
                  }
                : m
            )
          }));
          break;
          
        case 'error':
          const errorCode = event.data.code;
          const errorMessage = event.data.message || 'Error processing query';
          
          // Check if it's an API key missing error
          if (errorCode && errorCode.startsWith('api_key_missing_')) {
            const provider = errorCode.replace('api_key_missing_', '');
            addToast(`${provider.toUpperCase()} API key not configured`, 'error');
            
            // Show API management modal
            setState((prev: any) => ({
              ...prev,
              showApiKeyManagement: true,
              messages: prev.messages.map((m: any) =>
                m.id === assistantId
                  ? { ...m, status: 'error', content: errorMessage }
                  : m
              )
            }));
          } else {
            addToast(errorMessage, 'error');
            setState((prev: any) => ({
              ...prev,
              messages: prev.messages.map((m: any) =>
                m.id === assistantId
                  ? {
                      ...m,
                      status: 'error',
                      content: fullAnswer || errorMessage
                    }
                  : m
              )
            }));
          }
          break;
      }
    }
  } catch (err: any) {
    // Don't show error toast if request was aborted by user
    if (err.name === 'AbortError' || abortSignal?.aborted) {
      console.log('[QueryProcessor] Request aborted by user');
      // Message was already marked as stopped in handleStop
    } else {
      addToast(err.message || 'Pipeline error', 'error');
      setState((prev: any) => ({
        ...prev,
        messages: prev.messages.map((m: any) =>
          m.id === assistantId ? { ...m, status: 'error' } : m
        )
      }));
    }
  } finally {
    setActiveFileNames([]);
    setState((prev: any) => ({ ...prev, isProcessing: false }));
  }
}
