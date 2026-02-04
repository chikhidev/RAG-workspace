import { MindNode, MindNodeConnection, MindMap, MindNodePort } from '../types';

export const mindNodeService = {
  /**
   * Create a new mind node
   */
  createNode(
    text: string,
    x: number,
    y: number,
    parentId: string | null = null
  ): MindNode {
    const id = `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      id,
      text,
      x,
      y,
      width: 200,
      height: 80,
      ports: {
        left: {
          id: `${id}_left`,
          side: 'left',
          connectedTo: null,
        },
        right: {
          id: `${id}_right`,
          side: 'right',
          connectedTo: null,
        },
      },
      parentId,
      childIds: [],
      color: this.generateRandomColor(),
    };
  },

  /**
   * Create a new connection between two nodes
   */
  createConnection(
    fromNodeId: string,
    fromPort: 'left' | 'right',
    toNodeId: string,
    toPort: 'left' | 'right'
  ): MindNodeConnection {
    return {
      id: `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      fromNodeId,
      fromPort,
      toNodeId,
      toPort,
    };
  },

  /**
   * Create a new empty mind map
   */
  createMindMap(name: string): MindMap {
    const rootNode = this.createNode('Describe the main topic here - LLM uses this to decide if it should explore this mind map', 400, 300);
    
    return {
      id: `map_${Date.now()}`,
      name,
      nodes: {
        [rootNode.id]: rootNode,
      },
      connections: [],
      rootNodeId: rootNode.id,
      enabled: true,
    };
  },

  /**
   * Add a node to a mind map
   */
  addNode(
    mindMap: MindMap,
    node: MindNode
  ): MindMap {
    return {
      ...mindMap,
      nodes: {
        ...mindMap.nodes,
        [node.id]: node,
      },
    };
  },

  /**
   * Remove a node and its connections
   */
  removeNode(
    mindMap: MindMap,
    nodeId: string
  ): MindMap {
    const node = mindMap.nodes[nodeId];
    if (!node) return mindMap;

    // Remove from parent's childIds
    if (node.parentId) {
      const parent = mindMap.nodes[node.parentId];
      if (parent) {
        parent.childIds = parent.childIds.filter(id => id !== nodeId);
      }
    }

    // Remove connections involving this node
    const newConnections = mindMap.connections.filter(
      conn => conn.fromNodeId !== nodeId && conn.toNodeId !== nodeId
    );

    // Remove the node
    const { [nodeId]: removed, ...remainingNodes } = mindMap.nodes;

    // Recursively remove all children
    let result: MindMap = {
      ...mindMap,
      nodes: remainingNodes,
      connections: newConnections,
    };

    for (const childId of node.childIds) {
      result = this.removeNode(result, childId);
    }

    return result;
  },

  /**
   * Add a connection between two nodes
   */
  addConnection(
    mindMap: MindMap,
    connection: MindNodeConnection
  ): MindMap {
    const fromNode = mindMap.nodes[connection.fromNodeId];
    const toNode = mindMap.nodes[connection.toNodeId];

    if (!fromNode || !toNode) {
      return mindMap;
    }

    // Create new node objects with updated ports (immutable update)
    const updatedFromNode = {
      ...fromNode,
      ports: {
        ...fromNode.ports,
        [connection.fromPort]: {
          ...fromNode.ports[connection.fromPort],
          connectedTo: connection.toNodeId,
        },
      },
      childIds: fromNode.childIds.includes(connection.toNodeId) 
        ? fromNode.childIds 
        : [...fromNode.childIds, connection.toNodeId],
    };

    const updatedToNode = {
      ...toNode,
      ports: {
        ...toNode.ports,
        [connection.toPort]: {
          ...toNode.ports[connection.toPort],
          connectedTo: connection.fromNodeId,
        },
      },
      parentId: connection.fromNodeId,
    };

    return {
      ...mindMap,
      nodes: {
        ...mindMap.nodes,
        [connection.fromNodeId]: updatedFromNode,
        [connection.toNodeId]: updatedToNode,
      },
      connections: [...mindMap.connections, connection],
    };
  },

  /**
   * Remove a connection
   */
  removeConnection(
    mindMap: MindMap,
    connectionId: string
  ): MindMap {
    const connection = mindMap.connections.find(c => c.id === connectionId);
    if (!connection) return mindMap;

    const fromNode = mindMap.nodes[connection.fromNodeId];
    const toNode = mindMap.nodes[connection.toNodeId];

    if (fromNode) {
      fromNode.ports[connection.fromPort].connectedTo = null;
      fromNode.childIds = fromNode.childIds.filter(id => id !== connection.toNodeId);
    }

    if (toNode) {
      toNode.ports[connection.toPort].connectedTo = null;
      toNode.parentId = null;
    }

    return {
      ...mindMap,
      connections: mindMap.connections.filter(c => c.id !== connectionId),
    };
  },

  /**
   * Update node position
   */
  updateNodePosition(
    mindMap: MindMap,
    nodeId: string,
    x: number,
    y: number
  ): MindMap {
    const node = mindMap.nodes[nodeId];
    if (!node) return mindMap;

    return {
      ...mindMap,
      nodes: {
        ...mindMap.nodes,
        [nodeId]: {
          ...node,
          x,
          y,
        },
      },
    };
  },

  /**
   * Update node text
   */
  updateNodeText(
    mindMap: MindMap,
    nodeId: string,
    text: string
  ): MindMap {
    const node = mindMap.nodes[nodeId];
    if (!node) return mindMap;

    return {
      ...mindMap,
      nodes: {
        ...mindMap.nodes,
        [nodeId]: {
          ...node,
          text,
        },
      },
    };
  },

  /**
   * Get all ancestor nodes (tree path) for a given node
   */
  getNodePath(mindMap: MindMap, nodeId: string): MindNode[] {
    const path: MindNode[] = [];
    let currentId: string | null = nodeId;

    while (currentId) {
      const node = mindMap.nodes[currentId];
      if (!node) break;
      
      path.unshift(node);
      currentId = node.parentId;
    }

    return path;
  },

  /**
   * Convert mind map to text document for RAG
   */
  mindMapToDocument(mindMap: MindMap): string {
    if (!mindMap.rootNodeId) return '';

    const lines: string[] = [];
    lines.push(`# ${mindMap.name}`);
    lines.push('');

    const visited = new Set<string>();

    const traverse = (nodeId: string, depth: number = 0) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);

      const node = mindMap.nodes[nodeId];
      if (!node) return;

      const indent = '  '.repeat(depth);
      const path = this.getNodePath(mindMap, nodeId);
      const pathText = path.map(n => n.text).join(' > ');

      lines.push(`${indent}- **Node**: ${node.text}`);
      lines.push(`${indent}  - **Path**: ${pathText}`);
      lines.push('');

      // Traverse children
      for (const childId of node.childIds) {
        traverse(childId, depth + 1);
      }
    };

    if (mindMap.rootNodeId) {
      traverse(mindMap.rootNodeId);
    }

    return lines.join('\n');
  },

  /**
   * Generate a random color for nodes
   */
  generateRandomColor(): string {
    const colors = [
      '#10b981', // emerald
      '#3b82f6', // blue
      '#8b5cf6', // purple
      '#ec4899', // pink
      '#f59e0b', // amber
      '#06b6d4', // cyan
      '#f97316', // orange
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  },

  /**
   * Check if creating a connection would create a cycle
   */
  wouldCreateCycle(
    mindMap: MindMap,
    fromNodeId: string,
    toNodeId: string
  ): boolean {
    // Check if toNode is an ancestor of fromNode
    let currentId: string | null = fromNodeId;
    
    while (currentId) {
      if (currentId === toNodeId) return true;
      const node = mindMap.nodes[currentId];
      if (!node) break;
      currentId = node.parentId;
    }

    return false;
  },
};
