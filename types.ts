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

export type PipelineStatus = 'expanding' | 'searching' | 'thinking' | 'reasoning' | 'completed' | 'error';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  status?: PipelineStatus;
  expandedQuery?: string;
  sources?: Chunk[];
  thoughtProcess?: string; // The "self-discussion"
  subtasks?: { label: string; status: 'pending' | 'loading' | 'completed'; detail?: string }[];
  expansionDuration?: number;
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
  sessionStats: {
    inputTokens: number;
    outputTokens: number;
  };
}