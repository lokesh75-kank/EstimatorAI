/*
import { AnalysisService } from '../../services/analysis.service';

describe('AnalysisService', () => {
  let analysisService: AnalysisService;

  beforeEach(() => {
    analysisService = new AnalysisService();
  });

  describe('storeAnalysis', () => {
    it('should store analysis data', async () => {
      const analysisData = {
        projectId: 'test-project',
        type: 'fire' as const,
        documents: ['doc1', 'doc2'],
        analysis: 'Test analysis',
      };

      const analysis = await analysisService.storeAnalysis(analysisData);

      expect(analysis).toBeDefined();
      expect(analysis.projectId).toBe(analysisData.projectId);
      expect(analysis.type).toBe(analysisData.type);
      expect(analysis.documents).toEqual(analysisData.documents);
      expect(analysis.analysis).toBe(analysisData.analysis);
    });
  });

  describe('getAnalysis', () => {
    it('should return undefined for non-existent analysis', async () => {
      const analysis = await analysisService.getAnalysis('non-existent-id');
      expect(analysis).toBeUndefined();
    });

    it('should retrieve stored analysis', async () => {
      const analysisData = {
        projectId: 'test-project',
        type: 'fire' as const,
        documents: ['doc1'],
        analysis: 'Test analysis',
      };

      const createdAnalysis = await analysisService.storeAnalysis(analysisData);
      const retrievedAnalysis = await analysisService.getAnalysis(createdAnalysis.id);

      expect(retrievedAnalysis).toBeDefined();
      expect(retrievedAnalysis?.id).toBe(createdAnalysis.id);
    });
  });

  describe('getProjectAnalyses', () => {
    it('should return empty array for non-existent project', async () => {
      const analyses = await analysisService.getProjectAnalyses('test-project');
      expect(analyses).toEqual([]);
    });

    it('should retrieve all analyses for a project', async () => {
      const projectId = 'test-project';
      const analysisData1 = {
        projectId,
        type: 'fire' as const,
        documents: ['doc1'],
        analysis: 'Analysis 1',
      };
      const analysisData2 = {
        projectId,
        type: 'security' as const,
        documents: ['doc2'],
        analysis: 'Analysis 2',
      };

      const analysis1 = await analysisService.storeAnalysis(analysisData1);
      const analysis2 = await analysisService.storeAnalysis(analysisData2);

      const analyses = await analysisService.getProjectAnalyses(projectId);
      expect(analyses).toHaveLength(2);
    });
  });

  describe('storeDocument', () => {
    it('should store document content', async () => {
      const content = 'Test document content';
      const documentId = await analysisService.storeDocument(content);
      expect(documentId).toBeDefined();
    });
  });

  describe('getDocument', () => {
    it('should throw error for non-existent document', async () => {
      await expect(analysisService.getDocument('non-existent-id')).rejects.toThrow('Document not found');
    });

    it('should retrieve stored document', async () => {
      const content = 'Test document content';
      const documentId = await analysisService.storeDocument(content);
      const retrievedContent = await analysisService.getDocument(documentId);
      expect(retrievedContent).toBe(content);
    });
  });
}); 
*/ 