export interface Project {
  id: string;
  clientName: string;
  clientEmail: string;
  building: {
    type: string;
    size: number;
    floors: number;
    zones: number;
  };
  status: 'draft' | 'in_progress' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface Estimate {
  id: string;
  projectId: string;
  totalCost: number;
  breakdown: {
    category: string;
    cost: number;
  }[];
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface Proposal {
  id: string;
  projectId: string;
  estimateId: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface System {
  id: string;
  name: string;
  description: string;
  category: string;
  baseCost: number;
  specifications: Record<string, string>;
}

export interface Location {
  id: string;
  name: string;
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export interface SystemRequirements {
  systemId: string;
  quantity: number;
  specifications: Record<string, string>;
}

export interface AIAnalysis {
  id: string;
  projectId: string;
  content: string;
  recommendations: string[];
  createdAt: string;
}

export interface AIAnalysisRequest {
  projectId: string;
  fileContent?: string;
}

export interface AIAnalysisResponse {
  analysis: AIAnalysis;
  error?: string;
}

export interface AuthRequest {
  email: string;
  password: string;
}

export interface RegisterRequest extends AuthRequest {
  name: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface ErrorResponse {
  error: string;
  message?: string;
  statusCode: number;
} 