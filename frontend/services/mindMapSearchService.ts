import { MindMap, MindNode, MindNodeConnection } from '../types';

/**
 * Search result for a single node with full context
 */
export interface MindMapSearchResult {
  nodeId: string;
  nodeText: string;
  path: string[]; // Path from root to this node as text array
  pathIds: string[]; // Path from root to this node as ID array
  depth: number;
  relevanceScore: number;
  connectedNodes: ConnectedNodeInfo[]; // Next connected nodes for navigation
}

/**
 * Connected node info for LLM navigation
 */
export interface ConnectedNodeInfo {
  nodeId: string;
  nodeText: string;
  direction: 'child' | 'parent' | 'sibling';
  connectionId: string;
}

/**
 * Result from navigating to a specific node
 */
export interface NodeNavigationResult {
  success: boolean;
  node: MindNode | null;
  path: string[];
  pathIds: string[];
  depth: number;
  parentNode: ConnectedNodeInfo | null;
  childNodes: ConnectedNodeInfo[];
  siblingNodes: ConnectedNodeInfo[];
  allConnected: ConnectedNodeInfo[];
}

/**
 * Mind map relevance check result
 */
export interface MindMapRelevanceResult {
  mindMapId: string;
  mindMapName: string;
  isRelevant: boolean;
  entrypointText: string;
  entrypointScore: number;
  nodeCount: number;
}

interface TraversalContext {
  queryKeywords: string[];
  visitedNodes: Set<string>;
  results: MindMapSearchResult[];
  currentPath: string[];
  currentPathIds: string[];
}

/**
 * Mind Map Search Engine
 * 
 * A robust semantic search engine for hierarchical mind map structures.
 * Designed to work with LLMs during their thinking phase.
 * 
 * Key Capabilities:
 * 1. Semantic search using keyword matching with scoring
 * 2. Node navigation by ID with connected nodes
 * 3. Entrypoint-based relevance checking
 * 4. Full path context for each result
 * 
 * The LLM workflow:
 * 1. Check mind map relevance via entrypoint
 * 2. Search with semantic query
 * 3. Navigate to specific nodes by ID for deeper exploration
 */
export const mindMapSearchService = {
  
  // ============================================
  // SEMANTIC SEARCH
  // ============================================

  /**
   * Semantic search through mind map nodes
   * Uses keyword extraction and fuzzy matching for relevance scoring
   */
  semanticSearch(
    mindMap: MindMap,
    query: string,
    maxResults: number = 10
  ): MindMapSearchResult[] {
    // Extract keywords from query
    const queryKeywords = this.extractKeywords(query);
    
    if (queryKeywords.length === 0) {
      // If no meaningful keywords, return top-level nodes
      return this.getTopLevelNodes(mindMap, maxResults);
    }

    const context: TraversalContext = {
      queryKeywords,
      visitedNodes: new Set(),
      results: [],
      currentPath: [],
      currentPathIds: [],
    };

    // Start DFS from root
    if (mindMap.rootNodeId && mindMap.nodes[mindMap.rootNodeId]) {
      this.traverseAndScore(mindMap, mindMap.rootNodeId, context, 0);
    }

    // Sort by relevance (descending)
    context.results.sort((a, b) => b.relevanceScore - a.relevanceScore);

    // Return top results with connected nodes
    return context.results.slice(0, maxResults);
  },

  /**
   * Extract meaningful keywords from query
   * Filters out stop words and short tokens
   */
  extractKeywords(query: string): string[] {
    const stopWords = new Set([
      'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
      'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
      'may', 'might', 'must', 'shall', 'can', 'need', 'dare', 'ought', 'used',
      'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as', 'into',
      'about', 'like', 'through', 'after', 'over', 'between', 'out', 'against',
      'during', 'without', 'before', 'under', 'around', 'among', 'what', 'which',
      'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'it', 'its', 'and',
      'but', 'or', 'nor', 'so', 'yet', 'both', 'either', 'neither', 'not', 'only',
      'own', 'same', 'than', 'too', 'very', 'just', 'how', 'when', 'where', 'why',
      'mind', 'map', 'node', 'nodes', 'find', 'search', 'get', 'show', 'tell', 'me'
    ]);

    return query
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word))
      .map(word => word.trim());
  },

  /**
   * DFS traversal with semantic scoring
   */
  traverseAndScore(
    mindMap: MindMap,
    nodeId: string,
    context: TraversalContext,
    depth: number
  ): void {
    // Prevent cycles
    if (context.visitedNodes.has(nodeId)) return;
    context.visitedNodes.add(nodeId);

    const node = mindMap.nodes[nodeId];
    if (!node) return;

    // Track path
    context.currentPath.push(node.text);
    context.currentPathIds.push(node.id);

    // Calculate semantic relevance
    const relevanceScore = this.calculateSemanticScore(
      node.text,
      context.queryKeywords,
      depth
    );

    // Only include if score > 0
    if (relevanceScore > 0) {
      const connectedNodes = this.getConnectedNodes(mindMap, nodeId);
      
      context.results.push({
        nodeId: node.id,
        nodeText: node.text,
        path: [...context.currentPath],
        pathIds: [...context.currentPathIds],
        depth,
        relevanceScore,
        connectedNodes: connectedNodes.slice(0, 5), // Limit to 5 connected nodes
      });
    }

    // Traverse children
    const childConnections = mindMap.connections.filter(
      conn => conn.fromNodeId === nodeId
    );

    for (const conn of childConnections) {
      this.traverseAndScore(mindMap, conn.toNodeId, context, depth + 1);
    }

    // Backtrack
    context.currentPath.pop();
    context.currentPathIds.pop();
  },

  /**
   * Calculate semantic relevance score
   * Uses multiple signals for robust matching
   */
  calculateSemanticScore(
    nodeText: string,
    queryKeywords: string[],
    depth: number
  ): number {
    const text = nodeText.toLowerCase();
    const textWords = this.extractKeywords(nodeText);
    let score = 0;

    for (const keyword of queryKeywords) {
      // Exact word match (highest score)
      if (textWords.includes(keyword)) {
        score += 30;
        continue;
      }

      // Substring match
      if (text.includes(keyword)) {
        score += 20;
        continue;
      }

      // Partial word match (beginning of word)
      for (const textWord of textWords) {
        if (textWord.startsWith(keyword) || keyword.startsWith(textWord)) {
          score += 15;
          break;
        }
        // Fuzzy match (contains)
        if (textWord.includes(keyword) || keyword.includes(textWord)) {
          score += 10;
          break;
        }
      }
    }

    // Boost for matching multiple keywords
    const matchedCount = queryKeywords.filter(kw => 
      textWords.some(tw => tw.includes(kw) || kw.includes(tw))
    ).length;
    
    if (matchedCount > 1) {
      score += matchedCount * 10;
    }

    // Slight penalty for very deep nodes (prefer higher-level concepts)
    score = Math.max(0, score - depth * 1);

    return score;
  },

  // ============================================
  // NODE NAVIGATION
  // ============================================

  /**
   * Navigate to a specific node by ID and return full context
   * This is the key method for LLM navigation through the mind map
   */
  navigateToNode(
    mindMap: MindMap,
    nodeId: string,
    maxConnectedNodes: number = 5
  ): NodeNavigationResult {
    const node = mindMap.nodes[nodeId];
    
    if (!node) {
      return {
        success: false,
        node: null,
        path: [],
        pathIds: [],
        depth: 0,
        parentNode: null,
        childNodes: [],
        siblingNodes: [],
        allConnected: [],
      };
    }

    // Build path from root
    const { path, pathIds, depth } = this.buildPathToNode(mindMap, nodeId);

    // Get parent
    const parentConnection = mindMap.connections.find(
      conn => conn.toNodeId === nodeId
    );
    let parentNode: ConnectedNodeInfo | null = null;
    if (parentConnection) {
      const parent = mindMap.nodes[parentConnection.fromNodeId];
      if (parent) {
        parentNode = {
          nodeId: parent.id,
          nodeText: parent.text,
          direction: 'parent',
          connectionId: parentConnection.id,
        };
      }
    }

    // Get children
    const childConnections = mindMap.connections.filter(
      conn => conn.fromNodeId === nodeId
    );
    const childNodes: ConnectedNodeInfo[] = childConnections
      .map(conn => {
        const child = mindMap.nodes[conn.toNodeId];
        if (!child) return null;
        return {
          nodeId: child.id,
          nodeText: child.text,
          direction: 'child' as const,
          connectionId: conn.id,
        };
      })
      .filter(Boolean) as ConnectedNodeInfo[];

    // Get siblings (other children of parent)
    const siblingNodes: ConnectedNodeInfo[] = [];
    if (parentConnection) {
      const siblingConnections = mindMap.connections.filter(
        conn => conn.fromNodeId === parentConnection.fromNodeId && 
                conn.toNodeId !== nodeId
      );
      for (const conn of siblingConnections) {
        const sibling = mindMap.nodes[conn.toNodeId];
        if (sibling) {
          siblingNodes.push({
            nodeId: sibling.id,
            nodeText: sibling.text,
            direction: 'sibling',
            connectionId: conn.id,
          });
        }
      }
    }

    // Combine all connected nodes
    const allConnected: ConnectedNodeInfo[] = [];
    if (parentNode) allConnected.push(parentNode);
    allConnected.push(...childNodes.slice(0, maxConnectedNodes));
    allConnected.push(...siblingNodes.slice(0, 3));

    return {
      success: true,
      node,
      path,
      pathIds,
      depth,
      parentNode,
      childNodes: childNodes.slice(0, maxConnectedNodes),
      siblingNodes: siblingNodes.slice(0, 3),
      allConnected,
    };
  },

  /**
   * Get connected nodes for a given node ID
   */
  getConnectedNodes(mindMap: MindMap, nodeId: string): ConnectedNodeInfo[] {
    const connected: ConnectedNodeInfo[] = [];

    // Get children (outgoing connections)
    const childConnections = mindMap.connections.filter(
      conn => conn.fromNodeId === nodeId
    );
    for (const conn of childConnections) {
      const child = mindMap.nodes[conn.toNodeId];
      if (child) {
        connected.push({
          nodeId: child.id,
          nodeText: child.text,
          direction: 'child',
          connectionId: conn.id,
        });
      }
    }

    // Get parent (incoming connection)
    const parentConnection = mindMap.connections.find(
      conn => conn.toNodeId === nodeId
    );
    if (parentConnection) {
      const parent = mindMap.nodes[parentConnection.fromNodeId];
      if (parent) {
        connected.push({
          nodeId: parent.id,
          nodeText: parent.text,
          direction: 'parent',
          connectionId: parentConnection.id,
        });
      }
    }

    return connected;
  },

  /**
   * Build path from root to target node
   */
  buildPathToNode(
    mindMap: MindMap,
    targetNodeId: string
  ): { path: string[]; pathIds: string[]; depth: number } {
    const path: string[] = [];
    const pathIds: string[] = [];
    const visited = new Set<string>();

    const findPath = (currentNodeId: string): boolean => {
      if (visited.has(currentNodeId)) return false;
      visited.add(currentNodeId);

      const currentNode = mindMap.nodes[currentNodeId];
      if (!currentNode) return false;

      path.push(currentNode.text);
      pathIds.push(currentNode.id);

      if (currentNodeId === targetNodeId) {
        return true;
      }

      const childConnections = mindMap.connections.filter(
        conn => conn.fromNodeId === currentNodeId
      );

      for (const conn of childConnections) {
        if (findPath(conn.toNodeId)) {
          return true;
        }
      }

      path.pop();
      pathIds.pop();
      return false;
    };

    if (mindMap.rootNodeId) {
      findPath(mindMap.rootNodeId);
    }

    return { path, pathIds, depth: path.length - 1 };
  },

  // ============================================
  // RELEVANCE CHECKING
  // ============================================

  /**
   * Check if a mind map is relevant to a query based on entrypoint
   * Returns detailed information for LLM decision making
   */
  checkMindMapRelevance(
    mindMap: MindMap,
    query: string
  ): MindMapRelevanceResult {
    const nodeCount = Object.keys(mindMap.nodes).length;
    
    if (!mindMap.rootNodeId) {
      return {
        mindMapId: mindMap.id,
        mindMapName: mindMap.name,
        isRelevant: false,
        entrypointText: '',
        entrypointScore: 0,
        nodeCount,
      };
    }

    const rootNode = mindMap.nodes[mindMap.rootNodeId];
    if (!rootNode) {
      return {
        mindMapId: mindMap.id,
        mindMapName: mindMap.name,
        isRelevant: false,
        entrypointText: '',
        entrypointScore: 0,
        nodeCount,
      };
    }

    const queryKeywords = this.extractKeywords(query);
    const entrypointScore = this.calculateSemanticScore(
      rootNode.text,
      queryKeywords,
      0
    );

    // Consider relevant if score > 10 or if it's a very generic query
    const isGenericQuery = query.length < 15 || queryKeywords.length === 0;
    const isRelevant = entrypointScore > 10 || isGenericQuery;

    return {
      mindMapId: mindMap.id,
      mindMapName: mindMap.name,
      isRelevant,
      entrypointText: rootNode.text,
      entrypointScore,
      nodeCount,
    };
  },

  /**
   * Get all mind maps with their relevance scores
   * LLM uses this to decide which mind maps to search
   */
  evaluateAllMindMaps(
    mindMaps: MindMap[],
    query: string
  ): MindMapRelevanceResult[] {
    const enabledMaps = mindMaps.filter(m => m.enabled);
    
    return enabledMaps.map(m => this.checkMindMapRelevance(m, query));
  },

  // ============================================
  // UTILITY METHODS
  // ============================================

  /**
   * Get top-level nodes (root and immediate children)
   * Used when query has no meaningful keywords
   */
  getTopLevelNodes(mindMap: MindMap, maxResults: number): MindMapSearchResult[] {
    const results: MindMapSearchResult[] = [];

    if (!mindMap.rootNodeId) return results;

    const rootNode = mindMap.nodes[mindMap.rootNodeId];
    if (!rootNode) return results;

    // Add root
    const rootConnected = this.getConnectedNodes(mindMap, rootNode.id);
    results.push({
      nodeId: rootNode.id,
      nodeText: rootNode.text,
      path: [rootNode.text],
      pathIds: [rootNode.id],
      depth: 0,
      relevanceScore: 100,
      connectedNodes: rootConnected.slice(0, 5),
    });

    // Add immediate children
    const childConnections = mindMap.connections.filter(
      conn => conn.fromNodeId === mindMap.rootNodeId
    );

    for (const conn of childConnections) {
      if (results.length >= maxResults) break;

      const child = mindMap.nodes[conn.toNodeId];
      if (!child) continue;

      const childConnected = this.getConnectedNodes(mindMap, child.id);
      results.push({
        nodeId: child.id,
        nodeText: child.text,
        path: [rootNode.text, child.text],
        pathIds: [rootNode.id, child.id],
        depth: 1,
        relevanceScore: 50,
        connectedNodes: childConnected.slice(0, 5),
      });
    }

    return results;
  },

  /**
   * Format search results for LLM consumption
   * Includes node IDs for navigation
   */
  formatResultsForLLM(
    results: MindMapSearchResult[],
    mindMapName: string
  ): string {
    if (results.length === 0) {
      return `No matching nodes found in mind map "${mindMapName}".`;
    }

    let output = `📍 Mind Map: "${mindMapName}"\n`;
    output += `Found ${results.length} relevant node(s):\n\n`;

    for (let i = 0; i < results.length; i++) {
      const r = results[i];
      output += `[${i + 1}] "${r.nodeText}"\n`;
      output += `    ID: ${r.nodeId}\n`;
      output += `    Path: ${r.path.join(' → ')}\n`;
      output += `    Depth: ${r.depth} | Score: ${r.relevanceScore}\n`;
      
      if (r.connectedNodes.length > 0) {
        output += `    Next nodes (use ID to navigate):\n`;
        for (const conn of r.connectedNodes) {
          output += `      → [${conn.direction}] "${conn.nodeText}" (ID: ${conn.nodeId})\n`;
        }
      }
      output += '\n';
    }

    return output;
  },

  /**
   * Format navigation result for LLM
   */
  formatNavigationForLLM(
    result: NodeNavigationResult,
    mindMapName: string
  ): string {
    if (!result.success || !result.node) {
      return `❌ Node not found in mind map "${mindMapName}".`;
    }

    let output = `📍 Mind Map: "${mindMapName}"\n`;
    output += `🎯 Current Node: "${result.node.text}"\n`;
    output += `   ID: ${result.node.id}\n`;
    output += `   Path: ${result.path.join(' → ')}\n`;
    output += `   Depth: ${result.depth}\n\n`;

    if (result.parentNode) {
      output += `⬆️ Parent:\n`;
      output += `   "${result.parentNode.nodeText}" (ID: ${result.parentNode.nodeId})\n\n`;
    }

    if (result.childNodes.length > 0) {
      output += `⬇️ Children (${result.childNodes.length}):\n`;
      for (const child of result.childNodes) {
        output += `   → "${child.nodeText}" (ID: ${child.nodeId})\n`;
      }
      output += '\n';
    }

    if (result.siblingNodes.length > 0) {
      output += `↔️ Siblings (${result.siblingNodes.length}):\n`;
      for (const sibling of result.siblingNodes) {
        output += `   → "${sibling.nodeText}" (ID: ${sibling.nodeId})\n`;
      }
      output += '\n';
    }

    return output;
  },

  /**
   * Legacy compatibility - check if mind map is relevant
   */
  isRelevantMindMap(mindMap: MindMap, query: string): boolean {
    const result = this.checkMindMapRelevance(mindMap, query);
    return result.isRelevant;
  },

  /**
   * Legacy compatibility - basic search (returns new format)
   */
  search(mindMap: MindMap, query: string, maxResults: number = 10): MindMapSearchResult[] {
    return this.semanticSearch(mindMap, query, maxResults);
  },
};
