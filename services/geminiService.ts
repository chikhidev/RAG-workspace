
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

    // const priorityBlock = taggedFileNames.length > 0
    //   ? `\nCRITICAL INSTRUCTION: The user has explicitly tagged these files: [${taggedFileNames.join(', ')}]. 
    //   - You MUST focus your expansion primarily on concepts found in these files.
    //   - Ignore unrelated content from other files if it conflicts with the tagged files.
    //   - Ensure the generated keywords are highly specific to the content of these tagged files.`
    //   : "";

    const systemInstruction = `You are the "Expansion Brain" in a high-fidelity Dual-Brain RAG architecture.
    
    ROLE: 
    Your specific role is to bridge the gap between a user's natural language and the semantic index of our "Knowledge Vault". 
    
    KNOWLEDGE VAULT SNAPSHOT = [${availableFileNames.join(', ')}]

    CRITICAL INSTRUCTION ON @ TAGS:
    The user may explicitly tag files using the "@" symbol (e.g., "@report.pdf", "@notes.txt").
    
    IF YOU SEE AN @ TAG IN THE QUERY:
    1. Treat that file as the PRIMARY source of truth.
    2. Generate keywords that are specifically targeted to extract content from that file.
    3. Do not dilute the search with unrelated co    Even if these are not formally passed as parameters, you MUST parse the User Query for any tokens starting with "@".ncepts if a specific file is requested.

    STRATEGY:
    1. Analyze the "CONVERSATION LOGS" for context.
    2. Check the User Query for @mentions.
    3. Generate 5-8 dense, descriptive search keywords optimized for finding relevant segments in the target files.
    
    UP TO DATE DATA:
    - now's date is ${new Date().toDateString()}.

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


  public async thinkerStep(
    userQuery: string,
    contextChunks: any[],
    modelId: string,
    availableFileNames: string[],
    openRouterKey?: string
  ): Promise<{ rewrittenPrompt: string; thoughts: string }> {
    const contextText = contextChunks
      .map((c, i) => `[Segment ${i + 1}]\n${c.text}`)
      .join('\n\n');

    const systemInstruction = `You are the "Thinker Brain" of a sophisticated RAG system.
    
    GOAL:
    1. Perform a "Self-Reflection & Planning" phase: Analyze the User Query and Retrieved Context. decide if you have enough info.
    2. Rewrite the User Query into a precise instruction for the Answer Generator.

    CRITICAL REWRITING RULES:
    - IF the user specified files (e.g., "@file.txt"), the rewritten prompt MUST explicitly instruct the generator to look ONLY in those files.
    - IF NO files were specified, the rewritten prompt MUST explicitly instruct the generator to look in the "Knowledge Vault" generally.
    - DO NOT generate generic search terms. Focus on extracting the answer from the provided context.
    
    OUTPUT FORMAT:
    Return a valid JSON object ONLY:
    {
      "thoughts": "Brief self-reflection on the request and the context strategy...",
      "rewrittenPrompt": "The optimized, context-aware prompt..."
    }`;

    const prompt = `User Query: ${userQuery}\n\nRetrieved Context:\n${contextText}`;

    try {
      const response = await modelService.run({
        modelId, // Use a fast/smart model for thinking
        systemInstruction,
        prompt,
        temperature: 0.3,
        openRouterKey
      });

      const cleaned = response.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleaned);
    } catch (e) {
      console.error("Thinker step failed, falling back to original query", e);
      return { rewrittenPrompt: userQuery, thoughts: "Thinking process skipped due to error." };
    }
  }

  public async * generateAnswerStream(
    userQuery: string,
    expandedQuery: string,
    contextChunks: any[],
    temperature: number = 0.7,
    useVault: boolean = true,
    modelId: string = 'openai/gpt-oss-safeguard-20b',
    contextScript: string = "",
    openRouterKey?: string,
    taggedFileNames: string[] = [],
    thinkerResult?: { rewrittenPrompt: string; thoughts: string }
  ): AsyncGenerator<string, void, unknown> {
    const hasContext = contextChunks.length > 0;
    const contextText = hasContext
      ? contextChunks
        .map((c, i) => `[Document: ${c.docName} | Segment ${i + 1}]\n${c.text}`)
        .join('\n\n')
      : "NO RELEVANT FRAGMENTS RETRIEVED FROM VAULT.";

    const historySection = contextScript
      ? `HISTORICAL SESSION CONTEXT:\n${contextScript}\n\n`
      : "";

    const priorityNote = taggedFileNames.length > 0
      ? `\nNote: The user highlighted ${taggedFileNames.join(', ')} as primary sources.\n`
      : "";

    const thinkerNote = thinkerResult
      ? `\nTHINKER'S ANALYSIS:\n${thinkerResult.thoughts}\n`
      : "";

    const systemInstruction = `You are the "Expert Reasoner," the primary intelligence in a Dual-Brain RAG system.
    
    TASK:
    1. Synthesize a definitive answer using ONLY the "KNOWLEDGE VAULT" fragments provided. ${priorityNote}
    2. Cite sources using [Document: Name].
    3. If the user query mentions specific files using @ notation, ensure you verify claims against those documents primarily.
    ${thinkerNote}
    
    UP TO DATE DATA:
    - now's date is ${new Date().toDateString()}.

    VAULT DATA:
    ${contextText}`;

    // Use the rewritten prompt if available, otherwise original
    const activePrompt = thinkerResult ? thinkerResult.rewrittenPrompt : userQuery;
    const prompt = `${historySection}Active Query: ${activePrompt}`;

    yield* modelService.stream({
      modelId,
      systemInstruction,
      prompt,
      temperature,
      openRouterKey
    });
  }

  // Legacy non-streaming method (kept for compatibility or reference, can be deprecated)
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
    // This now just aggregates the stream
    let answer = "";
    for await (const chunk of this.generateAnswerStream(
      userQuery, expandedQuery, contextChunks, temperature, useVault, modelId, contextScript, openRouterKey, taggedFileNames
    )) {
      answer += chunk;
    }
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
