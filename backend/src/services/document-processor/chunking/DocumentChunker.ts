import { Section, Chunk } from '../types';
import { encode } from 'gpt-tokenizer';

export class DocumentChunker {
    private maxTokensPerChunk: number;

    constructor(maxTokensPerChunk: number = 8000) {
        this.maxTokensPerChunk = maxTokensPerChunk;
    }

    segmentDocument(text: string): Section[] {
        const sections: Section[] = [];
        let currentSection: string | null = null;
        let currentContent: string[] = [];
        let pageNumber = 1;

        // Split text into lines
        const lines = text.split('\n');

        for (const line of lines) {
            // Check for section headers
            if (this.isSectionHeader(line)) {
                // Save previous section if exists
                if (currentSection) {
                    sections.push({
                        id: `section_${sections.length}`,
                        title: currentSection,
                        content: currentContent.join('\n'),
                        pageRange: [pageNumber, pageNumber]
                    });
                }

                currentSection = line.trim();
                currentContent = [];
            } else {
                currentContent.push(line);
            }

            // Simple page number detection (can be enhanced)
            if (line.includes('Page') && /\d+/.test(line)) {
                const match = line.match(/\d+/);
                if (match) {
                    pageNumber = parseInt(match[0], 10);
                }
            }
        }

        // Add the last section
        if (currentSection) {
            sections.push({
                id: `section_${sections.length}`,
                title: currentSection,
                content: currentContent.join('\n'),
                pageRange: [pageNumber, pageNumber]
            });
        }

        return sections;
    }

    createChunks(sections: Section[]): Chunk[] {
        const chunks: Chunk[] = [];
        let currentChunk: Chunk = {
            sections: [],
            content: [],
            tokenCount: 0
        };

        for (const section of sections) {
            const sectionTokens = encode(section.content).length;

            // If section is too large, split it into paragraphs
            if (sectionTokens > this.maxTokensPerChunk) {
                const paragraphs = section.content.split('\n\n');
                for (const para of paragraphs) {
                    const paraTokens = encode(para).length;

                    if (currentChunk.tokenCount + paraTokens > this.maxTokensPerChunk) {
                        chunks.push(currentChunk);
                        currentChunk = {
                            sections: [],
                            content: [],
                            tokenCount: 0
                        };
                    }

                    currentChunk.sections.push(section.id);
                    currentChunk.content.push(para);
                    currentChunk.tokenCount += paraTokens;
                }
            } else {
                // If adding this section would exceed the limit, start a new chunk
                if (currentChunk.tokenCount + sectionTokens > this.maxTokensPerChunk) {
                    chunks.push(currentChunk);
                    currentChunk = {
                        sections: [],
                        content: [],
                        tokenCount: 0
                    };
                }

                currentChunk.sections.push(section.id);
                currentChunk.content.push(section.content);
                currentChunk.tokenCount += sectionTokens;
            }
        }

        // Add the last chunk if it's not empty
        if (currentChunk.content.length > 0) {
            chunks.push(currentChunk);
        }

        return chunks;
    }

    private isSectionHeader(line: string): boolean {
        const trimmedLine = line.trim();

        // Check for numbered headings (e.g., "1. Introduction")
        if (/^\d+\.\s+[A-Z]/.test(trimmedLine)) {
            return true;
        }

        // Check for ALL CAPS headers
        if (trimmedLine === trimmedLine.toUpperCase() && trimmedLine.length > 3) {
            return true;
        }

        // Check for common heading patterns
        const headingPatterns = [
            /^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*$/,  // Title Case
            /^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*:$/  // Title Case with colon
        ];

        return headingPatterns.some(pattern => pattern.test(trimmedLine));
    }
} 