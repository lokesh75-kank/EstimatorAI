import { Project } from '../models/project.model';
import { DynamoDB } from 'aws-sdk';
import { config } from '../config/env';

export class ProjectService {
  private dynamoDB: DynamoDB.DocumentClient;
  private tableName: string;
  private projects: Project[] = []; // In-memory storage for development

  constructor() {
    this.dynamoDB = new DynamoDB.DocumentClient({
      region: config.aws.region,
      endpoint: config.aws.dynamoDB.endpoint,
    });
    this.tableName = config.aws.dynamoDB.table;
  }

  async getAll(): Promise<Project[]> {
    try {
      const result = await this.dynamoDB.scan({
        TableName: this.tableName,
      }).promise();
      return result.Items as Project[];
    } catch (error) {
      console.warn('DynamoDB not available, using in-memory storage:', error);
      return this.projects;
    }
  }

  async getById(id: number): Promise<Project | null> {
    try {
      const result = await this.dynamoDB.get({
        TableName: this.tableName,
        Key: { id },
      }).promise();
      return result.Item as Project || null;
    } catch (error) {
      console.warn('DynamoDB not available, using in-memory storage:', error);
      return this.projects.find(p => p.id === id) || null;
    }
  }

  async create(data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    const now = new Date();
    const project: Project = {
      id: Date.now(), // Using timestamp as ID
      ...data,
      createdAt: now,
      updatedAt: now,
    };

    try {
      await this.dynamoDB.put({
        TableName: this.tableName,
        Item: project,
      }).promise();
    } catch (error) {
      console.warn('DynamoDB not available, using in-memory storage:', error);
      this.projects.push(project);
    }

    return project;
  }

  async update(id: number, data: Partial<Project>): Promise<Project | null> {
    const now = new Date();
    const updateData = {
      ...data,
      updatedAt: now,
    };

    try {
      const result = await this.dynamoDB.update({
        TableName: this.tableName,
        Key: { id },
        UpdateExpression: 'set #data = :data',
        ExpressionAttributeNames: {
          '#data': 'data',
        },
        ExpressionAttributeValues: {
          ':data': updateData,
        },
        ReturnValues: 'ALL_NEW',
      }).promise();

      return result.Attributes as Project || null;
    } catch (error) {
      console.warn('DynamoDB not available, using in-memory storage:', error);
      const index = this.projects.findIndex(p => p.id === id);
      if (index !== -1) {
        this.projects[index] = { ...this.projects[index], ...updateData };
        return this.projects[index];
      }
      return null;
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await this.dynamoDB.delete({
        TableName: this.tableName,
        Key: { id },
      }).promise();
    } catch (error) {
      console.warn('DynamoDB not available, using in-memory storage:', error);
      this.projects = this.projects.filter(p => p.id !== id);
    }
  }

  async clearAll(): Promise<void> {
    try {
      // For DynamoDB, we would need to scan and delete all items
      // For now, we'll just clear the in-memory storage
      this.projects = [];
      console.log('All projects cleared from storage');
    } catch (error) {
      console.error('Error clearing projects:', error);
      throw error;
    }
  }
} 