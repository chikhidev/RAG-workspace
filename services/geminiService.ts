import { GoogleGenAI } from "@google/genai";

// Utility for exponential backoff retries
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
  /**
   * Brain #1 (Small/Fast): Gemini 3 Flash
   * Optimized for lightning-fast keyword extraction grounded in vault context.
   */
  public async expandQuery(
    userQuery: string, 
    availableFileNames: string[], 
    filePreviews: string[], 
    temperature: number = 0.1
  ): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    const vaultContext = filePreviews.length > 0 
      ? `VAULT CONTENT PREVIEWS:\n${filePreviews.join('\n\n')}`
      : "The vault is currently empty.";

    return fetchWithRetry(async () => {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `User Query: ${userQuery}\n\n${vaultContext}`,
        config: {
          systemInstruction: `You are an anonymous, high-speed query expansion engine. 
          DO NOT introduce yourself. DO NOT mention your name, "Gemini", or model versions. 

          TASK:
          1. Review the provided vault content previews and file names: ${availableFileNames.join(', ')}.
          2. Extract 5-8 search keywords from the user query that are highly likely to appear in the vault documents based on their previews.
          3. Prioritize terms and vocabulary actually found in the vault previews to ensure high-fidelity retrieval.
          4. Return ONLY a comma-separated list of keywords. No preamble. No explanations.`,
          temperature: temperature,
          maxOutputTokens: 60,
          thinkingConfig: { thinkingBudget: 0 }, 
        },
      });
      return response.text?.trim() || userQuery;
    });
  }

  /**
   * Brain #2: Dynamic Selection
   * Focused on reasoning and synthesizing retrieved context into a high-quality answer.
   */
  public async generateAnswer(
    userQuery: string, 
    expandedQuery: string, 
    contextChunks: any[],
    availableFileNames: string[],
    filePreviews: string[],
    temperature: number = 0.7,
    useVault: boolean = true,
    modelName: string = 'gemini-3-pro-preview'
  ): Promise<{ answer: string }> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    const hasContext = contextChunks.length > 0;
    const contextText = hasContext
      ? contextChunks
          .map((c, i) => `[Source ${i+1}: ${c.docName}]\n${c.text}`)
          .join('\n\n')
      : "NO SPECIFIC RELEVANT CONTEXT CHUNKS FOUND FOR THIS QUERY.";

    const previewsText = useVault && filePreviews.length > 0 
      ? "GLOBAL FILE DIRECTORY (First lines of each available file):\n" + filePreviews.join('\n\n')
      : "Vault searching is currently disabled by the user or no files are indexed.";

    const systemInstruction = `You are "The Expert Assistant". 
    
STRICT IDENTITY RULE:
- NEVER identify yourself as "Gemini".
- NEVER mention being a "Google model" or "large language model".
- NEVER mention your model name (e.g., 3-pro, flash, etc.).
- Simply perform your task as a helpful, high-fidelity synthesis engine.
- You can use emojies for clearing up 🚀🔍💡

TASK CONDUCT:
- Be friendly, respectful, and professional.
- Get straight to the answer. No "Hello, I can help you with that" or similar fluff.
- ${useVault ? 'If specific context chunks are provided, use them to answer.' : 'The user has disabled the knowledge vault for this query. Answer based on your own knowledge but keep the same expert tone.'}
- If specific context matches the query, cite sources using [Source X] format.
- Use Markdown (headers, lists, bold) for better readability.
- Generate a Big title so we know what are we talking about then two new lines and start.

Current Vault State: ${useVault ? 'ENABLED' : 'DISABLED'}`;

    return fetchWithRetry(async () => {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: `User Query: ${userQuery}${useVault ? `\n\nRetrieved Search Result Keywords: ${expandedQuery}\n\nSPECIFIC MATCHING CHUNKS:\n${contextText}\n\n${previewsText}` : ''}`,
        config: {
          systemInstruction,
          thinkingConfig: modelName.includes('pro') ? { thinkingBudget: 4000 } : { thinkingBudget: 0 },
          temperature: temperature,
        },
      });

      return {
        answer: response.text || "I was unable to synthesize an answer. Please review your knowledge vault contents.",
      };
    });
  }
}

export const geminiRAG = new GeminiRAGService();