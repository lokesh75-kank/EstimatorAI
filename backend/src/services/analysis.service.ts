import { Analysis } from '../models/analysis.model';

export class AnalysisService {
  private analyses: Map<number, Analysis> = new Map();
  private nextId = 1;

  async getAll(): Promise<Analysis[]> {
    return Array.from(this.analyses.values());
  }

  async getById(id: number): Promise<Analysis | null> {
    return this.analyses.get(id) || null;
  }

  async create(data: Omit<Analysis, 'id' | 'createdAt' | 'updatedAt'>): Promise<Analysis> {
    const analysis: Analysis = {
      id: this.nextId++,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.analyses.set(analysis.id, analysis);
    return analysis;
  }

  async update(id: number, data: Partial<Analysis>): Promise<Analysis | null> {
    const analysis = this.analyses.get(id);
    if (!analysis) return null;
    const updatedAnalysis = {
      ...analysis,
      ...data,
      updatedAt: new Date(),
    };
    this.analyses.set(id, updatedAnalysis);
    return updatedAnalysis;
  }

  async delete(id: number): Promise<void> {
    this.analyses.delete(id);
  }
} 