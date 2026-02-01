
import { Document, Chunk } from '../types';

export class VectorService {
  private chunks: Chunk[] = [];

  public async indexDocuments(documents: Document[]): Promise<void> {
    this.chunks = [];
    for (const doc of documents) {
      const docChunks = this.splitIntoChunks(doc);
      this.chunks.push(...docChunks);
    }
  }

  private splitIntoChunks(doc: Document): Chunk[] {
    const CHUNK_SIZE = 800;
    const OVERLAP = 100;
    const text = doc.content;
    const chunks: Chunk[] = [];

    let start = 0;
    while (start < text.length) {
      const end = start + CHUNK_SIZE;
      chunks.push({
        docId: doc.id,
        docName: doc.name,
        text: text.substring(start, end),
      });
      start += CHUNK_SIZE - OVERLAP;
    }
    return chunks;
  }

  /**
   * Cat: Retrieve ALL chunks from specific files (like Unix cat command)
   * Used when user explicitly mentions files with @filename
   */
  public async catFiles(fileNames: string[]): Promise<Chunk[]> {
    if (this.chunks.length === 0) return [];
    
    const results: Chunk[] = [];
    for (const fileName of fileNames) {
      const fileChunks = this.chunks.filter(
        chunk => chunk.docName.toLowerCase() === fileName.toLowerCase()
      );
      results.push(...fileChunks);
    }
    
    return results;
  }

  public async search(expandedQuery: string, limit: number = 4, taggedFileNames: string[] = []): Promise<Chunk[]> {
    if (this.chunks.length === 0) return [];

    // If files are explicitly tagged with @, retrieve ALL their content (cat behavior)
    if (taggedFileNames.length > 0) {
      const taggedChunks = await this.catFiles(taggedFileNames);
      
      // If we got tagged chunks, return them all (full file content)
      if (taggedChunks.length > 0) {
        return taggedChunks;
      }
    }

    // Otherwise, do semantic search as normal
    const keywords = expandedQuery.toLowerCase().split(/[\s,.-]+/).filter(k => k.length > 2);

    const scored = this.chunks.map(chunk => {
      let score = 0;
      const chunkLower = chunk.text.toLowerCase();

      keywords.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        const matches = chunkLower.match(regex);
        if (matches) {
          score += matches.length;
        }
      });

      return { chunk, score };
    });

    return scored
      .sort((a, b) => b.score - a.score)
      .filter(s => s.score > 0)
      .slice(0, limit)
      .map(s => s.chunk);
  }
}

export const vectorService = new VectorService();
