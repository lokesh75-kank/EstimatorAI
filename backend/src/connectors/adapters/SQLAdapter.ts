import { Knex } from 'knex';
import { IDataConnector, FetchParams } from '../interfaces/IDataConnector';
import { ItemRecord, ConnectionDetails } from '../types';

export class SQLAdapter implements IDataConnector {
  private knex: Knex;
  private config: ConnectionDetails;
  private tableName: string;

  constructor(config: ConnectionDetails) {
    this.config = config;
    this.tableName = config.config.tableName || 'inventory';
    
    this.knex = require('knex')({
      client: config.config.client || 'mysql2',
      connection: {
        host: config.config.host,
        port: config.config.port,
        user: config.config.user,
        password: config.config.password,
        database: config.config.database,
      },
      pool: {
        min: 2,
        max: 10
      }
    });
  }

  async connect(): Promise<void> {
    try {
      await this.knex.raw('SELECT 1');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to connect to database: ${errorMessage}`);
    }
  }

  async disconnect(): Promise<void> {
    await this.knex.destroy();
  }

  async heartbeat(): Promise<boolean> {
    try {
      await this.knex.raw('SELECT 1');
      return true;
    } catch {
      return false;
    }
  }

  async fetchInventory(params: FetchParams): Promise<ItemRecord[]> {
    const { filters, limit, offset, sort } = params;
    let query = this.knex(this.tableName);

    // Apply filters
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query = query.where(key, value);
      });
    }

    // Apply sorting
    if (sort) {
      Object.entries(sort).forEach(([key, direction]) => {
        query = query.orderBy(key, direction);
      });
    }

    // Apply pagination
    if (limit) {
      query = query.limit(limit);
    }
    if (offset) {
      query = query.offset(offset);
    }

    const results = await query;
    return this.mapResults(results);
  }

  private mapResults(results: any[]): ItemRecord[] {
    const { field_mapping } = this.config;
    return results.map(row => ({
      item_code: row[field_mapping.codeField || 'item_code'],
      description: row[field_mapping.descriptionField || 'description'],
      unit_price: parseFloat(row[field_mapping.priceField || 'unit_price']),
      lead_time: parseInt(row[field_mapping.leadTimeField || 'lead_time'], 10),
      available_qty: parseInt(row[field_mapping.quantityField || 'available_qty'], 10),
      vendor_id: this.config.vendor_id,
      category: row[field_mapping.categoryField || 'category'],
      specifications: this.extractSpecifications(row),
      last_updated: new Date(row[field_mapping.lastUpdatedField || 'last_updated'])
    }));
  }

  private extractSpecifications(row: any): Record<string, any> {
    const specs: Record<string, any> = {};
    const specFields = Object.entries(this.config.field_mapping)
      .filter(([key]) => key.startsWith('spec_'))
      .map(([key, value]) => ({ key: key.replace('spec_', ''), field: value }));

    specFields.forEach(({ key, field }) => {
      if (row[field]) {
        specs[key] = row[field];
      }
    });

    return specs;
  }
} 