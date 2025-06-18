import { Project } from '../models/project.model';
import { DynamoDB } from 'aws-sdk';
import { config } from '../config/env';

export class ProjectService {
  private dynamoDB: DynamoDB.DocumentClient;
  private tableName: string;

  constructor() {
    this.dynamoDB = new DynamoDB.DocumentClient({
      region: config.aws.region,
      endpoint: config.aws.dynamoDB.endpoint,
    });
    this.tableName = config.aws.dynamoDB.table;
  }

  async getAll(): Promise<Project[]> {
    const result = await this.dynamoDB.scan({
      TableName: this.tableName,
    }).promise();
    return result.Items as Project[];
  }

  async getById(id: number): Promise<Project | null> {
    const result = await this.dynamoDB.get({
      TableName: this.tableName,
      Key: { id },
    }).promise();
    return result.Item as Project || null;
  }

  async create(data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    const now = new Date();
    const project: Project = {
      id: Date.now(), // Using timestamp as ID
      ...data,
      createdAt: now,
      updatedAt: now,
    };

    await this.dynamoDB.put({
      TableName: this.tableName,
      Item: project,
    }).promise();

    return project;
  }

  async update(id: number, data: Partial<Project>): Promise<Project | null> {
    const now = new Date();
    const updateData = {
      ...data,
      updatedAt: now,
    };

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
  }

  async delete(id: number): Promise<void> {
    await this.dynamoDB.delete({
      TableName: this.tableName,
      Key: { id },
    }).promise();
  }
} 