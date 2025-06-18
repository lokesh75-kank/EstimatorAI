import { ItemRecord } from '../types';

export interface FetchParams {
  filters?: Record<string, any>;
  limit?: number;
  offset?: number;
  sort?: Record<string, 'asc' | 'desc'>;
}

export interface IDataConnector {
  connect(): Promise<void>;
  fetchInventory(params: FetchParams): Promise<ItemRecord[]>;
  heartbeat(): Promise<boolean>;
  disconnect(): Promise<void>;
} 