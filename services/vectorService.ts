
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

  public async search(expandedQuery: string, limit: number = 4, taggedFileNames: string[] = []): Promise<Chunk[]> {
    if (this.chunks.length === 0) return [];

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

      // APPLY TAG BOOST: Additive score for files explicitly mentioned by the user
      // so they appear even if they have 0 keyword matches.
      if (taggedFileNames.some(tagged => chunk.docName.toLowerCase() === tagged.toLowerCase())) {
        score += 100.0;
      }

      return { chunk, score };
    });

    return scored
      .sort((a, b) => b.score - a.score)
      .filter(s => s.score > 0 || taggedFileNames.length > 0) // Allow results if we have tags
      .slice(0, limit)
      .map(s => s.chunk);
  }
}

export const vectorService = new VectorService();
