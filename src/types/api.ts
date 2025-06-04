export interface Project {
  id: string;
  projectName: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  buildingType: string;
  buildingSize: string;
  location: Record<string, any>;
  requirements: Record<string, any>;
  status: 'draft' | 'estimation_in_progress' | 'analyzed' | 'proposal_sent' | 'negotiation' | 'won' | 'lost';
  estimate?: Record<string, any>;
  proposal?: Record<string, any>;
  messages: Array<Record<string, any>>;
  history: Array<Record<string, any>>;
  metadata: Record<string, any>;
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