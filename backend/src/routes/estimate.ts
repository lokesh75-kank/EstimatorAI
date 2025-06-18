import { Router } from 'express';
import { EstimationService } from '../services/EstimationService';
import { ProjectParams } from '../bom/types';
import { validateProjectParams } from '../middleware/validation';

export function createEstimateRouter(estimationService: EstimationService): Router {
  const router = Router();

  // Generate new estimate
  router.post('/', validateProjectParams, async (req, res) => {
    try {
      const params: ProjectParams = req.body;
      const estimate = await estimationService.generateEstimate(params);
      res.json(estimate);
    } catch (error) {
      console.error('Error generating estimate:', error);
      res.status(500).json({
        error: 'Failed to generate estimate',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get estimate by ID
  router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      // TODO: Implement getEstimateById in EstimationService
      res.status(501).json({ error: 'Not implemented' });
    } catch (error) {
      console.error('Error fetching estimate:', error);
      res.status(500).json({
        error: 'Failed to fetch estimate',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // List estimates
  router.get('/', async (req, res) => {
    try {
      const { page = '1', limit = '10' } = req.query;
      // TODO: Implement listEstimates in EstimationService
      res.status(501).json({ error: 'Not implemented' });
    } catch (error) {
      console.error('Error listing estimates:', error);
      res.status(500).json({
        error: 'Failed to list estimates',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Export estimate
  router.get('/:id/export', async (req, res) => {
    try {
      const { id } = req.params;
      const { format = 'json' } = req.query;
      // TODO: Implement exportEstimate in EstimationService
      res.status(501).json({ error: 'Not implemented' });
    } catch (error) {
      console.error('Error exporting estimate:', error);
      res.status(500).json({
        error: 'Failed to export estimate',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  return router;
} 