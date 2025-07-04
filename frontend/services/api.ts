import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import type {
  Project,
  Estimate,
  Proposal,
  System,
  Location,
  AIAnalysis,
  AIAnalysisRequest,
  AIAnalysisResponse,
  AuthRequest,
  RegisterRequest,
  AuthResponse,
  ErrorResponse
} from '@/types/api';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: this.getBaseUrl(),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.api.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error: AxiosError) => Promise.reject(error)
    );

    this.api.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ErrorResponse>) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  getBaseUrl(): string {
    if (typeof window !== 'undefined') {
      // Client-side: use relative URL
      return '/api';
    }
    // Server-side: use environment variable or default
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
  }

  // Auth endpoints
  async login(data: AuthRequest): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>('/auth/login', data);
    return response.data;
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>('/auth/register', data);
    return response.data;
  }

  // Project endpoints
  async getProjects(): Promise<Project[]> {
    const response = await this.api.get<Project[]>('/projects');
    return response.data;
  }

  async getProject(id: string): Promise<Project> {
    const response = await this.api.get<Project>(`/projects/${id}`);
    return response.data;
  }

  async createProject(data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    const response = await this.api.post<Project>('/projects', data);
    return response.data;
  }

  async updateProject(id: string, data: Partial<Project>): Promise<Project> {
    const response = await this.api.patch<Project>(`/projects/${id}`, data);
    return response.data;
  }

  async deleteProject(id: string): Promise<void> {
    await this.api.delete(`/projects/${id}`);
  }

  // Estimate endpoints
  async getEstimates(projectId: string): Promise<Estimate[]> {
    const response = await this.api.get<Estimate[]>(`/projects/${projectId}/estimates`);
    return response.data;
  }

  async getEstimate(id: string): Promise<Estimate> {
    const response = await this.api.get<Estimate>(`/estimates/${id}`);
    return response.data;
  }

  async createEstimate(projectId: string, data: Omit<Estimate, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>): Promise<Estimate> {
    const response = await this.api.post<Estimate>(`/projects/${projectId}/estimates`, data);
    return response.data;
  }

  async updateEstimate(id: string, data: Partial<Estimate>): Promise<Estimate> {
    const response = await this.api.patch<Estimate>(`/estimates/${id}`, data);
    return response.data;
  }

  // Proposal endpoints
  async getProposals(projectId: string): Promise<Proposal[]> {
    const response = await this.api.get<Proposal[]>(`/projects/${projectId}/proposals`);
    return response.data;
  }

  async getProposal(id: string): Promise<Proposal> {
    const response = await this.api.get<Proposal>(`/proposals/${id}`);
    return response.data;
  }

  async createProposal(projectId: string, estimateId: string, data: Omit<Proposal, 'id' | 'projectId' | 'estimateId' | 'createdAt' | 'updatedAt'>): Promise<Proposal> {
    const response = await this.api.post<Proposal>(`/projects/${projectId}/proposals`, { ...data, estimateId });
    return response.data;
  }

  // System endpoints
  async getSystems(): Promise<System[]> {
    const response = await this.api.get<System[]>('/systems');
    return response.data;
  }

  async getSystem(id: string): Promise<System> {
    const response = await this.api.get<System>(`/systems/${id}`);
    return response.data;
  }

  // Location endpoints
  async getLocations(): Promise<Location[]> {
    const response = await this.api.get<Location[]>('/locations');
    return response.data;
  }

  // AI Analysis endpoints
  async analyzeProject(data: AIAnalysisRequest): Promise<AIAnalysisResponse> {
    const response = await this.api.post<AIAnalysisResponse>('/analyze', data);
    return response.data;
  }

  async getAnalysis(projectId: string): Promise<AIAnalysis> {
    const response = await this.api.get<AIAnalysis>(`/projects/${projectId}/analysis`);
    return response.data;
  }
}

export const apiService = new ApiService();

export interface Estimation {
  id: string;
  name: string;
  status: 'draft' | 'in_progress' | 'completed';
  createdAt: string;
  lastModified: string;
}

export interface DashboardStats {
  total: number;
  completed: number;
  inProgress: number;
}

export const estimationApi = {
  // Get all estimations
  getEstimations: async (): Promise<Estimation[]> => {
    try {
      const baseUrl = typeof window !== 'undefined' ? '/api' : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api');
      const response = await axios.get(`${baseUrl}/estimations`);
      return response.data;
    } catch (error) {
      console.error('Error fetching estimations:', error);
      throw error;
    }
  },

  // Get dashboard statistics
  getDashboardStats: async (): Promise<DashboardStats> => {
    try {
      const baseUrl = typeof window !== 'undefined' ? '/api' : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api');
      const response = await axios.get(`${baseUrl}/estimations/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }
}; 