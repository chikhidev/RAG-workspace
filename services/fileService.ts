
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Configure worker for PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export const fileService = {
    async parseFile(file: File): Promise<string> {
        const type = file.type;
        const name = file.name.toLowerCase();

        if (type === 'application/pdf' || name.endsWith('.pdf')) {
            return this.parsePdf(file);
        } else if (
            type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
            name.endsWith('.docx')
        ) {
            return this.parseDocx(file);
        } else {
            // Default to text
            return await file.text();
        }
    },

    async parsePdf(file: File): Promise<string> {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            let fullText = '';

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items
                    .map((item: any) => item.str)
                    .join(' ');
                fullText += `[Page ${i}]\n${pageText}\n\n`;
            }
            return fullText;
        } catch (error) {
            console.error('PDF parsing error:', error);
            throw new Error('Failed to parse PDF file.');
        }
    },

    async parseDocx(file: File): Promise<string> {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const result = await mammoth.extractRawText({ arrayBuffer });
            return result.value;
        } catch (error) {
            console.error('DOCX parsing error:', error);
            throw new Error('Failed to parse DOCX file.');
        }
    },

    async fetchUrlContent(url: string): Promise<string> {
        try {
            // Use a CORS proxy if needed, or rely on sites allowing CORS.
            // For this demo, we'll try direct fetch and warn if it fails.
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Status ${response.status}`);

            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            // Remove scripts, styles, etc.
            const scripts = doc.querySelectorAll('script, style, noscript, iframe, link, svg');
            scripts.forEach(s => s.remove());

            let text = doc.body.textContent || '';
            // Clean up whitespace
            text = text.replace(/\s+/g, ' ').trim();

            if (text.length < 50) throw new Error("Content too short");

            return `[Source: ${url}]\n${text}`;
        } catch (error) {
            // console.error('URL fetch error:', error);
            throw new Error(`Could not fetch URL (CORS or Network Error). Try copy-pasting the text instead.`);
        }
    }
};
