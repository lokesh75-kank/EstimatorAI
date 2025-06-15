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

// Get API URL from environment with validation
const getApiUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    console.warn('NEXT_PUBLIC_API_URL is not set, using default URL');
    return 'http://localhost:3001/api';
  }
  
  // Ensure URL ends with /api
  if (!apiUrl.endsWith('/api')) {
    console.warn('NEXT_PUBLIC_API_URL should end with /api');
    return apiUrl.endsWith('/') ? `${apiUrl}api` : `${apiUrl}/api`;
  }
  
  return apiUrl;
};

const API_BASE_URL = getApiUrl();

// Debug log the API configuration
console.log('API Configuration:', {
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  API_BASE_URL,
});

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Debug log the axios instance configuration
    console.log('Axios Instance Configuration:', {
      baseURL: this.api.defaults.baseURL,
      headers: this.api.defaults.headers,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.api.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // Debug log each request
        console.log('Making request to:', config.url, 'with baseURL:', config.baseURL);
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
        // Debug log response errors
        console.error('API Error:', {
          url: error.config?.url,
          baseURL: error.config?.baseURL,
          status: error.response?.status,
          data: error.response?.data,
        });
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
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
      const response = await axios.get(`${API_BASE_URL}/estimations`);
      return response.data;
    } catch (error) {
      console.error('Error fetching estimations:', error);
      return [];
    }
  },

  // Get dashboard statistics
  getDashboardStats: async (): Promise<DashboardStats> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/estimations/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {
        total: 0,
        completed: 0,
        inProgress: 0
      };
    }
  }
}; 