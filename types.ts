export interface Document {
  id: string;
  name: string;
  content: string;
  enabled: boolean;
  tokens?: number;
}

export interface Chunk {
  docId: string;
  docName: string;
  text: string;
  embedding?: number[];
}

export type PipelineStatus = 'planning' | 'expanding' | 'searching' | 'thinking' | 'synthesizing' | 'reasoning' | 'completed' | 'error';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  status?: PipelineStatus;
  expandedQuery?: string;
  sources?: Chunk[];
  thoughtProcess?: string; // The "self-discussion"
  researchStrategy?: string;
  thoughtLogs?: { timestamp: number; step: string; thought: string; turn?: number }[];
  activeSubQuery?: string;
  pendingClarification?: string;
  clarificationAnswer?: string;
  agentContext?: {
    originalQuery: string;
    knowledgeBuffer: string;
    iterations: number;
    sources: Chunk[];
    turnTitles?: Record<number, string>;
  };
  subtasks?: { label: string; status: 'pending' | 'loading' | 'completed'; detail?: string }[];
  expansionDuration?: number;
  planningDuration?: number;
  searchDuration?: number;
  thinkingDuration?: number;
  reasoningDuration?: number;
  timestamp: Date;
}

export interface Toast {
  id: string;
  message: string;
  type: 'error' | 'success' | 'info';
}

export type ModelProviderId = 'google' | 'openrouter';

export interface ModelMetadata {
  author: string;
  context: string;
  inputPrice: string;
  outputPrice: string;
  latency: string;
  throughput: string;
}

export interface ModelDefinition {
  id: string;
  name: string;
  provider: ModelProviderId;
  description: string;
  size: 'small' | 'large';
  logo: string;
  isFree?: boolean;
  metadata: ModelMetadata;
}

export interface AppState {
  documents: Document[];
  messages: Message[];
  isIndexing: boolean;
  isProcessing: boolean;
  toasts: Toast[];
  useVault: boolean;
  useContextHistory: boolean;
  contextScript: string;
  expanderModel: string;
  reasonerModel: string;
  openRouterKey: string;
  googleKey: string;
  inputPosition: 'floating' | 'sidebar';
  isInputModalOpen?: boolean;
  inputModalType?: 'text' | 'url';
  maxTokens: number;
  maxAgentIterations: number;
  sessionStats: {
    inputTokens: number;
    outputTokens: number;
  };
  customContext: string;
}

export interface AgentAction {
  type: 'search' | 'clarify' | 'conclude';
  thought: string;
  searchParams?: SubQuery;
  clarificationQuestion?: string;
}

export interface ResearchPlan {
  turnTitle: string;
  understanding: string;
  queryComplexity: 'simple' | 'moderate' | 'complex';
  targetFiles: string[] | null;
  searchScope: 'narrow' | 'broad';
  researchStrategy: string;
  nextAction: AgentAction;
  thoughts?: { step: string; thought: string }[];
}

export interface SubQuery {
  id: number;
  query: string;
  purpose: string;
  priority: 'high' | 'medium' | 'low';
  targetFiles: string[] | null;
  expectedChunks: number;
}