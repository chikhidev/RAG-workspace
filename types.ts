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

export type PipelineStatus = 'expanding' | 'searching' | 'reasoning' | 'completed' | 'error';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  status?: PipelineStatus;
  expandedQuery?: string;
  sources?: Chunk[];
  reasoningDuration?: number;
  timestamp: Date;
}

export interface AppState {
  documents: Document[];
  messages: Message[];
  isIndexing: boolean;
  isProcessing: boolean;
  error: string | null;
  temperature: number;
  theme: 'light' | 'dark';
  useVault: boolean;
  useSmallModelForResponse: boolean;
}