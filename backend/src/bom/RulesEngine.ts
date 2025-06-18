import { ProjectParams, BOMRule, BOMItem } from './types';
import { OpenAI } from 'openai';

export class RulesEngine {
  private rules: Record<string, BOMRule>;
  private openai: OpenAI;

  constructor(rules: Record<string, BOMRule>, openaiApiKey: string) {
    this.rules = rules;
    this.openai = new OpenAI({ apiKey: openaiApiKey });
  }

  async generateBOM(params: ProjectParams): Promise<BOMItem[]> {
    const rule = this.rules[params.occupancy_type];
    if (!rule) {
      return this.generateBOMForUnknownType(params);
    }

    const bomItems: BOMItem[] = [];

    // Apply per square foot rules
    if (rule.per_sqft) {
      Object.entries(rule.per_sqft).forEach(([itemCode, ratio]) => {
        const quantity = Math.ceil(params.floor_area * ratio);
        bomItems.push({
          item_code: itemCode,
          quantity,
          source: 'per_sqft_rule'
        });
      });
    }

    // Apply per floor rules
    if (rule.per_floor) {
      Object.entries(rule.per_floor).forEach(([itemCode, count]) => {
        const quantity = params.stories * count;
        bomItems.push({
          item_code: itemCode,
          quantity,
          source: 'per_floor_rule'
        });
      });
    }

    // Apply minimum quantity rules
    if (rule.min_qty) {
      Object.entries(rule.min_qty).forEach(([itemCode, minQty]) => {
        const existingItem = bomItems.find(item => item.item_code === itemCode);
        if (existingItem) {
          existingItem.quantity = Math.max(existingItem.quantity, minQty);
        } else {
          bomItems.push({
            item_code: itemCode,
            quantity: minQty,
            source: 'min_qty_rule'
          });
        }
      });
    }

    // Apply special features rules
    if (params.special_features && rule.special_features) {
      params.special_features.forEach(feature => {
        const featureRule = rule.special_features?.[feature];
        if (featureRule) {
          Object.entries(featureRule).forEach(([itemCode, quantity]) => {
            bomItems.push({
              item_code: itemCode,
              quantity: typeof quantity === 'number' ? quantity : Math.ceil(params.floor_area * quantity),
              source: `special_feature_${feature}`
            });
          });
        }
      });
    }

    // Apply user overrides
    if (params.overrides) {
      Object.entries(params.overrides).forEach(([itemCode, override]) => {
        const existingItem = bomItems.find(item => item.item_code === itemCode);
        if (existingItem) {
          existingItem.quantity = override.quantity;
          existingItem.source = 'user_override';
        } else {
          bomItems.push({
            item_code: itemCode,
            quantity: override.quantity,
            source: 'user_override'
          });
        }
      });
    }

    return bomItems;
  }

  private async generateBOMForUnknownType(params: ProjectParams): Promise<BOMItem[]> {
    const prompt = `Generate BOM rules for a ${params.occupancy_type} with the following parameters:
      - Floor area: ${params.floor_area} sq ft
      - Number of stories: ${params.stories}
      - Special features: ${params.special_features?.join(', ') || 'none'}
      
      Please provide a JSON object with the following structure:
      {
        "per_sqft": { "item_code": ratio },
        "per_floor": { "item_code": count },
        "min_qty": { "item_code": quantity },
        "special_features": { "feature": { "item_code": quantity } }
      }`;

    const response = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      functions: [{
        name: "suggest_bom_rules",
        parameters: {
          type: "object",
          properties: {
            per_sqft: {
              type: "object",
              additionalProperties: { type: "number" }
            },
            per_floor: {
              type: "object",
              additionalProperties: { type: "number" }
            },
            min_qty: {
              type: "object",
              additionalProperties: { type: "number" }
            },
            special_features: {
              type: "object",
              additionalProperties: {
                type: "object",
                additionalProperties: { type: "number" }
              }
            }
          }
        }
      }],
      function_call: { name: "suggest_bom_rules" }
    });

    const functionCall = response.choices[0]?.message?.function_call;
    if (!functionCall?.arguments) {
      throw new Error('Failed to generate BOM rules for unknown building type');
    }

    const suggestedRules = JSON.parse(functionCall.arguments) as BOMRule;
    this.rules[params.occupancy_type] = suggestedRules;

    return this.generateBOM(params);
  }
} 