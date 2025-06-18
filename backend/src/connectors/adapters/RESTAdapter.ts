import axios, { AxiosInstance, AxiosError } from 'axios';
import { IDataConnector, FetchParams } from '../interfaces/IDataConnector';
import { ItemRecord, ConnectionDetails } from '../types';

export class RESTAdapter implements IDataConnector {
  private client: AxiosInstance;
  private config: ConnectionDetails;

  constructor(config: ConnectionDetails) {
    this.config = config;
    this.client = axios.create({
      baseURL: config.config.baseUrl,
      timeout: config.config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders()
      }
    });
  }

  private getAuthHeaders(): Record<string, string> {
    const { auth } = this.config.config;
    if (!auth) return {};

    switch (auth.type) {
      case 'apiKey':
        return { [auth.headerName || 'X-API-Key']: auth.apiKey };
      case 'bearer':
        return { Authorization: `Bearer ${auth.token}` };
      case 'basic':
        return { Authorization: `Basic ${Buffer.from(`${auth.username}:${auth.password}`).toString('base64')}` };
      default:
        return {};
    }
  }

  async connect(): Promise<void> {
    try {
      await this.client.get(this.config.config.healthEndpoint || '/health');
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(`Failed to connect to API: ${error.message}`);
      }
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to connect to API: ${errorMessage}`);
    }
  }

  async disconnect(): Promise<void> {
    // No cleanup needed for REST client
  }

  async heartbeat(): Promise<boolean> {
    try {
      await this.client.get(this.config.config.healthEndpoint || '/health');
      return true;
    } catch {
      return false;
    }
  }

  async fetchInventory(params: FetchParams): Promise<ItemRecord[]> {
    const { filters, limit, offset, sort } = params;
    const queryParams = new URLSearchParams();

    // Add filters to query params
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        queryParams.append(key, String(value));
      });
    }

    // Add pagination
    if (limit) queryParams.append('limit', String(limit));
    if (offset) queryParams.append('offset', String(offset));

    // Add sorting
    if (sort) {
      const sortString = Object.entries(sort)
        .map(([key, direction]) => `${key}:${direction}`)
        .join(',');
      queryParams.append('sort', sortString);
    }

    const response = await this.client.get(
      this.config.config.inventoryEndpoint || '/inventory',
      { params: queryParams }
    );

    return this.mapResults(response.data);
  }

  private mapResults(results: any[]): ItemRecord[] {
    const { field_mapping } = this.config;
    return results.map(item => ({
      item_code: item[field_mapping.codeField || 'item_code'],
      description: item[field_mapping.descriptionField || 'description'],
      unit_price: parseFloat(item[field_mapping.priceField || 'unit_price']),
      lead_time: parseInt(item[field_mapping.leadTimeField || 'lead_time'], 10),
      available_qty: parseInt(item[field_mapping.quantityField || 'available_qty'], 10),
      vendor_id: this.config.vendor_id,
      category: item[field_mapping.categoryField || 'category'],
      specifications: this.extractSpecifications(item),
      last_updated: new Date(item[field_mapping.lastUpdatedField || 'last_updated'])
    }));
  }

  private extractSpecifications(item: any): Record<string, any> {
    const specs: Record<string, any> = {};
    const specFields = Object.entries(this.config.field_mapping)
      .filter(([key]) => key.startsWith('spec_'))
      .map(([key, value]) => ({ key: key.replace('spec_', ''), field: value }));

    specFields.forEach(({ key, field }) => {
      if (item[field]) {
        specs[key] = item[field];
      }
    });

    return specs;
  }
} 