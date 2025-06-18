import OpenAI from 'openai';
import { Chunk, ProcessedChunk } from '../types';
import { logger } from '../../../utils/logger';
import { config } from '../../../config/env';
import { encode } from 'gpt-tokenizer';

export class LLMProcessor {
    private openai: OpenAI;
    private model: string;
    private maxTokens: number;
    private temperature: number;
    private maxContextTokens: number;

    constructor() {
        this.openai = new OpenAI({
            apiKey: config.openai.apiKey,
        });
        this.model = config.openai.model;
        this.maxTokens = config.openai.maxTokens;
        this.temperature = config.openai.temperature;
        this.maxContextTokens = 128000; // Maximum context length for the model
    }

    async processChunk(chunk: Chunk): Promise<ProcessedChunk> {
        try {
            const prompt = this.createPrompt(chunk);
            
            // Calculate tokens for system message and prompt
            const systemMessage = 'You are a document analysis assistant. Extract structured information from the provided text.';
            const systemTokens = encode(systemMessage).length;
            const promptTokens = encode(prompt).length;
            
            // Calculate available tokens for response
            const totalInputTokens = systemTokens + promptTokens;
            const availableTokens = this.maxContextTokens - totalInputTokens;
            
            if (availableTokens <= 0) {
                logger.error(`Chunk too large: ${totalInputTokens} tokens. Maximum allowed: ${this.maxContextTokens}`);
                throw new Error('Chunk size exceeds model context limit');
            }

            logger.info(`Processing chunk with ${promptTokens} tokens. Available for response: ${availableTokens} tokens`);
            
            const response = await this.openai.chat.completions.create({
                model: this.model,
                messages: [
                    {
                        role: 'system',
                        content: systemMessage
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: this.temperature,
                max_tokens: Math.min(availableTokens, this.maxTokens),
            });

            const result = response.choices[0]?.message?.content;
            if (!result) {
                throw new Error('No response from OpenAI API');
            }

            return this.parseResponse(result);
        } catch (error) {
            logger.error('Error processing chunk with LLM:', error);
            throw error;
        }
    }

    private createPrompt(chunk: Chunk): string {
        // Ensure chunk content doesn't exceed token limits
        const content = chunk.content.join('\n\n');
        const contentTokens = encode(content).length;
        
        // If content is too large, truncate it
        if (contentTokens > this.maxContextTokens - 1000) { // Leave room for system message and prompt
            logger.warn(`Chunk content too large (${contentTokens} tokens). Truncating...`);
            const truncatedContent = encode(content).slice(0, this.maxContextTokens - 1000).join(' ');
            return `
Please analyze the following text and extract structured information. 
The text is from sections: ${chunk.sections.join(', ')}

Text content:
${truncatedContent}

Please provide the extracted information in the following JSON format:
{
    "extracted_fields": {
        "field_name": {
            "value": "extracted value",
            "confidence": 0.95,
            "source_section": "section_id"
        }
    }
}

Focus on extracting:
1. Key metrics and measurements
2. Important dates and deadlines
3. Project requirements and specifications
4. Cost estimates and budgets
5. Contact information and stakeholders
`;
        }

        return `
Please analyze the following text and extract structured information. 
The text is from sections: ${chunk.sections.join(', ')}

Text content:
${content}

Please provide the extracted information in the following JSON format:
{
    "extracted_fields": {
        "field_name": {
            "value": "extracted value",
            "confidence": 0.95,
            "source_section": "section_id"
        }
    }
}

Focus on extracting:
1. Key metrics and measurements
2. Important dates and deadlines
3. Project requirements and specifications
4. Cost estimates and budgets
5. Contact information and stakeholders
`;
    }

    private parseResponse(response: string): ProcessedChunk {
        try {
            // Try to parse the response as JSON
            const parsed = JSON.parse(response);
            return parsed.extracted_fields || {};
        } catch (error) {
            logger.error('Error parsing LLM response:', error);
            // Return empty object if parsing fails
            return {};
        }
    }
} 