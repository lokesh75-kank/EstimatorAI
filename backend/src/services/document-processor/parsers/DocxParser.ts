import { BaseParser } from './BaseParser';
import { logger } from '../../../utils/logger';
import * as mammoth from 'mammoth';

export class DocxParser implements BaseParser {
    async parse(filePath: string): Promise<string> {
        try {
            const result = await mammoth.extractRawText({ path: filePath });
            return result.value;
        } catch (error) {
            logger.error(`Error parsing DOCX file (${filePath}):`, error);
            throw error;
        }
    }
} 