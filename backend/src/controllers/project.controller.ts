import { Request, Response } from 'express';
import { ProjectService } from '../services/project.service';
import { AgentService } from '../services/agent.service';
import { OpenAIService } from '../services/openai.service';

export class ProjectController {
  private projectService: ProjectService;
  private agentService: AgentService;
  private openAIService: OpenAIService;

  constructor() {
    this.projectService = new ProjectService();
    this.agentService = new AgentService();
    this.openAIService = new OpenAIService();
  }

  async getAll(req: Request, res: Response) {
    try {
      const projects = await this.projectService.getAll();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch projects' });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const project = await this.projectService.getById(parseInt(req.params.id));
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch project' });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const { clientName, clientEmail, building } = req.body;
      const project = await this.projectService.create({
        clientName,
        clientEmail,
        building,
        status: 'draft',
      });
      // Analyze the project if file content is provided
      if (req.body.fileContent) {
        const analysis = await this.openAIService.analyzeFile(req.body.fileContent);
        await this.projectService.update(project.id, {
        ...project,
          analysis: analysis.choices[0].message.content ?? '',
        });
      }
      res.status(201).json(project);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create project' });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const updatedProject = await this.projectService.update(parseInt(id), updateData);
      if (!updatedProject) {
        return res.status(404).json({ error: 'Project not found' });
      }
      res.json(updatedProject);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update project' });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await this.projectService.delete(parseInt(id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete project' });
    }
  }
} 