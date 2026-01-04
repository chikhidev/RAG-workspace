import { GoogleGenAI } from "@google/genai";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchWithRetry<T>(
  fn: () => Promise<T>, 
  maxRetries: number = 3, 
  initialDelay: number = 2000
): Promise<T> {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      const isQuotaError = err.message?.includes("429") || err.message?.includes("RESOURCE_EXHAUSTED");
      
      if (isQuotaError && i < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, i);
        console.warn(`Quota exceeded. Retrying in ${delay}ms... (Attempt ${i + 1}/${maxRetries})`);
        await sleep(delay);
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

export class GeminiRAGService {
  // Always initialize a fresh client right before use to ensure the most up-to-date environment variables.
  private getClient() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY! });
  }

  public async expandQuery(
    userQuery: string, 
    availableFileNames: string[], 
    filePreviews: string[], 
    temperature: number = 0.1,
    contextScript: string = "",
    model: string = 'gemini-3-flash-preview'
  ): Promise<string> {
    const ai = this.getClient();
    const vaultContext = filePreviews.length > 0 
      ? `VAULT CONTENT PREVIEWS:\n${filePreviews.join('\n\n')}`
      : "The vault is currently empty.";

    const historySection = contextScript 
      ? `HISTORICAL CONTEXT (Past turns summaries):\n${contextScript}\n\n`
      : "";

    return fetchWithRetry(async () => {
      // Fix: Removed maxOutputTokens when using thinkingConfig to prevent truncated responses.
      const response = await ai.models.generateContent({
        model: model,
        contents: `${historySection}User Query: ${userQuery}\n\n${vaultContext}`,
        config: {
          systemInstruction: `You are an anonymous, high-speed query expansion engine. 
          TASK:
          1. Use the "HISTORICAL CONTEXT" for follow-ups.
          2. Extract 5-8 search keywords likely found in files: ${availableFileNames.join(', ')}.
          3. Return ONLY a comma-separated list. No preamble.`,
          temperature: temperature,
          thinkingConfig: model.includes('pro') ? { thinkingBudget: 1000 } : { thinkingBudget: 0 }, 
        },
      });
      // Correctly access response text as a property.
      return response.text?.trim() || userQuery;
    });
  }

  public async generateAnswer(
    userQuery: string, 
    expandedQuery: string, 
    contextChunks: any[],
    availableFileNames: string[],
    filePreviews: string[],
    temperature: number = 0.7,
    useVault: boolean = true,
    modelName: string = 'gemini-3-pro-preview',
    contextScript: string = ""
  ): Promise<{ answer: string }> {
    const ai = this.getClient();
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
    Cite sources using [Source X]. Generate a Big title. Use emojis. 
    ${useVault ? 'Use provided vault context.' : 'Vault disabled.'}`;

    return fetchWithRetry(async () => {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: `${historySection}User Query: ${userQuery}${useVault ? `\n\nSearch Keywords: ${expandedQuery}\n\nSPECIFIC MATCHING CHUNKS:\n${contextText}` : ''}`,
        config: {
          systemInstruction,
          thinkingConfig: modelName.includes('pro') ? { thinkingBudget: 4000 } : { thinkingBudget: 0 },
          temperature: temperature,
        },
      });

      return {
        answer: response.text || "Synthesis failed.",
      };
    });
  }

  public async generateSummary(userPrompt: string, aiResponse: string, usedFiles: string[]): Promise<string> {
    const ai = this.getClient();
    const filesString = usedFiles.length > 0 ? usedFiles.join(', ') : 'No vault files';
    
    return fetchWithRetry(async () => {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Input: ${userPrompt}\n\nResponse: ${aiResponse}`,
        config: {
          systemInstruction: `Create a single-line summary script. FORMAT: [Files: ${filesString}] Summary: [1 concise sentence].`,
          temperature: 0.1,
        },
      });
      return response.text?.trim() || "Summary failed.";
    });
  }
}

export const geminiRAG = new GeminiRAGService();