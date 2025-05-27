import fs from 'fs/promises';
import { Project } from '../models/project.model';

export class ProjectService {
  private projects: Map<number, Project> = new Map();

  async getAll(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }

  async getById(id: number): Promise<Project | null> {
    return this.projects.get(id) || null;
  }

  async create(data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    const project: Project = {
      id: this.projects.size + 1,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.projects.set(project.id, project);
    return project;
  }

  async update(id: number, data: Partial<Project>): Promise<Project | null> {
    const project = this.projects.get(id);
    if (!project) return null;
    const updatedProject = {
      ...project,
      ...data,
      updatedAt: new Date(),
    };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }

  async delete(id: number): Promise<void> {
    this.projects.delete(id);
  }

  async readFile(filePath: string): Promise<string> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return content;
    } catch (error) {
      throw new Error('Failed to read file');
    }
  }
} 