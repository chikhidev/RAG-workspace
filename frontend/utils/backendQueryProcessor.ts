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
  abortSignal?: AbortSignal,
  filteredSources?: Array<{ docName: string; text: string }>,
  skipResearch?: boolean,
  priorContext?: string
) {
  setState((prev: any) => ({ ...prev, isProcessing: true }));
  
  let fullAnswer = '';
  let sources: any[] = filteredSources ? [...filteredSources] : [];
  let iterations = 0;
  
  try {
    // Get provider from model service
    const { modelService } = await import('../services/modelService');
    const selectedModelId = modelId || state.selectedModel || 'nvidia/nemotron-3-nano-30b-a3b:free';
    const provider = modelService.getModelProvider(selectedModelId);
    
    // Prepare request
    const request: any = {
      message: query,
      model_id: selectedModelId,
      provider: provider,
      use_vault: state.useVault,
      use_context_history: state.useContextHistory,
      max_iterations: state.maxAgentIterations || 7
    };
    
    // Add filtered sources if provided (for regeneration)
    if (filteredSources) {
      request.filtered_sources = filteredSources;
    }
    
    // Skip research mode (user chose "Generate Answer" after max iterations)
    if (skipResearch) {
      request.skip_research = true;
      if (priorContext) {
        request.prior_context = priorContext;
      }
    }
    
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
          
        case 'source':
          // Stream sources in real-time as they're discovered
          sources.push(event.data);
          setState((prev: any) => ({
            ...prev,
            messages: prev.messages.map((m: any) =>
              m.id === assistantId
                ? {
                    ...m,
                    sources: [...sources]
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
          // Don't overwrite sources if they were already streamed via 'source' events
          // Backend may still send empty array in complete event for backward compatibility
          if (event.data.stopped_at_limit) {
            // Stream ended because of max iterations - don't mark as completed yet
            // The max_iterations_reached handler already set pendingMaxIterations
            break;
          }
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
                      sources: m.sources || sources,  // Use already streamed sources if available
                      iterations: event.data.iterations
                    }
                  }
                : m
            )
          }));
          break;
          
        case 'max_iterations_reached':
          // Pause the stream and ask the user whether to continue or generate answer
          setState((prev: any) => ({
            ...prev,
            isProcessing: false,
            messages: prev.messages.map((m: any) =>
              m.id === assistantId
                ? {
                    ...m,
                    status: 'completed',
                    pendingMaxIterations: true,
                    agentContext: {
                      ...(m.agentContext || {}),
                      originalQuery: query,
                      knowledgeBuffer: event.data.knowledge_buffer || '',
                      iterations: event.data.iterations,
                      sources: sources
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
    setState((prev: any) => ({
      ...prev,
      isProcessing: false,
      // Safety net: if the stream ended without a 'complete' event,
      // force any still-processing assistant message to 'completed'
      messages: prev.messages.map((m: any) =>
        m.id === assistantId && m.status !== 'completed' && m.status !== 'error'
          ? { ...m, status: 'completed' }
          : m
      )
    }));
  }
}
