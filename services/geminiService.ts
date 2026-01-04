
import { modelService } from "./modelService";

export class GeminiRAGService {
  public async expandQuery(
    userQuery: string, 
    availableFileNames: string[], 
    filePreviews: string[], 
    temperature: number = 0.1,
    contextScript: string = "",
    modelId: string = 'cohere/command-r7b-12-2024',
    openRouterKey?: string,
    taggedFileNames: string[] = []
  ): Promise<string> {
    const vaultContext = filePreviews.length > 0 
      ? `KNOWLEDGE VAULT SNAPSHOT:\n${filePreviews.join('\n\n')}`
      : "The vault is currently empty.";

    const historySection = contextScript 
      ? `CONVERSATION LOGS:\n${contextScript}\n\n`
      : "";

    const priorityBlock = taggedFileNames.length > 0
      ? `\nCRITICAL INSTRUCTION: The user has explicitly tagged these files: [${taggedFileNames.join(', ')}]. 
      - You MUST focus your expansion primarily on concepts found in these files.
      - Ignore unrelated content from other files if it conflicts with the tagged files.
      - Ensure the generated keywords are highly specific to the content of these tagged files.`
      : "";

    const systemInstruction = `You are the "Expansion Brain" in a high-fidelity Dual-Brain RAG architecture.
    
    ROLE: 
    Your specific role is to bridge the gap between a user's natural language and the semantic index of our "Knowledge Vault". 
    
    STRATEGY:
    1. Analyze the "CONVERSATION LOGS" for context.
    2. Review the "KNOWLEDGE VAULT SNAPSHOT". ${priorityBlock}
    3. Generate 5-8 dense, descriptive search keywords optimized for finding relevant segments in: ${availableFileNames.join(', ')}.
    
    OUTPUT:
    Return ONLY a comma-separated list of keywords. No preamble.`;

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
    openRouterKey?: string,
    taggedFileNames: string[] = []
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

    const priorityNote = taggedFileNames.length > 0
      ? `\nNote: The user highlighted ${taggedFileNames.join(', ')} as primary sources.\n`
      : "";

    const systemInstruction = `You are the "Expert Reasoner," the primary intelligence in a Dual-Brain RAG system.
    
    TASK:
    1. Synthesize a definitive answer using ONLY the "KNOWLEDGE VAULT" fragments provided. ${priorityNote}
    2. Cite sources using [Document: Name].
    3. If the user query mentions specific files using @ notation, ensure you verify claims against those documents primarily.
    
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

  public async generateSummary(
    userPrompt: string, 
    aiResponse: string, 
    usedFiles: string[], 
    modelId: string, 
    openRouterKey?: string
  ): Promise<string> {
    const filesString = usedFiles.length > 0 ? usedFiles.join(', ') : 'No vault files';
    
    return modelService.run({
      modelId,
      systemInstruction: `You are the "State Tracker" for a Dual-Brain system. Create a single-line summary script to maintain context for the next turn. 
      FORMAT: [Context: ${filesString}] Summary: [1 concise sentence describing the user's intent and the core of the AI's conclusion].`,
      prompt: `Input: ${userPrompt}\n\nResponse: ${aiResponse}`,
      temperature: 0.1,
      openRouterKey
    });
  }
}

export const geminiRAG = new GeminiRAGService();
