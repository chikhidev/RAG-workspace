/**
 * Command Execution Service
 * Handles execution of system commands for the thinking phase
 */

import { MindMap } from '../types';
import { mindMapSearchService } from './mindMapSearchService';

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

export interface CommandResult {
  success: boolean;
  type: 'grep' | 'read_lines' | 'mindmap_search';
  results?: GrepResult[] | ReadLinesResult | any;
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
   * Search through mind maps intelligently
   * This allows the LLM to navigate the hierarchical structure of mind maps
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

      // Very generic queries like "mind map", "what is", etc. should search ALL mind maps
      const queryLower = query.toLowerCase();
      const isGenericQuery: boolean = /^(what|mind ?map|available|show|list)/.test(queryLower);
      
      // Filter enabled mind maps and check relevance (unless query is very generic)
      const relevantMaps = isGenericQuery 
        ? enabledMaps
        : enabledMaps.filter(map => mindMapSearchService.isRelevantMindMap(map, query));

      if (relevantMaps.length === 0) {
        // Show available mind maps when no relevant ones found
        const availableTopics = enabledMaps
          .map(m => {
            const rootNode = m.rootNodeId && m.nodes[m.rootNodeId];
            return `"${m.name}" - ${rootNode ? rootNode.text : 'No description'}`;
          })
          .join(', ');
        
        return {
          success: true,
          type: 'mindmap_search',
          results: [],
          summary: `🗺️ Mind Map Search: No mind maps match query "${query}".\nAvailable mind maps: ${availableTopics}`
        };
      }

      // Search each relevant mind map
      const allResults: any[] = [];
      for (const map of relevantMaps) {
        const results = mindMapSearchService.search(map, query, maxResults);
        
        // For generic queries, always include the map even if no specific nodes match
        if (isGenericQuery || results.length > 0) {
          const rootNode = map.rootNodeId && map.nodes[map.rootNodeId];
          allResults.push({
            mindMapName: map.name,
            mindMapId: map.id,
            rootNodeText: rootNode ? rootNode.text : 'No description',
            results: results.map(r => ({
              text: r.node.text,
              path: r.path,
              depth: r.depth,
              relevanceScore: r.relevanceScore
            }))
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
   * Format mind map search results for LLM consumption
   */
  private formatMindMapSearchResults(results: any[], query: string, isGenericQuery: boolean = false): string {
    if (results.length === 0) {
      return `🗺️ Mind Map Search: No results found for "${query}"`;
    }

    let formatted = `🗺️ Mind Map Search Results for "${query}":\n\n`;

    for (const mapResult of results) {
      formatted += `📍 Mind Map: ${mapResult.mindMapName}\n`;
      formatted += `   Topic: ${mapResult.rootNodeText}\n`;
      
      if (mapResult.results.length === 0) {
        formatted += `   (Root node only - no matching child nodes)\n\n`;
      } else {
        formatted += `   Found ${mapResult.results.length} relevant node(s):\n\n`;

        for (let i = 0; i < mapResult.results.length; i++) {
          const result = mapResult.results[i];
          formatted += `   ${i + 1}. "${result.text}"\n`;
          formatted += `      Path: ${result.path.join(' → ')}\n`;
          formatted += `      Depth: ${result.depth} | Relevance: ${result.relevanceScore.toFixed(1)}\n\n`;
        }
      }
    }

    return formatted;
  }
}

export const commandService = new CommandExecutionService();
