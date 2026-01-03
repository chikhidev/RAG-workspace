import { GoogleGenAI } from "@google/genai";

// Service for RAG operations using dual-brain architecture
export class GeminiRAGService {
  private ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

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
    const vaultContext = filePreviews.length > 0 
      ? `VAULT CONTENT PREVIEWS:\n${filePreviews.join('\n\n')}`
      : "The vault is currently empty.";

    const response = await this.ai.models.generateContent({
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
  }

  /**
   * Brain #2 (Large/Smart): Gemini 3 Pro
   * Focused on reasoning and synthesizing retrieved context into a high-quality answer.
   */
  public async generateAnswer(
    userQuery: string, 
    expandedQuery: string, 
    contextChunks: any[],
    availableFileNames: string[],
    filePreviews: string[], // First lines/previews of all files
    temperature: number = 0.7
  ): Promise<{ answer: string }> {
    const hasContext = contextChunks.length > 0;
    const contextText = hasContext
      ? contextChunks
          .map((c, i) => `[Source ${i+1}: ${c.docName}]\n${c.text}`)
          .join('\n\n')
      : "NO SPECIFIC RELEVANT CONTEXT CHUNKS FOUND FOR THIS QUERY.";

    const previewsText = filePreviews.length > 0 
      ? "GLOBAL FILE DIRECTORY (First lines of each available file):\n" + filePreviews.join('\n\n')
      : "No files available in the knowledge vault.";

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
- If specific context chunks are provided, use them to answer.
- If NO specific context matches the query, use the "GLOBAL FILE DIRECTORY" previews provided to understand what documents are in the vault. If the answer is clearly not in any document, politely inform the user and offer a general answer or guidance based on your internal knowledge.
- cite sources using [Source X] format.
- Use Markdown (headers, lists, bold) for better readability.
- Generate a Big title so we know what are we talking about then two new lines and start

Current Vault Contents: ${availableFileNames.join(', ')}`;

    const response = await this.ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `User Query: ${userQuery}\n\nRetrieved Search Result Keywords: ${expandedQuery}\n\nSPECIFIC MATCHING CHUNKS:\n${contextText}\n\n${previewsText}`,
      config: {
        systemInstruction,
        thinkingConfig: { thinkingBudget: 4000 },
        temperature: temperature,
      },
    });

    return {
      answer: response.text || "I was unable to synthesize an answer. Please review your knowledge vault contents.",
    };
  }
}

export const geminiRAG = new GeminiRAGService();