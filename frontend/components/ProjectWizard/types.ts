export interface ProjectFormData {
  projectName: string;
  projectDescription: string;
  buildingType: string;
  squareFootage: number;
  numberOfFloors: number;
  numberOfZones: number;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  projectLocation: string;
  estimatedStartDate: string;
  estimatedEndDate: string;
  budget: number;
  priority: 'low' | 'medium' | 'high';
  uploadedFiles?: Array<{
    id: string;
    name: string;
    size: number;
    type: string;
    url: string;
    status: 'uploading' | 'success' | 'error';
    error?: string;
  }>;
  aiAnalysis?: {
    estimationElements: any[];
    vendors: any[];
    materials: any[];
    recommendations: any[];
    projectDetails: any;
  };
} 