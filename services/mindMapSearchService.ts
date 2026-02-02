import { MindMap, MindNode } from '../types';

interface SearchResult {
  node: MindNode;
  path: string[]; // Path from root to this node
  depth: number;
  relevanceScore: number;
}

interface TraversalContext {
  query: string;
  visitedNodes: Set<string>;
  results: SearchResult[];
  path: string[];
}

/**
 * Mind Map Search Service
 * 
 * This service provides intelligent traversal and search capabilities for mind maps.
 * It's designed to work with LLMs during their thinking phase, allowing them to
 * query and navigate the hierarchical structure of mind maps efficiently.
 * 
 * The LLM can use this service to:
 * - Search for relevant nodes based on semantic queries
 * - Traverse the tree structure intelligently
 * - Get context-aware results with path information
 */
export const mindMapSearchService = {
  /**
   * Search through a mind map for nodes matching a query
   * Returns results sorted by relevance with full context
   */
  search(mindMap: MindMap, query: string, maxResults: number = 10): SearchResult[] {
    const context: TraversalContext = {
      query: query.toLowerCase(),
      visitedNodes: new Set(),
      results: [],
      path: [],
    };

    // Start from root node
    if (mindMap.rootNodeId && mindMap.nodes[mindMap.rootNodeId]) {
      this.traverseAndScore(mindMap, mindMap.rootNodeId, context, 0);
    }

    // Sort by relevance score (descending)
    context.results.sort((a, b) => b.relevanceScore - a.relevanceScore);

    return context.results.slice(0, maxResults);
  },

  /**
   * Traverse the mind map tree structure recursively
   * Uses Depth-First Search to explore the hierarchy
   */
  traverseAndScore(
    mindMap: MindMap,
    nodeId: string,
    context: TraversalContext,
    depth: number
  ): void {
    // Prevent infinite loops
    if (context.visitedNodes.has(nodeId)) return;
    context.visitedNodes.add(nodeId);

    const node = mindMap.nodes[nodeId];
    if (!node) return;

    // Add to path
    context.path.push(node.text);

    // Calculate relevance score
    const relevanceScore = this.calculateRelevance(node.text, context.query, depth);

    // Add to results if relevant (score > 0)
    if (relevanceScore > 0) {
      context.results.push({
        node: { ...node },
        path: [...context.path],
        depth,
        relevanceScore,
      });
    }

    // Find child nodes through connections
    const childConnections = mindMap.connections.filter(
      conn => conn.fromNodeId === nodeId
    );

    // Traverse children
    for (const conn of childConnections) {
      this.traverseAndScore(mindMap, conn.toNodeId, context, depth + 1);
    }

    // Remove from path when backtracking
    context.path.pop();
  },

  /**
   * Calculate relevance score for a node based on the query
   * Higher scores mean more relevant results
   */
  calculateRelevance(nodeText: string, query: string, depth: number): number {
    const text = nodeText.toLowerCase();
    let score = 0;

    // Exact match gets highest score
    if (text === query) {
      score += 100;
    }
    // Contains full query
    else if (text.includes(query)) {
      score += 50;
    }
    // Word-by-word matching
    else {
      const queryWords = query.split(/\s+/);
      const textWords = text.split(/\s+/);
      
      for (const queryWord of queryWords) {
        for (const textWord of textWords) {
          if (textWord.includes(queryWord) || queryWord.includes(textWord)) {
            score += 10;
          }
        }
      }
    }

    // Penalize deeper nodes slightly (prefer higher-level concepts)
    score = Math.max(0, score - depth * 2);

    return score;
  },

  /**
   * Get the full context of a specific node
   * Includes the path from root and immediate children
   */
  getNodeContext(mindMap: MindMap, nodeId: string): {
    node: MindNode | null;
    path: string[];
    children: MindNode[];
    parent: MindNode | null;
  } {
    const node = mindMap.nodes[nodeId];
    if (!node) {
      return { node: null, path: [], children: [], parent: null };
    }

    // Build path from root to this node
    const path = this.buildPathToNode(mindMap, nodeId);

    // Get children
    const childConnections = mindMap.connections.filter(
      conn => conn.fromNodeId === nodeId
    );
    const children = childConnections
      .map(conn => mindMap.nodes[conn.toNodeId])
      .filter(Boolean);

    // Get parent
    const parentConnection = mindMap.connections.find(
      conn => conn.toNodeId === nodeId
    );
    const parent = parentConnection ? mindMap.nodes[parentConnection.fromNodeId] : null;

    return { node, path, children, parent };
  },

  /**
   * Build the path from root node to a specific node
   */
  buildPathToNode(mindMap: MindMap, targetNodeId: string): string[] {
    const path: string[] = [];
    const visited = new Set<string>();

    const findPath = (currentNodeId: string): boolean => {
      if (visited.has(currentNodeId)) return false;
      visited.add(currentNodeId);

      const currentNode = mindMap.nodes[currentNodeId];
      if (!currentNode) return false;

      path.push(currentNode.text);

      if (currentNodeId === targetNodeId) {
        return true;
      }

      // Check children
      const childConnections = mindMap.connections.filter(
        conn => conn.fromNodeId === currentNodeId
      );

      for (const conn of childConnections) {
        if (findPath(conn.toNodeId)) {
          return true;
        }
      }

      path.pop();
      return false;
    };

    if (mindMap.rootNodeId) {
      findPath(mindMap.rootNodeId);
    }

    return path;
  },

  /**
   * Get a hierarchical representation of the mind map
   * Useful for LLMs to understand the structure
   */
  getHierarchy(mindMap: MindMap): any {
    const buildTree = (nodeId: string, visited = new Set<string>()): any => {
      if (visited.has(nodeId)) return null;
      visited.add(nodeId);

      const node = mindMap.nodes[nodeId];
      if (!node) return null;

      const children = mindMap.connections
        .filter(conn => conn.fromNodeId === nodeId)
        .map(conn => buildTree(conn.toNodeId, visited))
        .filter(Boolean);

      return {
        id: node.id,
        text: node.text,
        children,
      };
    };

    if (!mindMap.rootNodeId) return null;
    return buildTree(mindMap.rootNodeId);
  },

  /**
   * Format search results for LLM consumption
   * Returns a structured text representation
   */
  formatResultsForLLM(results: SearchResult[]): string {
    if (results.length === 0) {
      return 'No matching nodes found in this mind map.';
    }

    let output = `Found ${results.length} relevant node(s):\n\n`;

    results.forEach((result, index) => {
      output += `${index + 1}. ${result.node.text}\n`;
      output += `   Path: ${result.path.join(' → ')}\n`;
      output += `   Depth: ${result.depth}\n`;
      output += `   Relevance: ${result.relevanceScore.toFixed(1)}\n\n`;
    });

    return output;
  },

  /**
   * Check if a mind map is relevant to a query based on its root node
   * This is used to determine if the LLM should even explore this mind map
   */
  isRelevantMindMap(mindMap: MindMap, query: string): boolean {
    if (!mindMap.rootNodeId) return false;

    const rootNode = mindMap.nodes[mindMap.rootNodeId];
    if (!rootNode) return false;

    const relevanceScore = this.calculateRelevance(rootNode.text, query, 0);
    return relevanceScore > 0;
  },
};
