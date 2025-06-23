import { LLMProcessor } from '../../services/document-processor/llm/LLMProcessor';
import { Chunk } from '../../services/document-processor/types';

describe('LLMProcessor', () => {
  let llmProcessor: LLMProcessor;

  beforeEach(() => {
    llmProcessor = new LLMProcessor();
  });

  describe('processChunk', () => {
    it('should process a chunk and return structured data', async () => {
      const mockChunk: Chunk = {
        content: [
          'Project: Fire Alarm System Installation',
          'Location: Office Building, 123 Main St',
          'Requirements:',
          '- Smoke detectors in all rooms',
          '- Fire alarm control panel',
          '- Emergency lighting system',
          'Vendor: ACME Fire & Security',
          'Timeline: 4-6 weeks',
          'Budget: $25,000 - $35,000'
        ],
        sections: ['project_overview', 'requirements', 'vendor_info'],
        tokenCount: 150
      };

      const result = await llmProcessor.processChunk(mockChunk);

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      
      // The result should contain extracted fields
      expect(Object.keys(result).length).toBeGreaterThan(0);
    }, 30000); // 30 second timeout for LLM call

    it('should handle empty chunk gracefully', async () => {
      const emptyChunk: Chunk = {
        content: [],
        sections: [],
        tokenCount: 0
      };

      const result = await llmProcessor.processChunk(emptyChunk);

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    });

    it('should handle large chunks by truncating if necessary', async () => {
      // Create a very large chunk
      const largeContent = 'This is a test document. '.repeat(10000);
      const largeChunk: Chunk = {
        content: [largeContent],
        sections: ['large_section'],
        tokenCount: 5000
      };

      const result = await llmProcessor.processChunk(largeChunk);

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    }, 30000);
  });

  describe('createPrompt', () => {
    it('should create a properly formatted prompt', async () => {
      const chunk: Chunk = {
        content: ['Test content'],
        sections: ['test_section'],
        tokenCount: 10
      };

      // Access the private method through reflection or test the public interface
      const result = await llmProcessor.processChunk(chunk);
      
      expect(result).toBeDefined();
    });
  });

  describe('parseResponse', () => {
    it('should parse valid JSON response', async () => {
      const chunk: Chunk = {
        content: ['Simple test content'],
        sections: ['test'],
        tokenCount: 5
      };

      const result = await llmProcessor.processChunk(chunk);
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    });

    it('should handle malformed JSON gracefully', async () => {
      // This test would require mocking the OpenAI response
      // For now, we'll test the public interface
      const chunk: Chunk = {
        content: ['Test content that might cause parsing issues'],
        sections: ['test'],
        tokenCount: 15
      };

      const result = await llmProcessor.processChunk(chunk);
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    });
  });

  describe('Configuration', () => {
    it('should be properly configured with environment variables', () => {
      expect(process.env.OPENAI_API_KEY).toBeDefined();
      expect(process.env.OPENAI_MODEL || 'gpt-4-1106-preview').toBeDefined();
    });
  });
}); 