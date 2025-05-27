/*
import { EstimateService } from '../../services/estimate.service';

describe('EstimateService', () => {
  let estimateService: EstimateService;

  beforeEach(() => {
    estimateService = new EstimateService();
  });

  describe('createEstimate', () => {
    it('should create a new estimate', async () => {
      const estimateData = {
        projectId: 'test-project',
        systemType: 'fire' as const,
        requirements: [
          {
            type: 'Smoke Detector',
            quantity: 10,
            specifications: { model: 'SD-100' },
          },
          {
            type: 'Fire Alarm Panel',
            quantity: 1,
            specifications: { model: 'FAP-200' },
          },
        ],
      };

      const estimate = await estimateService.createEstimate(estimateData);

      expect(estimate).toBeDefined();
      expect(estimate.projectId).toBe(estimateData.projectId);
      expect(estimate.systemType).toBe(estimateData.systemType);
      expect(estimate.requirements).toHaveLength(2);

      // Verify calculated costs
      const smokeDetector = estimate.materials.find(m => m.name === 'Smoke Detector');
      const alarmPanel = estimate.materials.find(m => m.name === 'Fire Alarm Panel');

      expect(smokeDetector).toBeDefined();
      expect(alarmPanel).toBeDefined();
      expect(estimate.totalCost).toBeGreaterThan(0);
      expect(estimate.laborHours).toBeGreaterThan(0);
    });
  });

  describe('getEstimate', () => {
    it('should return undefined for non-existent estimate', async () => {
      const estimate = await estimateService.getEstimate('non-existent-id');
      expect(estimate).toBeUndefined();
    });

    it('should retrieve stored estimate', async () => {
      const estimateData = {
        projectId: 'test-project',
        systemType: 'fire' as const,
        requirements: [
          {
            type: 'Smoke Detector',
            quantity: 5,
          },
        ],
      };

      const createdEstimate = await estimateService.createEstimate(estimateData);
      const retrievedEstimate = await estimateService.getEstimate(createdEstimate.id);

      expect(retrievedEstimate).toBeDefined();
      expect(retrievedEstimate?.id).toBe(createdEstimate.id);
    });
  });

  describe('getProjectEstimates', () => {
    it('should return empty array for non-existent project', async () => {
      const estimates = await estimateService.getProjectEstimates('test-project');
      expect(estimates).toEqual([]);
    });

    it('should retrieve all estimates for a project', async () => {
      const projectId = 'test-project';
      const estimateData1 = {
        projectId,
        systemType: 'fire' as const,
        requirements: [
          {
            type: 'Smoke Detector',
            quantity: 5,
          },
        ],
      };
      const estimateData2 = {
        projectId,
        systemType: 'security' as const,
        requirements: [
          {
            type: 'Camera',
            quantity: 3,
          },
        ],
      };

      const estimate1 = await estimateService.createEstimate(estimateData1);
      const estimate2 = await estimateService.createEstimate(estimateData2);

      const estimates = await estimateService.getProjectEstimates(projectId);
      expect(estimates).toHaveLength(2);
    });
  });
}); 
*/ 