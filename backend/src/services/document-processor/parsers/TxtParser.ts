import { BaseParser } from './BaseParser';
import { logger } from '../../../utils/logger';
import { promises as fs } from 'fs';

export class TxtParser implements BaseParser {
    async parse(filePath: string): Promise<string> {
        try {
            const content = await fs.readFile(filePath, 'utf-8');
            return content;
        } catch (error) {
            logger.error(`Error parsing text file (${filePath}):`, error);
            throw error;
        }
    }
} 