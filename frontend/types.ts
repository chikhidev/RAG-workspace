export interface Document {
  id: string;
  name: string;
  content: string;
  enabled: boolean;
  tokens?: number;
  isLoading?: boolean;
}

export interface User {
  id: number;
  email: string;
  username?: string;
  is_active: boolean;
  avatar_path?: string;
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
  modelId?: string;
  expandedQuery?: string;
  sources?: Chunk[];
  thoughtProcess?: string; // The "self-discussion"
  researchStrategy?: string;
  thoughtLogs?: { timestamp: number; step: string; thought: string; turn?: number }[];
  activeSubQuery?: string;
  pendingClarification?: string;
  clarificationAnswer?: string;
  pendingMaxIterations?: boolean;
  wasStopped?: boolean;
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

export type ModelProviderId = 'google' | 'openrouter' | 'xai' | 'openai' | 'mistral';

export interface ModelMetadata {
  author: string;
  context: string;
  inputPrice: string;
  outputPrice: string;
  latency: string;
  throughput: string;
  updated?: string;
  cutoff?: string;
  deprecated?: string;
}

export interface ModelDefinition {
  id: string;
  name: string;
  provider: ModelProviderId;
  description: string;
  size: 'small' | 'large';
  logo: string;
  isFree?: boolean;
  categories?: ('Code' | 'Reasoning' | 'Balanced' | 'Speed' | 'Vision' | 'Long Context' | 'Budget')[];
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
  selectedModel: string;
  openRouterKey: string;
  googleKey: string;
  xaiKey: string;
  openaiKey: string;
  mistralKey: string;
  isInputModalOpen?: boolean;
  inputModalType?: 'text' | 'url';
  maxTokens: number;
  maxAgentIterations: number;
  customContext: string;
  mindMaps: MindMap[];
}

export interface GrepParams {
  pattern: string;
  targetFiles: string[] | null;
  caseSensitive?: boolean;
  maxResults?: number;
}

export interface ReadLinesParams {
  fileName: string;
  startLine: number;
  endLine: number;
}

export interface MindMapSearchParams {
  query: string;
  maxResults?: number;
}

export interface MindMapNavigateParams {
  nodeId: string;
  mindMapId: string;
}

export interface AgentAction {
  type: 'search' | 'clarify' | 'conclude' | 'grep' | 'read_lines' | 'mindmap_search' | 'mindmap_navigate';
  thought: string;
  searchParams?: SubQuery;
  clarificationQuestion?: string;
  grepParams?: GrepParams;
  readLinesParams?: ReadLinesParams;
  mindMapSearchParams?: MindMapSearchParams;
  mindMapNavigateParams?: MindMapNavigateParams;
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

// Mind Node types
export interface MindNodePort {
  id: string;
  side: 'left' | 'right';
  connectedTo: string | null; // ID of another node
}

export interface MindNode {
  id: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  ports: {
    left: MindNodePort;
    right: MindNodePort;
  };
  parentId: string | null;
  childIds: string[];
  color?: string;
}

export interface MindNodeConnection {
  id: string;
  fromNodeId: string;
  fromPort: 'left' | 'right';
  toNodeId: string;
  toPort: 'left' | 'right';
}

export interface MindMap {
  id: string;
  name: string;
  nodes: Record<string, MindNode>;
  connections: MindNodeConnection[];
  rootNodeId: string | null;
  enabled: boolean;
}