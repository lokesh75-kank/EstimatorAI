export interface ItemRecord {
  item_code: string;
  description: string;
  unit_price: number;
  lead_time: number;
  available_qty: number;
  vendor_id: string;
  category?: string;
  specifications?: Record<string, any>;
  last_updated: Date;
}

export interface ConnectionDetails {
  type: 'sql' | 'nosql' | 'rest' | 'file';
  config: Record<string, any>;
  field_mapping: Record<string, string>;
  vendor_id: string;
  vendor_name: string;
  sync_settings: {
    batch_size: number;
    sync_interval: number;
    last_sync?: Date;
  };
}

export interface SyncResult {
  success: boolean;
  record_count: number;
  error?: string;
  duration_ms: number;
  timestamp: Date;
} 