import { v4 as uuidv4 } from 'uuid';
import { RulesEngine } from '../bom/RulesEngine';
import { CostEstimator } from '../cost/CostEstimator';
import { ProjectParams, Estimate, BOMItem } from '../bom/types';
import { IDataConnector } from '../connectors/interfaces/IDataConnector';
import { ItemRecord } from '../connectors/types';

export class EstimationService {
  private rulesEngine: RulesEngine;
  private costEstimator: CostEstimator;
  private connectors: Map<string, IDataConnector>;
  private version: string;

  constructor(
    rulesEngine: RulesEngine,
    costEstimator: CostEstimator,
    connectors: Map<string, IDataConnector>,
    version: string
  ) {
    this.rulesEngine = rulesEngine;
    this.costEstimator = costEstimator;
    this.connectors = connectors;
    this.version = version;
  }

  async generateEstimate(params: ProjectParams): Promise<Estimate> {
    // Generate BOM items
    const bomItems = await this.rulesEngine.generateBOM(params);

    // Fetch inventory data from all connectors
    const inventory = await this.fetchInventoryData(bomItems);

    // Calculate costs
    const costBreakdown = await this.costEstimator.calculateCosts(
      bomItems,
      inventory,
      params
    );

    // Create estimate
    const estimate: Estimate = {
      id: uuidv4(),
      project_params: params,
      bom_items: this.enrichBomItems(bomItems, inventory),
      cost_breakdown: costBreakdown,
      created_at: new Date(),
      updated_at: new Date(),
      version: this.version,
      metadata: {
        rule_version: this.version,
        connector_versions: this.getConnectorVersions()
      }
    };

    return estimate;
  }

  private async fetchInventoryData(bomItems: BOMItem[]): Promise<Record<string, ItemRecord>> {
    const inventory: Record<string, ItemRecord> = {};
    const itemCodes = Array.from(new Set(bomItems.map(item => item.item_code)));

    for (const [vendorId, connector] of Array.from(this.connectors.entries())) {
      try {
        const items = await connector.fetchInventory({
          filters: { item_code: { $in: itemCodes } }
        });

        items.forEach((item: ItemRecord) => {
          inventory[item.item_code] = item;
        });
      } catch (error) {
        console.error(`Failed to fetch inventory from ${vendorId}:`, error);
      }
    }

    return inventory;
  }

  private enrichBomItems(
    bomItems: BOMItem[],
    inventory: Record<string, ItemRecord>
  ): BOMItem[] {
    return bomItems.map(item => {
      const inventoryItem = inventory[item.item_code];
      if (inventoryItem) {
        return {
          ...item,
          unit_price: inventoryItem.unit_price,
          lead_time: inventoryItem.lead_time,
          vendor_id: inventoryItem.vendor_id
        };
      }
      return item;
    });
  }

  private getConnectorVersions(): Record<string, string> {
    const versions: Record<string, string> = {};
    Array.from(this.connectors.entries()).forEach(([vendorId]) => {
      versions[vendorId] = this.version; // In a real implementation, get actual connector versions
    });
    return versions;
  }
} 