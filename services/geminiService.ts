import { modelService } from "./modelService";

export class GeminiRAGService {
  public async expandQuery(
    userQuery: string, 
    availableFileNames: string[], 
    filePreviews: string[], 
    temperature: number = 0.1,
    contextScript: string = "",
    modelId: string = 'cohere/command-r7b-12-2024',
    openRouterKey?: string
  ): Promise<string> {
    const vaultContext = filePreviews.length > 0 
      ? `KNOWLEDGE VAULT SNAPSHOT:\n${filePreviews.join('\n\n')}`
      : "The vault is currently empty.";

    const historySection = contextScript 
      ? `CONVERSATION LOGS:\n${contextScript}\n\n`
      : "";

    const systemInstruction = `You are the "Expansion Brain" in a high-fidelity Dual-Brain RAG architecture.
    
    ROLE: 
    Your specific role is to bridge the gap between a user's natural language and the semantic index of our "Knowledge Vault". You are working in tandem with a secondary "Reasoning Brain" that will synthesize your findings.
    
    STRATEGY:
    1. Analyze the "CONVERSATION LOGS" for context if this is a follow-up.
    2. Review the "KNOWLEDGE VAULT SNAPSHOT" to understand the technical language used in the documents.
    3. Generate 5-8 dense, descriptive search keywords or phrases optimized for finding relevant segments in files: ${availableFileNames.join(', ')}.
    
    OUTPUT:
    Return ONLY a comma-separated list of keywords. No preamble, no explanation. Your output is the direct input for the retrieval engine.`;

    const prompt = `${historySection}User Query: ${userQuery}\n\n${vaultContext}`;

    return modelService.run({
      modelId,
      systemInstruction,
      prompt,
      temperature,
      openRouterKey
    });
  }

  public async generateAnswer(
    userQuery: string, 
    expandedQuery: string, 
    contextChunks: any[],
    temperature: number = 0.7,
    useVault: boolean = true,
    modelId: string = 'openai/gpt-oss-safeguard-20b',
    contextScript: string = "",
    openRouterKey?: string
  ): Promise<{ answer: string }> {
    const hasContext = contextChunks.length > 0;
    const contextText = hasContext
      ? contextChunks
          .map((c, i) => `[Document: ${c.docName} | Segment ${i+1}]\n${c.text}`)
          .join('\n\n')
      : "NO RELEVANT FRAGMENTS RETRIEVED FROM VAULT.";

    const historySection = contextScript 
      ? `HISTORICAL SESSION CONTEXT:\n${contextScript}\n\n`
      : "";

    const systemInstruction = `You are the "Expert Reasoner," the primary intelligence in a Dual-Brain RAG system.
    
    CONTEXT:
    A specialized "Expansion Brain" has already processed the user's query into the following search vector: "${expandedQuery}". Using this, we have retrieved the most relevant technical fragments from our "Knowledge Vault".
    
    YOUR TASK:
    1. Synthesize a definitive answer using ONLY the "KNOWLEDGE VAULT" fragments provided below.
    2. If the fragments are insufficient, acknowledge the limitation but provide the best possible reasoning based on session history.
    3. Use technical precision. Cite your sources using [Document: Name].
    4. Maintain the persona of a highly sophisticated synthesis engine.
    
    VAULT DATA:
    ${contextText}`;

    const prompt = `${historySection}User Query: ${userQuery}`;

    const answer = await modelService.run({
      modelId,
      systemInstruction,
      prompt,
      temperature,
      openRouterKey
    });

    return { answer };
  }

  public async generateSummary(userPrompt: string, aiResponse: string, usedFiles: string[], openRouterKey?: string): Promise<string> {
    const filesString = usedFiles.length > 0 ? usedFiles.join(', ') : 'No vault files';
    
    return modelService.run({
      modelId: 'nvidia/nemotron-nano-9b-v2:free',
      systemInstruction: `You are the "State Tracker" for a Dual-Brain system. Create a single-line summary script to maintain context for the next turn. 
      FORMAT: [Context: ${filesString}] Summary: [1 concise sentence describing the user's intent and the core of the AI's conclusion].`,
      prompt: `Input: ${userPrompt}\n\nResponse: ${aiResponse}`,
      temperature: 0.1,
      openRouterKey
    });
  }
}

export const geminiRAG = new GeminiRAGService();