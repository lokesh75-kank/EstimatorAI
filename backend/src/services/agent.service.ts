import axios from 'axios';
import { z } from 'zod';

const agentApiUrl = process.env.AGENT_API_URL || 'http://localhost:8000';
const agentApiKey = process.env.AGENT_API_KEY;

const agentClient = axios.create({
  baseURL: agentApiUrl,
  headers: {
    'X-API-Key': agentApiKey,
    'Content-Type': 'application/json',
  },
});

export class AgentService {
  async createProject(data: {
    projectName: string;
    clientName: string;
    clientEmail: string;
    clientPhone: string;
    buildingType: string;
    buildingSize: string;
    location: Record<string, any>;
    requirements: Record<string, any>;
  }) {
    const response = await agentClient.post('/projects', data);
    return response.data;
  }

  async analyzeProject(projectId: string, options?: {
    promptTemplate?: string;
    templateType?: string;
  }) {
    const response = await agentClient.post(`/projects/${projectId}/analyze`, options);
    return response.data;
  }

  async createEstimate(data: {
    project_id: string;
    client_name: string;
    project_name: string;
    location: Record<string, any>;
    drawings?: Record<string, any>;
    specifications?: Record<string, any>;
  }) {
    const response = await agentClient.post('/estimate', data);
    return response.data;
  }

  async generateProposal(projectId: string) {
    const response = await agentClient.post(`/projects/${projectId}/proposal`);
    return response.data;
  }

  async finalizeProject(projectId: string, data: {
    reviewStatus: Record<string, string>;
    reviewNotes: Record<string, string>;
  }) {
    const response = await agentClient.post(`/projects/${projectId}/finalize`, data);
    return response.data;
  }

  async getProject(projectId: string) {
    const response = await agentClient.get(`/projects/${projectId}`);
    return response.data;
  }

  async listProjects() {
    const response = await agentClient.get('/projects');
    return response.data;
  }

  async getProjectMessages(projectId: string) {
    const response = await agentClient.get(`/projects/${projectId}/messages`);
    return response.data;
  }

  async addProjectMessage(projectId: string, message: {
    role: string;
    content: string;
    metadata?: Record<string, any>;
  }) {
    const response = await agentClient.post(`/projects/${projectId}/messages`, message);
    return response.data;
  }
} 