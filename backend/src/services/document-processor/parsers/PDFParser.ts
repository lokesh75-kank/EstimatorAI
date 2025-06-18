import { BaseParser } from './BaseParser';
import { logger } from '../../../utils/logger';
import * as pdfjs from 'pdfjs-dist';

export class PDFParser implements BaseParser {
    async parse(filePath: string): Promise<string> {
        try {
            const data = new Uint8Array(await this.readFile(filePath));
            const doc = await pdfjs.getDocument({ data }).promise;
            
            let text = '';
            for (let i = 1; i <= doc.numPages; i++) {
                const page = await doc.getPage(i);
                const content = await page.getTextContent();
                const pageText = content.items
                    .map((item: any) => item.str)
                    .join(' ');
                text += `\nPage ${i}\n${pageText}\n`;
            }
            
            return text;
        } catch (error) {
            logger.error(`Error parsing PDF file (${filePath}):`, error);
            throw error;
        }
    }

    private async readFile(filePath: string): Promise<Buffer> {
        const fs = require('fs').promises;
        try {
            return await fs.readFile(filePath);
        } catch (error) {
            logger.error(`File not found or cannot be read: ${filePath}`, error);
            throw error;
        }
    }
} 