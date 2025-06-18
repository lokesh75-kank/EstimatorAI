import { OpenAI } from 'openai';
import { config } from '../config/env';

export class OpenAIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: config.openai.apiKey,
    });
  }

  async analyzeFile(fileContent: string) {
    try {
      const response = await this.openai.chat.completions.create({
        model: config.openai.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert construction estimator. Analyze the provided file content and provide detailed insights about the project requirements, potential challenges, and recommendations.',
          },
          {
            role: 'user',
            content: fileContent,
          },
        ],
        max_tokens: config.openai.maxTokens,
        temperature: config.openai.temperature,
      });

      return response;
    } catch (error) {
      throw new Error('Failed to analyze file with OpenAI');
    }
  }
} 