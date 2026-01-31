import { modelService } from "./modelService";
import { ResearchPlan } from "../types";

const PLANNING_SYSTEM_INSTRUCTION = `You are the "Strategic Agent Brain" - the core intelligence in an adaptive RAG system.

YOUR REASONING PROCESS:
1. Analyze the User's Query and the Conversation History.
2. Evaluate what you already know (from previous search results in this session).
3. Decide the SINGLE NEXT BEST ACTION to take.

ACTION TYPES:
- **search**: Execute a targeted search in the Knowledge Vault to gather more evidence. If specific files are targeted (e.g. "@file.txt"), treat this as a "read_file" or "cat" command to retrieve that file's full content.
- **clarify**: If the user's intent is ambiguous OR if you are missing critical context that ONLY the user can provide (e.g., preference between conflicting versions), stop and ask a direct Yes/No or short-answer question.
- **conclude**: If you have sufficient information to answer definitively, signal that the research phase is complete.

### CRITICAL PROTOCOL: @ MENTIONS (FOCUS MODE)
If your input contains "DETECTED @ TAGS":
1. YOU MUST execute a 'search' action targeting these files to retrieve their FULL content immediately.
2. DO NOT rely on the "FILE PREVIEWS" to answer questions about these files. The preview is truncated and insufficient.
3. Your understanding must state: "User wants to read @[file], so I must retrieve its full text."
4. If you have not yet executed a specific search for the tagged file in this session, you CANNOT conclude or ask for clarification regarding the file's content until you have read it.
5. Treating tags as absolute priority: If tagged files are present, your first action must be to search them.

### CRITICAL PROTOCOL: FUZZY CLARIFICATION (ANTI-TYPO)
If a user query mentions a term (like "Meren") that appears once or has zero matches:
1. IMMEDIATELY check the "Available files" list ([\${availableFileNames}]) for phonetic or character-level similarity (e.g., "eren.txt" for "meren").
2. EXTREME CAUTION: Do NOT ask vague questions like "Could you specify what you're looking for?".
3. IF A SIMILAR FILE OR TERM EXISTS: 
   - Option A (High Confidence): Use 'search' directly with the corrected term. Explain in thoughts: "Searching for 'Eren' as 'Meren' is a likely typo."
   - Option B (Moderate Confidence): Use 'clarify' with a specific suggestion: "I couldn't find 'Meren' but I have information on 'Eren' in 'aot.txt'. Did you mean that?"
4. IF NO MATCHES AFTER SEARCH: If a search for "Meren" returns zero results, your NEXT turn MUST be a "Similarity Check" turn.

KNOWLEDGE VAULT:
Available files: [\${availableFileNames}]

CRITICAL CONTEXT AWARENESS:
\${contextAwareness}

PERMANENT USER PREFERENCES (GUIDELINES):
\${customContext}

SEARCH RESULTS SO FAR:
\${currentContext}

OUTPUT FORMAT:
Return ONLY a valid JSON object:
{
  "turnTitle": "Brief action-oriented title. MUST follow formats like: 'Searching for [topic]', 'Reading [file]', 'Clarifying [ambiguity]', 'Synthesizing [findings]'",
  "understanding": "One sentence: What you currently understand about the goal",
  "queryComplexity": "simple|moderate|complex",
  "targetFiles": ["file1.txt", "file2.pdf"] or null,
  "searchScope": "narrow" | "broad",
  "researchStrategy": "Current high-level strategy",
  "nextAction": {
    "type": "search" | "clarify" | "conclude",
    "thought": "Direct explanation of why this action is chosen next",
    "searchParams": {
      "id": 1,
      "query": "Optimized search query",
      "purpose": "What this specific search aims to find",
      "priority": "high|medium|low",
      "targetFiles": ["file.txt"] or null,
      "expectedChunks": 3
    },
    "clarificationQuestion": "The specific question for the user (only for type='clarify')"
  },
  "thoughts": [
    { "step": "Insight Analysis", "thought": "Internal reasoning about current findings" }
  ]
}

REMEMBER:
- Decide only ONE action at a time.
- Be bold in asking for clarification if context is missing.
- Cite the purpose of your searches clearly.

### THINKING LOG FORMAT:
When adding items to the "thoughts" array, ALWAYS use these specific step names for consistency:
- Planning: For strategy formulation.
- Searching: When deciding to search.
- Found: When summarizing retrieved info.
- Analyzing: For internal reasoning/insight.
- Drafting: When preparing the final conclusion.
`;

export class GeminiRAGService {
  /**
   * EXPANDER BRAIN: Bridges natural language to semantic keywords.
   */
  public async expandQuery(
    userQuery: string,
    availableFileNames: string[],
    filePreviews: string[],
    temperature: number = 0.1,
    contextScript: string = "",
    modelId: string = 'cohere/command-r7b-12-2024',
    openRouterKey?: string,
    googleKey?: string,
    xaiKey?: string,
    openaiKey?: string,
    taggedFileNames: string[] = []
  ): Promise<string> {
    const vaultContext = filePreviews.length > 0
      ? `KNOWLEDGE VAULT SNAPSHOT: \n${filePreviews.join('\n\n')}`
      : "The vault is currently empty.";

    const historySection = contextScript
      ? `CONVERSATION LOGS: \n${contextScript} \n\n`
      : "";

    const systemInstruction = `You are the "Expansion Brain" in a high-fidelity Dual-Brain RAG architecture.
    
    ROLE: 
    Your specific role is to bridge the gap between a user's natural language and the semantic index of our "Knowledge Vault". 
    
    KNOWLEDGE VAULT SNAPSHOT = [${availableFileNames.join(', ')}]

    CRITICAL INSTRUCTION ON @ TAGS:
    The user may explicitly tag files using the "@" symbol (e.g., "@report.pdf", "@notes.txt"). parse the User Query for any tokens starting with "@".
    
    IF YOU SEE AN @ TAG IN THE QUERY:
    1. Treat that file as the PRIMARY source of truth.
    2. Generate keywords that are specifically targeted to extract content from that file.
    3. Do not dilute the search with unrelated concepts if a specific file is requested.

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
      openRouterKey,
      googleKey,
      xaiKey,
      openaiKey
    });
  }

  /**
   * THINKER BRAIN: Analyzes context and formulates a final logic blueprint.
   */
  public async thinkerStep(
    userQuery: string,
    contextChunks: any[],
    modelId: string,
    availableFileNames: string[],
    openRouterKey?: string,
    googleKey?: string,
    xaiKey?: string,
    openaiKey?: string,
    customContext: string = ""
  ): Promise<{ rewrittenPrompt: string; thoughts: string; customContext: string }> {
    const contextText = contextChunks
      .map((c, i) => `[Source: ${c.docName}]\n${c.text}`)
      .join('\n\n');

    const systemInstruction = `You are the "Thinker Brain" of a sophisticated RAG system.
    
    GOAL:
    1. RESEARCH & ANALYSIS: Review the User Query and the Retrieved Context. Extract key insights and verify facts.
    2. LINKING: Connect separate pieces of information between different context segments.
    3. PLAN & REWRITE: Formulate a precise instruction for the Final Answer Generator.
    4. PROVIDE RESOURCE: When you provide facts, provide the document name.

    CRITICAL REWRITING RULES:
    - IF the user specified files (e.g., "@file.txt"), the rewritten prompt MUST explicitly instruct the generator to look ONLY in those files.
    - IF NO files were specified, the rewritten prompt MUST explicitly instruct the generator to look in the "Knowledge Vault" generally.
    - Your rewritten prompt should be a detailed blueprint for the final answer.
    
    OUTPUT FORMAT:
    Return a valid JSON object ONLY:
    {
      "thoughts": [
        { "step": "Analyzing", "thought": "What critical data did you extract?" },
        { "step": "Found", "thought": "How do documents A and B relate?" },
        { "step": "Drafting", "thought": "Formulating final guidance..." }
      ],
      "rewrittenPrompt": "The optimized, context-aware prompt..."
    }`;

    const prompt = `User Query: ${userQuery}\n\nRetrieved Context:\n${contextText}`;

    try {
      const response = await modelService.run({
        modelId,
        systemInstruction,
        prompt,
        temperature: 0.3,
        openRouterKey,
        googleKey,
        xaiKey,
        openaiKey
      });

      const parsed = this.cleanAndParseJSON(response);
      return { ...parsed, customContext };
    } catch (e) {
      console.error("Thinker step failed, falling back to original query", e);
      return { rewrittenPrompt: userQuery, thoughts: "Thinking process skipped due to error.", customContext };
    }
  }

  /**
   * EXPERT REASONER: Synthesizes the final streaming answer.
   */
  public async *generateAnswerStream(
    userQuery: string,
    expandedQuery: string,
    contextChunks: any[],
    temperature: number = 0.7,
    useVault: boolean = true,
    modelId: string = 'google/gemini-1.5-pro',
    contextScript: string = "",
    openRouterKey?: string,
    googleKey?: string,
    xaiKey?: string,
    openaiKey?: string,
    taggedFileNames: string[] = [],
    thinkerResult?: { rewrittenPrompt: string; thoughts: string; customContext?: string },
    maxTokens: number = 2000
  ): AsyncGenerator<string, void, unknown> {
    const hasContext = contextChunks.length > 0;
    const contextText = hasContext
      ? contextChunks
        .map((c, i) => `[Document: ${c.docName}]\n${c.text}`)
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
    
    FORMATTING RULES (CRITICAL):
    - Use "Airy Formatting": Insert DOUBLE NEWLINES between every paragraph and list item.
    - Avoid dense walls of text.
    - Ensure citations [Document: ...] are clearly separated from the text they support.
    
    UP TO DATE DATA:
    - now's date is ${new Date().toDateString()}.

    PERMANENT USER PREFERENCES:
    ${thinkerResult?.customContext || ""}

    VAULT DATA:
    ${contextText}`;

    const activePrompt = thinkerResult ? thinkerResult.rewrittenPrompt : userQuery;
    const prompt = `${historySection}Active Query: ${activePrompt}`;

    yield* modelService.stream({
      modelId,
      systemInstruction,
      prompt,
      temperature,
      openRouterKey,
      googleKey,
      xaiKey,
      openaiKey,
      maxTokens
    });
  }

  /**
   * LEGACY GENERATE ANSWER: Non-streaming wrapper.
   */
  public async generateAnswer(
    userQuery: string,
    expandedQuery: string,
    contextChunks: any[],
    temperature: number = 0.7,
    useVault: boolean = true,
    modelId: string = 'google/gemini-1.5-pro',
    contextScript: string = "",
    openRouterKey?: string,
    googleKey?: string,
    xaiKey?: string,
    openaiKey?: string,
    taggedFileNames: string[] = [],
    maxTokens: number = 2000
  ): Promise<{ answer: string }> {
    let answer = "";
    for await (const chunk of this.generateAnswerStream(
      userQuery, expandedQuery, contextChunks, temperature, useVault, modelId, contextScript, openRouterKey, googleKey, xaiKey, openaiKey, taggedFileNames, undefined, maxTokens
    )) {
      answer += chunk;
    }
    return { answer };
  }

  /**
   * AGENTIC DECISION BRAIN: Decides the next action in the research cycle.
   */
  public async decideNextAction(
    userQuery: string,
    availableFileNames: string[],
    filePreviews: string[],
    conversationHistory: string = "",
    currentContext: string = "",
    taggedFileNames: string[] = [],
    modelId: string = 'google/gemini-2.0-flash-thinking-exp:free',
    openRouterKey?: string,
    googleKey?: string,
    xaiKey?: string,
    openaiKey?: string,
    customContext: string = ""
  ): Promise<ResearchPlan> {
    const contextAwareness = conversationHistory
      ? `Previous conversation context:\n${conversationHistory}\n`
      : 'This is a fresh query with no prior context.';

    const systemInstruction = PLANNING_SYSTEM_INSTRUCTION
      .replace('${availableFileNames}', availableFileNames.join(', '))
      .replace('${contextAwareness}', contextAwareness)
      .replace('${currentContext}', currentContext || 'No information retrieved yet.')
      .replace('${customContext}', customContext || "None provided.");

    const prompt = `
USER'S CURRENT GOAL: "${userQuery}"
DETECTED @ TAGS: ${taggedFileNames.join(', ') || 'None'}
KNOWLEDGE VAULT STATUS: ${availableFileNames.length} files available.
${filePreviews.length > 0 ? `FILE PREVIEWS:\n${filePreviews.join('\n')}` : ''}

CURRENT RETRIEVED KNOWLEDGE:
${currentContext || 'None.'}

TASK:
Based on what we know so far, decide the SINGLE next action.
- If we need more data: type="search"
- If confused or need user input: type="clarify"
- If we have enough: type="conclude"
`.trim();

    let currentPrompt = prompt;
    let lastError: Error | null = null;
    const MAX_RETRIES = 1;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await modelService.run({
          modelId,
          systemInstruction,
          prompt: currentPrompt,
          temperature: 0.2,
          openRouterKey,
          googleKey,
          xaiKey,
          openaiKey
        });

        const parsed = this.cleanAndParseJSON(response);
        if (!parsed || !parsed.nextAction) {
          throw new Error("Invalid plan: Missing 'nextAction'.");
        }
        return parsed;
      } catch (e: any) {
        lastError = e;
        console.warn(`Agent decision attempt ${attempt + 1} failed:`, e);

        if (attempt < MAX_RETRIES) {
          // Add error feedback to the prompt for the next attempt
          currentPrompt += `\n\nSYSTEM ERROR: Your previous response was invalid. Error: "${e.message || e}".\nCORRECTION: You MUST provide a valid JSON object with a 'nextAction' field. Do not include markdown formatting if it caused the error, just raw JSON.`;
        }
      }
    }

    console.error("Agent decision failed after retries:", lastError);
    throw new Error("Agent decision failed after retry. Stopping process.");
  }

  /**
   * Helper to Robustly parse JSON from model output
   */
  private cleanAndParseJSON(text: string): any {
    // 1. Try to find the first '{' and last '}'
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');

    if (start === -1 || end === -1) {
      // If no brackets, try cleaning code blocks just in case it's a bare string that happens to be valid JSON (unlikely for objects)
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleaned);
    }

    // 2. Extract the JSON substring
    const jsonStr = text.slice(start, end + 1);

    // 3. Parse it
    return JSON.parse(jsonStr);
  }

  /**
   * LEGACY PLANNER (Deprecated): For compatibility during migration.
   */
  public async generateResearchPlan(
    userQuery: string,
    availableFileNames: string[],
    filePreviews: string[],
    conversationHistory: string = "",
    taggedFileNames: string[] = [],
    modelId: string = 'google/gemini-2.0-flash-thinking-exp:free',
    openRouterKey?: string,
    googleKey?: string,
    xaiKey?: string,
    openaiKey?: string
  ): Promise<ResearchPlan> {
    return this.decideNextAction(userQuery, availableFileNames, filePreviews, conversationHistory, "", taggedFileNames, modelId, openRouterKey, googleKey, xaiKey, openaiKey);
  }

  /**
   * STATE TRACKER: Generates a concise summary for session persistence.
   */
  public async generateSummary(
    userPrompt: string,
    aiResponse: string,
    usedFiles: string[],
    modelId,
    openRouterKey,
    googleKey,
    xaiKey,
    openaiKey
  ): Promise<string> {
    const filesString = usedFiles.length > 0 ? usedFiles.join(', ') : 'No vault files';

    return modelService.run({
      modelId,
      systemInstruction: `You are the "State Tracker" for a Dual-Brain system. Create a single-line summary script to maintain context for the next turn. 
      FORMAT: [Context: ${filesString}] Summary: [1 concise sentence describing the user's intent and the core of the AI's conclusion].`,
      prompt: `Input: ${userPrompt}\n\nResponse: ${aiResponse}`,
      temperature: 0.1,
      openRouterKey,
      googleKey,
      xaiKey,
      openaiKey
    });
  }
}

export const geminiRAG = new GeminiRAGService();
