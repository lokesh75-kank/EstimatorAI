export type DataSourceType = 'sql' | 'rest' | 'file';

export type DataSourceStatus = 'active' | 'error' | 'syncing' | 'disabled';

export interface DataSource {
  id: string;
  name: string;
  type: DataSourceType;
  status: DataSourceStatus;
  lastSynced: string | null; // e.g., "2m ago", "1h ago", "Never"
  recordCount: number | null; // number of records in the source
  cacheTTL: number; // cache time-to-live in seconds
  description?: string;
  connectionDetails?: ConnectionDetails;
  fieldMappings?: FieldMapping[];
  syncSettings?: SyncSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConnectionDetails {
  host?: string;
  port?: number;
  database?: string;
  username?: string;
  password?: string;
  ssl?: boolean;
  baseUrl?: string;
  apiKey?: string;
  authType?: 'api_key' | 'oauth2';
  clientId?: string;
  clientSecret?: string;
  fileUrl?: string;
  iamRole?: string;
}

export interface FieldMapping {
  canonicalField: string;
  vendorField: string;
  required: boolean;
  dataType: 'string' | 'number' | 'boolean' | 'date';
  transformation?: string; // optional transformation rule
}

export interface SyncSettings {
  syncType: 'batch' | 'realtime';
  batchSchedule?: string; // cron expression
  cacheTTL: number; // in seconds
  enabled: boolean;
}

export interface DataSourceFormData {
  name: string;
  type: DataSourceType;
  description: string;
  connectionDetails: ConnectionDetails;
  fieldMappings: FieldMapping[];
  syncSettings: SyncSettings;
}

// Legacy types for backward compatibility
export type ConnectionStatus = DataSourceStatus;

export interface TestConnectionResult {
  success: boolean;
  message: string;
  sampleRecords?: any[];
  errors?: string[];
} 