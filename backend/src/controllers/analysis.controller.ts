import { z } from 'zod';
import { OpenAI } from 'openai';
import { AnalysisService } from '../services/analysis.service';
import { AgentService } from '../services/agent.service';
import { Request, Response } from 'express';
import { OpenAIService } from '../services/openai.service';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export class AnalysisController {
  private analysisService: AnalysisService;
  private agentService: AgentService;
  private openAIService: OpenAIService;

  constructor() {
    this.analysisService = new AnalysisService();
    this.agentService = new AgentService();
    this.openAIService = new OpenAIService();
  }

  async getAll(req: Request, res: Response) {
    try {
      const analyses = await this.analysisService.getAll();
      res.json(analyses);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch analyses' });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const analysis = await this.analysisService.getById(parseInt(req.params.id));
      if (!analysis) {
        return res.status(404).json({ error: 'Analysis not found' });
      }
      res.json(analysis);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch analysis' });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const { projectId, fileContent } = req.body;
      const analysis = await this.openAIService.analyzeFile(fileContent);
      if (!analysis.choices[0].message.content) {
        throw new Error('No analysis content received from OpenAI');
      }
      const newAnalysis = await this.analysisService.create({
        projectId,
        analysis: analysis.choices[0].message.content ?? '',
      });
      res.status(201).json(newAnalysis);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create analysis' });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { analysis } = req.body;
      const updatedAnalysis = await this.analysisService.update(parseInt(id), { analysis });
      if (!updatedAnalysis) {
        return res.status(404).json({ error: 'Analysis not found' });
      }
      res.json(updatedAnalysis);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update analysis' });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await this.analysisService.delete(parseInt(id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete analysis' });
    }
  }
} 