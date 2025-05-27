import { OpenAI } from 'openai';

export class OpenAIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async analyzeFile(fileContent: string) {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
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
      });

      return response;
    } catch (error) {
      throw new Error('Failed to analyze file with OpenAI');
    }
  }
} 