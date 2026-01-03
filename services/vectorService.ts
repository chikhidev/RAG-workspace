
import { Document, Chunk } from '../types';

/**
 * A lightweight vector service. 
 * Since true ChromaDB is a server-side DB, we implement a functional 
 * browser-equivalent using simple keyword weighting and TF-IDF style 
 * similarity for this demonstration, as loading full 500MB+ Sentence Transformer 
 * models in-browser can be brittle without specialized setup.
 * 
 * In a production environment, this would call a ChromaDB REST API.
 */
export class VectorService {
  private chunks: Chunk[] = [];

  public async indexDocuments(documents: Document[]): Promise<void> {
    this.chunks = [];
    for (const doc of documents) {
      const docChunks = this.splitIntoChunks(doc);
      this.chunks.push(...docChunks);
    }
    // In a real RAG, we'd generate embeddings here.
    // For this prototype, we'll use an optimized keyword-overlap search.
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

  public async search(expandedQuery: string, limit: number = 4): Promise<Chunk[]> {
    if (this.chunks.length === 0) return [];

    // Simulate vector search by scoring chunks based on query keywords
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
