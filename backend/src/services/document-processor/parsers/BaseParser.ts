export interface BaseParser {
    parse(filePath: string): Promise<string>;
} 