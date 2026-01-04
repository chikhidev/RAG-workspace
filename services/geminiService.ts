import { modelService } from "./modelService";

export class GeminiRAGService {
  public async expandQuery(
    userQuery: string, 
    availableFileNames: string[], 
    filePreviews: string[], 
    temperature: number = 0.1,
    contextScript: string = "",
    modelId: string = 'nvidia/nemotron-nano-9b-v2:free',
    openRouterKey?: string
  ): Promise<string> {
    const vaultContext = filePreviews.length > 0 
      ? `VAULT CONTENT PREVIEWS:\n${filePreviews.join('\n\n')}`
      : "The vault is currently empty.";

    const historySection = contextScript 
      ? `HISTORICAL CONTEXT:\n${contextScript}\n\n`
      : "";

    const systemInstruction = `You are a high-speed query expansion engine. 
    TASK:
    1. Use the "HISTORICAL CONTEXT" for follow-ups.
    2. Extract 5-8 search keywords likely found in files: ${availableFileNames.join(', ')}.
    3. Return ONLY a comma-separated list. No preamble.`;

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
    modelId: string = 'google/gemma-3-12b-it:free',
    contextScript: string = "",
    openRouterKey?: string
  ): Promise<{ answer: string }> {
    const hasContext = contextChunks.length > 0;
    const contextText = hasContext
      ? contextChunks
          .map((c, i) => `[Source ${i+1}: ${c.docName}]\n${c.text}`)
          .join('\n\n')
      : "NO SPECIFIC RELEVANT CONTEXT CHUNKS FOUND.";

    const historySection = contextScript 
      ? `PAST INTERACTION LOGS:\n${contextScript}\n\n`
      : "";

    const systemInstruction = `You are "The Expert Assistant". 
    Cite sources using [Source X]. Use emojis. 
    ${useVault ? 'Use provided vault context.' : 'Vault disabled.'}`;

    const prompt = `${historySection}User Query: ${userQuery}${useVault ? `\n\nSearch Keywords: ${expandedQuery}\n\nSPECIFIC MATCHING CHUNKS:\n${contextText}` : ''}`;

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
      systemInstruction: `Create a single-line summary script. FORMAT: [Files: ${filesString}] Summary: [1 concise sentence].`,
      prompt: `Input: ${userPrompt}\n\nResponse: ${aiResponse}`,
      temperature: 0.1,
      openRouterKey
    });
  }
}

export const geminiRAG = new GeminiRAGService();