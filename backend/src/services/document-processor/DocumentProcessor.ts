import { PDFParser } from './parsers/PDFParser';
import { DocxParser } from './parsers/DocxParser';
import { TxtParser } from './parsers/TxtParser';
import { DocumentChunker } from './chunking/DocumentChunker';
import { LLMProcessor } from './llm/LLMProcessor';
import { FieldValidator } from './validation/FieldValidator';
import { Section } from './types';
import { logger } from '../../utils/logger';
import { config } from '../../config/env';
import { encode } from 'gpt-tokenizer';

export class DocumentProcessor {
    private maxTokensPerChunk: number;
    private maxTokensPerDocument: number;
    private chunker: DocumentChunker;
    private llmProcessor: LLMProcessor;
    private validator: FieldValidator;

    constructor() {
        this.maxTokensPerChunk = config.documentProcessor.maxTokensPerChunk;
        this.maxTokensPerDocument = 120000; // Safely below the 128,000 limit
        this.chunker = new DocumentChunker(this.maxTokensPerChunk);
        this.llmProcessor = new LLMProcessor();
        this.validator = new FieldValidator();
    }

    async processDocument(filePath: string): Promise<Record<string, any>> {
        try {
            logger.info(`Starting document processing for: ${filePath}`);
            
            // 1. Document Ingestion
            let textContent: string;
            try {
                textContent = await this.ingestDocument(filePath);
                logger.info('Document ingestion successful.');
            } catch (error) {
                logger.error('Error during document ingestion:', error);
                throw error;
            }

            // 2. Split document into parts if it exceeds token limit
            const tokens = encode(textContent);
            const documentParts: string[] = [];
            
            if (tokens.length > this.maxTokensPerDocument) {
                logger.info(`Document exceeds token limit (${tokens.length} tokens). Splitting into multiple parts.`);
                
                // Split into parts of maxTokensPerDocument size
                for (let i = 0; i < tokens.length; i += this.maxTokensPerDocument) {
                    const partTokens = tokens.slice(i, i + this.maxTokensPerDocument);
                    documentParts.push(partTokens.join(' '));
                }
                
                logger.info(`Split document into ${documentParts.length} parts.`);
            } else {
                documentParts.push(textContent);
            }

            // 3. Process each part and merge results
            const allProcessedData: Record<string, any>[] = [];
            
            for (let i = 0; i < documentParts.length; i++) {
                logger.info(`Processing document part ${i + 1}/${documentParts.length}`);
                
                // Process this part
                const partData = await this.processDocumentPart(documentParts[i]);
                allProcessedData.push(partData);
            }

            // 4. Merge results from all parts
            const mergedData = this.mergeProcessedData(allProcessedData);
            
            // 5. Validate the merged data
            const validatedData = await this.validator.validateFields(mergedData);
            
            logger.info('Document processing completed successfully.');
            return validatedData;
            
        } catch (error) {
            logger.error('Error processing document:', error);
            throw error;
        }
    }

    private async processDocumentPart(textContent: string): Promise<Record<string, any>> {
        // 1. Section Segmentation
        let sections: Section[];
        try {
            sections = this.chunker.segmentDocument(textContent);
            logger.info(`Section segmentation complete. Found ${sections.length} sections.`);
        } catch (error) {
            logger.error('Error during section segmentation:', error);
            throw error;
        }
        
        // 2. Token Budgeting and Chunking
        let chunks;
        try {
            chunks = this.chunker.createChunks(sections);
            logger.info(`Chunking complete. Created ${chunks.length} chunks.`);
        } catch (error) {
            logger.error('Error during chunking:', error);
            throw error;
        }
        
        // 3. LLM Processing
        let processedChunks;
        try {
            processedChunks = await Promise.all(
                chunks.map(chunk => this.llmProcessor.processChunk(chunk))
            );
            logger.info('LLM processing complete.');
        } catch (error) {
            logger.error('Error during LLM processing:', error);
            throw error;
        }
        
        // 4. Output Assembly
        return this.assembleOutput(processedChunks);
    }

    private mergeProcessedData(processedDataArray: Record<string, any>[]): Record<string, any> {
        const mergedData: Record<string, any> = {};
        
        for (const processedData of processedDataArray) {
            for (const [key, value] of Object.entries(processedData)) {
                if (!(key in mergedData)) {
                    mergedData[key] = value;
                } else {
                    // Handle conflicts by taking the value with higher confidence
                    if (typeof value === 'object' && value !== null && 'confidence' in value) {
                        if (value.confidence > (mergedData[key]?.confidence || 0)) {
                            mergedData[key] = value;
                        }
                    } else if (Array.isArray(value)) {
                        // If the value is an array, merge the arrays
                        mergedData[key] = [...(mergedData[key] || []), ...value];
                    } else if (typeof value === 'object' && value !== null) {
                        // If the value is an object, merge the objects
                        mergedData[key] = { ...mergedData[key], ...value };
                    }
                }
            }
        }
        
        return mergedData;
    }

    private async ingestDocument(filePath: string): Promise<string> {
        const fileExtension = filePath.split('.').pop()?.toLowerCase();
        let parser;
        try {
            switch (fileExtension) {
                case 'pdf':
                    parser = new PDFParser();
                    break;
                case 'docx':
                    parser = new DocxParser();
                    break;
                case 'txt':
                    parser = new TxtParser();
                    break;
                default:
                    logger.error(`Unsupported file type: ${fileExtension}`);
                    throw new Error(`Unsupported file type: ${fileExtension}`);
            }
            logger.info(`Using parser for file type: ${fileExtension}`);
            return await parser.parse(filePath);
        } catch (error) {
            logger.error('Error in ingestDocument:', error);
            throw error;
        }
    }

    private assembleOutput(processedChunks: Record<string, any>[]): Record<string, any> {
        const assembledData: Record<string, any> = {};
        for (const chunk of processedChunks) {
            for (const [key, value] of Object.entries(chunk)) {
                if (!(key in assembledData)) {
                    assembledData[key] = value;
                } else {
                    // Handle conflicts (e.g., take the value with higher confidence)
                    if (typeof value === 'object' && value !== null && 'confidence' in value) {
                        if (value.confidence > (assembledData[key]?.confidence || 0)) {
                            assembledData[key] = value;
                        }
                    }
                }
            }
        }
        return assembledData;
    }
} 