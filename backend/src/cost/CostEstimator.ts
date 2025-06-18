import { BOMItem, CostBreakdown, ProjectParams } from '../bom/types';
import { ItemRecord } from '../connectors/types';

export class CostEstimator {
  private laborRates: Record<string, number>;
  private permitFees: Record<string, number>;
  private taxRates: Record<string, number>;
  private markupRates: {
    equipment: number;
    labor: number;
  };
  private contingencyRate: number;

  constructor(
    laborRates: Record<string, number>,
    permitFees: Record<string, number>,
    taxRates: Record<string, number>,
    markupRates: { equipment: number; labor: number },
    contingencyRate: number
  ) {
    this.laborRates = laborRates;
    this.permitFees = permitFees;
    this.taxRates = taxRates;
    this.markupRates = markupRates;
    this.contingencyRate = contingencyRate;
  }

  async calculateCosts(
    bomItems: BOMItem[],
    inventory: Record<string, ItemRecord>,
    params: ProjectParams
  ): Promise<CostBreakdown> {
    // Calculate equipment costs
    const equipmentSubtotal = this.calculateEquipmentCost(bomItems, inventory);
    const equipmentMarkup = equipmentSubtotal * this.markupRates.equipment;
    const equipmentTotal = equipmentSubtotal + equipmentMarkup;

    // Calculate labor costs
    const laborHours = this.calculateLaborHours(bomItems);
    const laborRate = this.getLaborRate(params.location?.zip_code);
    const laborTotal = laborHours * laborRate;
    const laborMarkup = laborTotal * this.markupRates.labor;
    const laborWithMarkup = laborTotal + laborMarkup;

    // Calculate permit fees
    const permitFees = this.calculatePermitFees(params.location?.state);

    // Calculate taxes
    const taxRate = this.getTaxRate(params.location?.state);
    const taxableAmount = equipmentTotal + laborWithMarkup + permitFees;
    const taxAmount = taxableAmount * taxRate;

    // Calculate contingency
    const subtotal = equipmentTotal + laborWithMarkup + permitFees;
    const contingency = subtotal * this.contingencyRate;

    // Calculate total
    const total = subtotal + taxAmount + contingency;

    return {
      equipment: {
        subtotal: equipmentSubtotal,
        markup: equipmentMarkup,
        total: equipmentTotal
      },
      labor: {
        hours: laborHours,
        rate: laborRate,
        total: laborWithMarkup
      },
      permits: {
        fees: permitFees,
        total: permitFees
      },
      taxes: {
        rate: taxRate,
        amount: taxAmount
      },
      contingency: {
        percentage: this.contingencyRate,
        amount: contingency
      },
      total
    };
  }

  private calculateEquipmentCost(
    bomItems: BOMItem[],
    inventory: Record<string, ItemRecord>
  ): number {
    return bomItems.reduce((total, item) => {
      const inventoryItem = inventory[item.item_code];
      if (!inventoryItem) {
        throw new Error(`Item not found in inventory: ${item.item_code}`);
      }
      return total + item.quantity * inventoryItem.unit_price;
    }, 0);
  }

  private calculateLaborHours(bomItems: BOMItem[]): number {
    return bomItems.reduce((total, item) => {
      const laborRate = this.laborRates[item.item_code] || 0;
      return total + item.quantity * laborRate;
    }, 0);
  }

  private getLaborRate(zipCode?: string): number {
    if (!zipCode) return this.laborRates['default'] || 0;
    return this.laborRates[zipCode] || this.laborRates['default'] || 0;
  }

  private calculatePermitFees(state?: string): number {
    if (!state) return 0;
    return this.permitFees[state] || 0;
  }

  private getTaxRate(state?: string): number {
    if (!state) return 0;
    return this.taxRates[state] || 0;
  }
} 