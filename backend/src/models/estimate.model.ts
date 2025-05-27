export interface Estimate {
  id: number;
  projectId: number;
  systems: {
    type: string;
    quantity: number;
    specifications?: Record<string, any>;
  }[];
  materials: {
    name: string;
    quantity: number;
    unit: string;
    cost: number;
  }[];
  labor: {
    type: string;
    hours: number;
    rate: number;
  }[];
  equipment: {
    name: string;
    duration: number;
    rate: number;
  }[];
  agentEstimateId?: string;
  createdAt: Date;
  updatedAt: Date;
} 