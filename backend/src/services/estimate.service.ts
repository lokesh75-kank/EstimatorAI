import { Estimate } from '../models/estimate.model';

export class EstimateService {
  private estimates: Map<number, Estimate> = new Map();

  async getAll(): Promise<Estimate[]> {
    return Array.from(this.estimates.values());
  }

  async getById(id: number): Promise<Estimate | null> {
    return this.estimates.get(id) || null;
  }

  async create(data: Omit<Estimate, 'id' | 'createdAt' | 'updatedAt'>): Promise<Estimate> {
    const estimate: Estimate = {
      id: this.estimates.size + 1,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.estimates.set(estimate.id, estimate);
    return estimate;
  }

  async update(id: number, data: Partial<Estimate>): Promise<Estimate | null> {
    const estimate = this.estimates.get(id);
    if (!estimate) return null;
    const updatedEstimate = {
      ...estimate,
      ...data,
      updatedAt: new Date(),
    };
    this.estimates.set(id, updatedEstimate);
    return updatedEstimate;
  }

  async delete(id: number): Promise<void> {
    this.estimates.delete(id);
  }
} 