import axios, { AxiosInstance } from 'axios';
import { BOMItem } from '@/components/estimates/BOMTable';
import { CostBreakdownData } from '@/components/estimates/CostBreakdown';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface ProjectParams {
  projectName: string;
  buildingType: string;
  squareFootage: number;
  numberOfFloors: number;
  numberOfZones: number;
  location?: {
    state?: string;
    zip_code?: string;
  };
  special_features?: string[];
  overrides?: Record<string, { quantity: number }>;
}

export interface EstimationRequest {
  projectParams: ProjectParams;
}

export interface EstimationResponse {
  bomItems: BOMItem[];
  costBreakdown: CostBreakdownData;
  projectId: string;
  estimateId: string;
  warnings: string[];
  metadata: {
    generatedAt: string;
    ruleVersion: string;
    connectorVersion: string;
  };
}

export interface EstimationError {
  error: string;
  message: string;
  details?: any;
}

class EstimationService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for authentication
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Generate a new estimation
   */
  async generateEstimation(request: EstimationRequest): Promise<EstimationResponse> {
    try {
      const response = await this.api.post<EstimationResponse>('/estimations/generate', request);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error, 'Failed to generate estimation');
    }
  }

  /**
   * Get an existing estimation by ID
   */
  async getEstimation(estimateId: string): Promise<EstimationResponse> {
    try {
      const response = await this.api.get<EstimationResponse>(`/estimations/${estimateId}`);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error, 'Failed to fetch estimation');
    }
  }

  /**
   * Update an estimation (e.g., with user overrides)
   */
  async updateEstimation(estimateId: string, updates: Partial<EstimationRequest>): Promise<EstimationResponse> {
    try {
      const response = await this.api.patch<EstimationResponse>(`/estimations/${estimateId}`, updates);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error, 'Failed to update estimation');
    }
  }

  /**
   * Get available inventory items
   */
  async getInventoryItems(filters?: Record<string, any>): Promise<any[]> {
    try {
      const response = await this.api.get('/inventory', { params: filters });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error, 'Failed to fetch inventory items');
    }
  }

  /**
   * Get estimation history for a project
   */
  async getEstimationHistory(projectId: string): Promise<EstimationResponse[]> {
    try {
      const response = await this.api.get<EstimationResponse[]>(`/projects/${projectId}/estimations`);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error, 'Failed to fetch estimation history');
    }
  }

  /**
   * Export estimation to PDF
   */
  async exportToPDF(estimateId: string): Promise<Blob> {
    try {
      const response = await this.api.get(`/estimations/${estimateId}/export/pdf`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error, 'Failed to export PDF');
    }
  }

  /**
   * Export estimation to CSV
   */
  async exportToCSV(estimateId: string): Promise<Blob> {
    try {
      const response = await this.api.get(`/estimations/${estimateId}/export/csv`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error, 'Failed to export CSV');
    }
  }

  /**
   * Validate project parameters before estimation
   */
  async validateProjectParams(params: ProjectParams): Promise<{ isValid: boolean; errors: string[] }> {
    try {
      const response = await this.api.post('/estimations/validate', { projectParams: params });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error, 'Failed to validate project parameters');
    }
  }

  /**
   * Get available building types and their rules
   */
  async getBuildingTypes(): Promise<Array<{ type: string; description: string; rules: any }>> {
    try {
      const response = await this.api.get('/estimations/building-types');
      return response.data;
    } catch (error: any) {
      throw this.handleError(error, 'Failed to fetch building types');
    }
  }

  /**
   * Get labor rates for different regions
   */
  async getLaborRates(zipCode?: string): Promise<Record<string, number>> {
    try {
      const response = await this.api.get('/estimations/labor-rates', {
        params: { zip_code: zipCode }
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error, 'Failed to fetch labor rates');
    }
  }

  /**
   * Get tax rates for different states
   */
  async getTaxRates(state?: string): Promise<Record<string, number>> {
    try {
      const response = await this.api.get('/estimations/tax-rates', {
        params: { state }
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error, 'Failed to fetch tax rates');
    }
  }

  /**
   * Handle API errors consistently
   */
  private handleError(error: any, defaultMessage: string): EstimationError {
    if (error.response?.data) {
      return {
        error: error.response.data.error || 'API Error',
        message: error.response.data.message || defaultMessage,
        details: error.response.data.details,
      };
    }

    if (error.request) {
      return {
        error: 'Network Error',
        message: 'Unable to connect to the server. Please check your internet connection.',
      };
    }

    return {
      error: 'Unknown Error',
      message: defaultMessage,
      details: error.message,
    };
  }
}

export const estimationService = new EstimationService(); 