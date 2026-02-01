/**
 * Command Execution Service
 * Handles execution of system commands for the thinking phase
 */

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
  type: 'grep' | 'read_lines';
  results?: GrepResult[] | ReadLinesResult;
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
}

export const commandService = new CommandExecutionService();
