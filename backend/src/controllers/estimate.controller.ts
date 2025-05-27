import { Request, Response } from 'express';
import { EstimateService } from '../services/estimate.service';
import { AgentService } from '../services/agent.service';
import { Estimate } from '../models/estimate.model';

export class EstimateController {
  private estimateService: EstimateService;
  private agentService: AgentService;

  constructor() {
    this.estimateService = new EstimateService();
    this.agentService = new AgentService();
  }

  async getAll(req: Request, res: Response) {
    try {
      const estimates = await this.estimateService.getAll();
      res.json(estimates);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch estimates' });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const estimate = await this.estimateService.getById(parseInt(req.params.id));
      if (!estimate) {
        return res.status(404).json({ error: 'Estimate not found' });
      }
      res.json(estimate);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch estimate' });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const { projectId, systems, materials, labor, equipment } = req.body;
      const estimate = await this.estimateService.create({
        projectId,
        systems,
        materials,
        labor,
        equipment,
      });

      // If agentEstimateId exists in the request, get the agent's estimate
      if (req.body.agentEstimateId) {
        const agentEstimate = await this.agentService.getProject(req.body.agentEstimateId);
        if (agentEstimate) {
          // Update the estimate with agent's data
          await this.estimateService.update(estimate.id, {
          ...estimate,
            agentEstimateId: req.body.agentEstimateId,
          });
        }
      }

      res.status(201).json(estimate);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create estimate' });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const updatedEstimate = await this.estimateService.update(parseInt(id), updateData);
      if (!updatedEstimate) {
        return res.status(404).json({ error: 'Estimate not found' });
      }
      res.json(updatedEstimate);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update estimate' });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await this.estimateService.delete(parseInt(id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete estimate' });
    }
  }
} 