/**
 * TOON Format Service
 * Provides token-efficient encoding/decoding for LLM communication
 */

export interface ToonEncodeOptions {
  indent?: number;
  delimiter?: ',' | '\t' | '|';
  keyFolding?: 'off' | 'safe';
  flattenDepth?: number;
}

export interface ToonDecodeOptions {
  indent?: number;
  strict?: boolean;
  expandPaths?: 'off' | 'safe';
}

class ToonService {
  /**
   * Encodes JavaScript objects to TOON format
   * TOON is more compact than JSON, saving tokens
   */
  encode(input: unknown, options: ToonEncodeOptions = {}): string {
    const { indent = 2, delimiter = ',', keyFolding = 'off', flattenDepth = Infinity } = options;
    
    try {
      return this.encodeValue(input, 0, { indent, delimiter, keyFolding, flattenDepth });
    } catch (error) {
      console.error('TOON encoding failed:', error);
      return JSON.stringify(input); // Fallback to JSON
    }
  }

  /**
   * Decodes TOON format back to JavaScript objects
   */
  decode(input: string, options: ToonDecodeOptions = {}): unknown {
    const { strict = true, expandPaths = 'off' } = options;
    
    try {
      const lines = input.split('\n').filter(l => l.trim());
      return this.decodeLines(lines, expandPaths);
    } catch (error) {
      console.error('TOON decoding failed:', error);
      return JSON.parse(input); // Fallback to JSON parsing
    }
  }

  /**
   * Estimate token savings compared to JSON
   */
  estimateTokenSavings(data: unknown): { json: number; toon: number; saved: number; percentage: number } {
    const jsonStr = JSON.stringify(data);
    const toonStr = this.encode(data, { delimiter: '\t' }); // Tab delimiter is more efficient
    
    // Rough token estimation (1 token ≈ 4 characters)
    const jsonTokens = Math.ceil(jsonStr.length / 4);
    const toonTokens = Math.ceil(toonStr.length / 4);
    const saved = jsonTokens - toonTokens;
    const percentage = saved > 0 ? (saved / jsonTokens) * 100 : 0;
    
    return { json: jsonTokens, toon: toonTokens, saved, percentage };
  }

  private encodeValue(value: unknown, depth: number, options: Required<ToonEncodeOptions>): string {
    const { indent, delimiter } = options;
    const indentStr = ' '.repeat(indent);
    
    // Handle null/undefined
    if (value === null || value === undefined) {
      return 'null';
    }
    
    // Handle primitives
    if (typeof value === 'string') {
      return this.needsQuotes(value) ? `"${this.escapeString(value)}"` : value;
    }
    if (typeof value === 'number') {
      return String(value);
    }
    if (typeof value === 'boolean') {
      return String(value);
    }
    
    // Handle arrays
    if (Array.isArray(value)) {
      if (value.length === 0) {
        return '[]';
      }
      
      // Check if array of primitives
      if (value.every(v => this.isPrimitive(v))) {
        const items = value.map(v => this.encodePrimitive(v)).join(delimiter);
        return `[${value.length}]: ${items}`;
      }
      
      // Check if array of objects with same keys (tabular format)
      if (value.every(v => typeof v === 'object' && v !== null && !Array.isArray(v))) {
        const first = value[0] as Record<string, unknown>;
        const keys = Object.keys(first);
        const isTabular = value.every(obj => {
          const objKeys = Object.keys(obj as Record<string, unknown>);
          return objKeys.length === keys.length && objKeys.every(k => keys.includes(k));
        });
        
        if (isTabular && keys.every(k => value.every(obj => this.isPrimitive((obj as any)[k])))) {
          const header = `[${value.length}]{${keys.join(delimiter)}}:`;
          const rows = value.map(obj => {
            return '\n' + indentStr.repeat(depth + 1) + 
              keys.map(k => this.encodePrimitive((obj as any)[k])).join(delimiter);
          }).join('');
          return header + rows;
        }
      }
      
      // Array of complex objects
      const items = value.map(v => {
        const encoded = this.encodeValue(v, depth + 1, options);
        return '\n' + indentStr.repeat(depth + 1) + '- ' + encoded;
      }).join('');
      return '[]:' + items;
    }
    
    // Handle objects
    if (typeof value === 'object') {
      const obj = value as Record<string, unknown>;
      const keys = Object.keys(obj);
      
      if (keys.length === 0) {
        return '{}';
      }
      
      const entries = keys.map(key => {
        const val = obj[key];
        const encodedKey = this.encodeKey(key);
        
        // Inline primitive values
        if (this.isPrimitive(val)) {
          return '\n' + indentStr.repeat(depth + 1) + `${encodedKey}: ${this.encodePrimitive(val)}`;
        }
        
        // Multi-line for complex values
        const encodedVal = this.encodeValue(val, depth + 1, options);
        if (encodedVal.includes('\n')) {
          return '\n' + indentStr.repeat(depth + 1) + `${encodedKey}:` + 
            '\n' + indentStr.repeat(depth + 2) + encodedVal.split('\n').join('\n' + indentStr.repeat(depth + 2));
        }
        return '\n' + indentStr.repeat(depth + 1) + `${encodedKey}: ${encodedVal}`;
      }).join('');
      
      return entries.substring(1); // Remove leading newline for root
    }
    
    return String(value);
  }

  private decodeLines(lines: string[], expandPaths: 'off' | 'safe'): unknown {
    if (lines.length === 0) return null;
    
    const result: Record<string, unknown> = {};
    let i = 0;
    
    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();
      
      if (!trimmed || trimmed.startsWith('#')) {
        i++;
        continue;
      }
      
      // Parse key: value pairs
      const colonIndex = trimmed.indexOf(':');
      if (colonIndex > 0) {
        const key = trimmed.substring(0, colonIndex).trim();
        const value = trimmed.substring(colonIndex + 1).trim();
        
        // Check for array header
        if (key.includes('[') && key.includes(']')) {
          const actualKey = key.substring(0, key.indexOf('['));
          const arrayMatch = key.match(/\[(\d+)\]/);
          const fieldsMatch = key.match(/\{([^}]+)\}/);
          
          if (arrayMatch && fieldsMatch) {
            // Tabular array
            const length = parseInt(arrayMatch[1], 10);
            const fields = fieldsMatch[1].split(',').map(f => f.trim());
            const items: Record<string, unknown>[] = [];
            
            i++;
            for (let j = 0; j < length && i < lines.length; j++) {
              const rowLine = lines[i].trim();
              if (rowLine.startsWith('-')) {
                i++;
                continue;
              }
              const values = this.parseDelimited(rowLine);
              const obj: Record<string, unknown> = {};
              fields.forEach((field, idx) => {
                obj[field] = this.parsePrimitive(values[idx] || 'null');
              });
              items.push(obj);
              i++;
            }
            
            result[actualKey] = items;
            continue;
          }
        }
        
        if (value) {
          // Inline value
          if (value.startsWith('[') && value.endsWith(']') && value.includes(':')) {
            // Inline array of primitives
            const colonPos = value.indexOf(':');
            const items = value.substring(colonPos + 1).trim().split(',').map(v => this.parsePrimitive(v.trim()));
            result[key] = items;
          } else {
            result[key] = this.parsePrimitive(value);
          }
        } else {
          // Multi-line value (next lines are indented)
          result[key] = this.parseNestedValue(lines, i + 1);
        }
      }
      
      i++;
    }
    
    return Object.keys(result).length === 0 ? null : result;
  }

  private parseNestedValue(lines: string[], startIndex: number): unknown {
    // Simplified nested parsing
    const nestedLines: string[] = [];
    const baseIndent = this.getIndentLevel(lines[startIndex] || '');
    
    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i];
      const indent = this.getIndentLevel(line);
      
      if (indent < baseIndent && line.trim()) {
        break;
      }
      
      nestedLines.push(line);
    }
    
    return this.decodeLines(nestedLines, 'off');
  }

  private parseDelimited(value: string, delimiter: ',' | '\t' | '|' = ','): string[] {
    // Handle quoted strings in delimited values
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < value.length; i++) {
      const char = value[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if ((char === delimiter || char === '\t') && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    if (current) {
      result.push(current.trim());
    }
    
    return result;
  }

  private parsePrimitive(value: string): unknown {
    const trimmed = value.trim();
    
    if (trimmed === 'null' || trimmed === '') return null;
    if (trimmed === 'true') return true;
    if (trimmed === 'false') return false;
    
    // Remove quotes
    if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
      return trimmed.slice(1, -1);
    }
    
    // Try number
    const num = Number(trimmed);
    if (!isNaN(num) && trimmed !== '') {
      return num;
    }
    
    return trimmed;
  }

  private isPrimitive(value: unknown): boolean {
    return value === null || 
           value === undefined ||
           typeof value === 'string' || 
           typeof value === 'number' || 
           typeof value === 'boolean';
  }

  private encodePrimitive(value: unknown): string {
    if (value === null || value === undefined) return 'null';
    if (typeof value === 'string') {
      return this.needsQuotes(value) ? `"${this.escapeString(value)}"` : value;
    }
    return String(value);
  }

  private encodeKey(key: string): string {
    // Keys rarely need quotes in TOON
    return this.needsQuotes(key) ? `"${this.escapeString(key)}"` : key;
  }

  private needsQuotes(str: string): boolean {
    // Need quotes if contains special chars, spaces, or looks like a number/boolean
    if (!str || str === 'null' || str === 'true' || str === 'false') return true;
    if (!isNaN(Number(str))) return true;
    return /[,:\[\]{}"\n\r\t]/.test(str);
  }

  private escapeString(str: string): string {
    return str
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t');
  }

  private getIndentLevel(line: string): number {
    let count = 0;
    for (const char of line) {
      if (char === ' ') count++;
      else break;
    }
    return count;
  }
}

export const toonService = new ToonService();
