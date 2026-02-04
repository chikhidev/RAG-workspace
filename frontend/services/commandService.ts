/**
 * Command Execution Service
 * Handles execution of system commands for the thinking phase
 */

import { MindMap } from '../types';
import { mindMapSearchService, MindMapSearchResult, NodeNavigationResult } from './mindMapSearchService';

export interface GrepResult {
  fileName: string;
  lineNumber: number;
  lineContent: string;
  matchCount?: number;
}

export interface ReadLinesResult {
  fileName: string;
  startLine: number;
  endLine: number;
  content: string;
  totalLines: number;
}

export interface MindMapSearchResultForLLM {
  mindMapId: string;
  mindMapName: string;
  rootNodeText: string;
  nodeCount: number;
  results: Array<{
    nodeId: string;
    nodeText: string;
    path: string[];
    depth: number;
    relevanceScore: number;
    nextNodes: Array<{
      nodeId: string;
      nodeText: string;
      direction: string;
    }>;
  }>;
}

export interface MindMapNavigationResultForLLM {
  success: boolean;
  mindMapName: string;
  currentNode: {
    nodeId: string;
    nodeText: string;
    path: string[];
    depth: number;
  } | null;
  parentNode: { nodeId: string; nodeText: string } | null;
  childNodes: Array<{ nodeId: string; nodeText: string }>;
  siblingNodes: Array<{ nodeId: string; nodeText: string }>;
}

export interface CommandResult {
  success: boolean;
  type: 'grep' | 'read_lines' | 'mindmap_search' | 'mindmap_navigate';
  results?: GrepResult[] | ReadLinesResult | MindMapSearchResultForLLM[] | MindMapNavigationResultForLLM;
  error?: string;
  summary: string;
}

export class CommandExecutionService {
  /**
   * Execute grep search across specified files
   */
  public async executeGrep(
    pattern: string,
    targetFiles: string[] | null,
    availableDocuments: { name: string; content: string; enabled: boolean }[],
    caseSensitive: boolean = false,
    maxResults: number = 20
  ): Promise<CommandResult> {
    try {
      const results: GrepResult[] = [];
      
      // Determine which files to search
      const filesToSearch = targetFiles 
        ? availableDocuments.filter(doc => doc.enabled && targetFiles.includes(doc.name))
        : availableDocuments.filter(doc => doc.enabled);

      if (filesToSearch.length === 0) {
        return {
          success: false,
          type: 'grep',
          error: 'No files available to search',
          summary: 'No files found to search'
        };
      }

      // Create regex for pattern matching
      const flags = caseSensitive ? 'g' : 'gi';
      const regex = new RegExp(pattern, flags);

      // Search through each file
      for (const doc of filesToSearch) {
        const lines = doc.content.split('\n');
        let matchCount = 0;

        for (let i = 0; i < lines.length; i++) {
          if (results.length >= maxResults) break;
          
          const line = lines[i];
          if (regex.test(line)) {
            matchCount++;
            results.push({
              fileName: doc.name,
              lineNumber: i + 1,
              lineContent: line.trim()
            });
          }
        }
      }

      const summary = results.length > 0
        ? `Found ${results.length} match${results.length === 1 ? '' : 'es'} across ${new Set(results.map(r => r.fileName)).size} file(s)`
        : `No matches found for pattern "${pattern}"`;

      return {
        success: true,
        type: 'grep',
        results,
        summary
      };
    } catch (error: any) {
      return {
        success: false,
        type: 'grep',
        error: error.message || 'Grep execution failed',
        summary: `Error: ${error.message || 'Unknown error'}`
      };
    }
  }

  /**
   * Read specific lines from a file
   */
  public async readLines(
    fileName: string,
    startLine: number,
    endLine: number,
    availableDocuments: { name: string; content: string; enabled: boolean }[]
  ): Promise<CommandResult> {
    try {
      // Find the target file
      const targetDoc = availableDocuments.find(
        doc => doc.enabled && doc.name === fileName
      );

      if (!targetDoc) {
        return {
          success: false,
          type: 'read_lines',
          error: `File "${fileName}" not found or not enabled`,
          summary: `File "${fileName}" not found`
        };
      }

      const lines = targetDoc.content.split('\n');
      const totalLines = lines.length;

      // Validate line numbers
      if (startLine < 1 || startLine > totalLines) {
        return {
          success: false,
          type: 'read_lines',
          error: `Start line ${startLine} is out of range (file has ${totalLines} lines)`,
          summary: `Invalid line range`
        };
      }

      if (endLine < startLine) {
        return {
          success: false,
          type: 'read_lines',
          error: `End line ${endLine} is before start line ${startLine}`,
          summary: `Invalid line range`
        };
      }

      // Adjust endLine if it exceeds file length
      const adjustedEndLine = Math.min(endLine, totalLines);

      // Extract the requested lines (convert to 0-based indexing)
      const extractedLines = lines.slice(startLine - 1, adjustedEndLine);
      const content = extractedLines.join('\n');

      const result: ReadLinesResult = {
        fileName,
        startLine,
        endLine: adjustedEndLine,
        content,
        totalLines
      };

      return {
        success: true,
        type: 'read_lines',
        results: result,
        summary: `Read lines ${startLine}-${adjustedEndLine} from ${fileName} (${extractedLines.length} lines)`
      };
    } catch (error: any) {
      return {
        success: false,
        type: 'read_lines',
        error: error.message || 'Read lines execution failed',
        summary: `Error: ${error.message || 'Unknown error'}`
      };
    }
  }

  /**
   * Format grep results for display in the thinking phase
   */
  public formatGrepResults(results: GrepResult[], maxDisplay: number = 10): string {
    if (results.length === 0) {
      return 'No matches found.';
    }

    const grouped = new Map<string, GrepResult[]>();
    results.forEach(r => {
      if (!grouped.has(r.fileName)) {
        grouped.set(r.fileName, []);
      }
      grouped.get(r.fileName)!.push(r);
    });

    let formatted = '';
    let displayCount = 0;

    for (const [fileName, matches] of grouped) {
      formatted += `\n📄 ${fileName} (${matches.length} match${matches.length === 1 ? '' : 'es'}):\n`;
      
      for (const match of matches) {
        if (displayCount >= maxDisplay) {
          formatted += `\n... and ${results.length - displayCount} more results`;
          return formatted;
        }
        formatted += `  Line ${match.lineNumber}: ${match.lineContent}\n`;
        displayCount++;
      }
    }

    return formatted;
  }

  /**
   * Format read lines results for display in the thinking phase
   */
  public formatReadLinesResult(result: ReadLinesResult): string {
    const lineCount = result.endLine - result.startLine + 1;
    return `📄 ${result.fileName} (Lines ${result.startLine}-${result.endLine} of ${result.totalLines}):\n\n${result.content}`;
  }

  /**
   * Semantic search through mind maps
   * Returns nodes with IDs for navigation
   */
  public async searchMindMaps(
    query: string,
    availableMindMaps: MindMap[],
    maxResults: number = 5
  ): Promise<CommandResult> {
    try {
      const enabledMaps = availableMindMaps.filter(map => map.enabled);

      if (enabledMaps.length === 0) {
        return {
          success: true,
          type: 'mindmap_search',
          results: [],
          summary: `🗺️ Mind Map Search: No mind maps available (all disabled or none exist)`
        };
      }

      // Check if query is very generic
      const queryLower = query.toLowerCase();
      const isGenericQuery = /^(what|mind ?map|available|show|list|all)/.test(queryLower) || 
                             query.length < 10;

      // Evaluate all mind maps for relevance
      const relevanceResults = mindMapSearchService.evaluateAllMindMaps(enabledMaps, query);
      
      // Filter to relevant maps (or all if generic query)
      const relevantMaps = isGenericQuery 
        ? enabledMaps
        : enabledMaps.filter((map, i) => relevanceResults[i].isRelevant);

      if (relevantMaps.length === 0) {
        // Show available mind maps when no relevant ones found
        const availableInfo = relevanceResults
          .map(r => `"${r.mindMapName}" - ${r.entrypointText} (${r.nodeCount} nodes)`)
          .join('\n  ');
        
        return {
          success: true,
          type: 'mindmap_search',
          results: [],
          summary: `🗺️ Mind Map Search: No mind maps match query "${query}".\n\nAvailable mind maps:\n  ${availableInfo}`
        };
      }

      // Search each relevant mind map with semantic search
      const allResults: MindMapSearchResultForLLM[] = [];
      
      for (const map of relevantMaps) {
        const searchResults = mindMapSearchService.semanticSearch(map, query, maxResults);
        const rootNode = map.rootNodeId ? map.nodes[map.rootNodeId] : null;
        
        // Always include the map info even if no specific nodes match (for generic queries)
        if (isGenericQuery || searchResults.length > 0) {
          allResults.push({
            mindMapId: map.id,
            mindMapName: map.name,
            rootNodeText: rootNode?.text || 'No description',
            nodeCount: Object.keys(map.nodes).length,
            results: searchResults.map(r => ({
              nodeId: r.nodeId,
              nodeText: r.nodeText,
              path: r.path,
              depth: r.depth,
              relevanceScore: r.relevanceScore,
              nextNodes: r.connectedNodes.map(c => ({
                nodeId: c.nodeId,
                nodeText: c.nodeText,
                direction: c.direction,
              })),
            })),
          });
        }
      }

      const formatted = this.formatMindMapSearchResults(allResults, query, isGenericQuery);

      return {
        success: true,
        type: 'mindmap_search',
        results: allResults,
        summary: formatted
      };
    } catch (error) {
      return {
        success: false,
        type: 'mindmap_search',
        error: error instanceof Error ? error.message : String(error),
        summary: `❌ Mind map search failed: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Navigate to a specific node by ID
   * Returns the node context with parent, children, and siblings
   */
  public async navigateMindMapNode(
    nodeId: string,
    mindMapId: string,
    availableMindMaps: MindMap[]
  ): Promise<CommandResult> {
    try {
      const targetMap = availableMindMaps.find(m => m.id === mindMapId && m.enabled);
      
      if (!targetMap) {
        return {
          success: false,
          type: 'mindmap_navigate',
          error: `Mind map with ID "${mindMapId}" not found or disabled`,
          summary: `❌ Mind map not found`
        };
      }

      const navResult = mindMapSearchService.navigateToNode(targetMap, nodeId, 5);
      
      if (!navResult.success || !navResult.node) {
        return {
          success: false,
          type: 'mindmap_navigate',
          error: `Node with ID "${nodeId}" not found in mind map "${targetMap.name}"`,
          summary: `❌ Node not found`
        };
      }

      const result: MindMapNavigationResultForLLM = {
        success: true,
        mindMapName: targetMap.name,
        currentNode: {
          nodeId: navResult.node.id,
          nodeText: navResult.node.text,
          path: navResult.path,
          depth: navResult.depth,
        },
        parentNode: navResult.parentNode ? {
          nodeId: navResult.parentNode.nodeId,
          nodeText: navResult.parentNode.nodeText,
        } : null,
        childNodes: navResult.childNodes.map(c => ({
          nodeId: c.nodeId,
          nodeText: c.nodeText,
        })),
        siblingNodes: navResult.siblingNodes.map(s => ({
          nodeId: s.nodeId,
          nodeText: s.nodeText,
        })),
      };

      const formatted = mindMapSearchService.formatNavigationForLLM(navResult, targetMap.name);

      return {
        success: true,
        type: 'mindmap_navigate',
        results: result,
        summary: formatted
      };
    } catch (error) {
      return {
        success: false,
        type: 'mindmap_navigate',
        error: error instanceof Error ? error.message : String(error),
        summary: `❌ Navigation failed: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Format mind map search results for LLM consumption
   * Includes node IDs for navigation
   */
  private formatMindMapSearchResults(
    results: MindMapSearchResultForLLM[], 
    query: string, 
    isGenericQuery: boolean = false
  ): string {
    if (results.length === 0) {
      return `🗺️ Mind Map Search: No results found for "${query}"`;
    }

    let formatted = `🗺️ Mind Map Search Results for "${query}":\n\n`;

    for (const mapResult of results) {
      formatted += `📍 Mind Map: "${mapResult.mindMapName}" (ID: ${mapResult.mindMapId})\n`;
      formatted += `   Entrypoint: "${mapResult.rootNodeText}"\n`;
      formatted += `   Total nodes: ${mapResult.nodeCount}\n`;
      
      if (mapResult.results.length === 0) {
        formatted += `   (Use mindmap_search with specific query to explore)\n\n`;
      } else {
        formatted += `   Found ${mapResult.results.length} relevant node(s):\n\n`;

        for (let i = 0; i < mapResult.results.length; i++) {
          const node = mapResult.results[i];
          formatted += `   [${i + 1}] "${node.nodeText}"\n`;
          formatted += `       ID: ${node.nodeId}\n`;
          formatted += `       Path: ${node.path.join(' → ')}\n`;
          formatted += `       Depth: ${node.depth} | Score: ${node.relevanceScore}\n`;
          
          if (node.nextNodes.length > 0) {
            formatted += `       Next nodes (use mindmap_navigate to explore):\n`;
            for (const next of node.nextNodes) {
              formatted += `         → [${next.direction}] "${next.nodeText}" (ID: ${next.nodeId})\n`;
            }
          }
          formatted += '\n';
        }
      }
    }

    formatted += `\n💡 Tip: Use mindmap_navigate with nodeId and mindMapId to explore deeper into the hierarchy.`;

    return formatted;
  }
}

export const commandService = new CommandExecutionService();
