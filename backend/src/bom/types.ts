export interface ProjectParams {
  floor_area: number;
  stories: number;
  occupancy_type: string;
  special_features?: string[];
  overrides?: Record<string, { quantity: number }>;
  location?: {
    zip_code: string;
    state: string;
  };
}

export interface BOMRule {
  per_sqft?: Record<string, number>;
  per_floor?: Record<string, number>;
  min_qty?: Record<string, number>;
  special_features?: Record<string, Record<string, number>>;
}

export interface BOMItem {
  item_code: string;
  quantity: number;
  source: string;
  unit_price?: number;
  lead_time?: number;
  vendor_id?: string;
}

export interface CostBreakdown {
  equipment: {
    subtotal: number;
    markup: number;
    total: number;
  };
  labor: {
    hours: number;
    rate: number;
    total: number;
  };
  permits: {
    fees: number;
    total: number;
  };
  taxes: {
    rate: number;
    amount: number;
  };
  contingency: {
    percentage: number;
    amount: number;
  };
  total: number;
}

export interface Estimate {
  id: string;
  project_params: ProjectParams;
  bom_items: BOMItem[];
  cost_breakdown: CostBreakdown;
  created_at: Date;
  updated_at: Date;
  version: string;
  metadata: {
    rule_version: string;
    connector_versions: Record<string, string>;
  };
} 