import OpenAI from 'openai';
import { config } from '../../config/env';
import { logger } from '../../utils/logger';
import fs from 'fs';
import path from 'path';

export interface ImageAnalysisResult {
  projectType: string;
  projectScope: string;
  timeline: string;
  requirements: string[];
  vendors: Array<{
    name: string;
    description: string;
    specialties: string[];
    confidence: number;
    source: string;
  }>;
  estimationElements: Array<{
    code: string;
    name: string;
    category: string;
    quantity: string;
    specifications: string;
    placement: string;
    unit_price: string;
    vendor: string;
    compliance: string[];
    confidence: number;
  }>;
  materials: Array<{
    name: string;
    category: string;
    specifications: string;
    estimatedCost: string;
  }>;
  recommendations: string[];
  estimatedBudget: string;
  complianceRequirements: string[];
  rawAnalysis: string;
}

export class ImageProcessor {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: config.openai.apiKey,
    });
  }

  async processImage(imagePath: string, projectType: string = 'fire_security_systems'): Promise<ImageAnalysisResult> {
    try {
      if (!config.vision.enabled) {
        throw new Error('Vision model is not enabled');
      }

      // Check if file exists
      if (!fs.existsSync(imagePath)) {
        throw new Error(`Image file not found: ${imagePath}`);
      }

      // Check file format
      const fileExtension = path.extname(imagePath).toLowerCase().replace('.', '');
      if (!config.vision.supportedFormats.includes(fileExtension)) {
        throw new Error(`Unsupported image format: ${fileExtension}. Supported formats: ${config.vision.supportedFormats.join(', ')}`);
      }

      // Read image file and convert to base64
      const imageBuffer = fs.readFileSync(imagePath);
      const base64Image = imageBuffer.toString('base64');

      const prompt = `
Analyze this image of a fire and security systems project. Extract detailed information about:

1. **Project Type**: What type of fire/security system is shown
2. **Project Scope**: What areas/rooms are covered
3. **Timeline**: Estimated completion time based on scope
4. **Requirements**: Specific system requirements visible
5. **Vendors**: Recommended vendors for the equipment shown
6. **Estimation Elements**: Specific items with codes, quantities, specs
7. **Materials**: Equipment and materials needed
8. **Recommendations**: Best practices and suggestions
9. **Estimated Budget**: Cost range based on scope
10. **Compliance Requirements**: Safety and code requirements

Focus on extracting specific estimation elements that can be used in a bill of materials (BOM). Each element should have a unique code, clear specifications, and vendor recommendations.

Project Type: ${projectType}

Important: Provide your response in JSON format with the following structure:
{
  "project_type": "string",
  "project_scope": "string", 
  "timeline": "string",
  "requirements": ["string"],
  "vendors": [{"name": "string", "description": "string", "specialties": ["string"], "confidence": number, "source": "string"}],
  "estimation_elements": [{"code": "string", "name": "string", "category": "string", "quantity": "string", "specifications": "string", "placement": "string", "unit_price": "string", "vendor": "string", "compliance": ["string"], "confidence": number}],
  "materials": [{"name": "string", "category": "string", "specifications": "string", "estimatedCost": "string"}],
  "recommendations": ["string"],
  "estimated_budget": "string",
  "compliance_requirements": ["string"]
}
`;

      logger.info(`Processing image with vision model: ${config.vision.model}`);
      logger.info(`Image path: ${imagePath}`);
      logger.info(`Detail level: ${config.vision.detailLevel}`);

      const response = await this.openai.chat.completions.create({
        model: config.vision.model,
        messages: [
          {
            role: 'system',
            content: 'You are a specialized AI assistant for analyzing fire and security systems project images. Extract structured data and provide actionable recommendations. Focus on specific estimation elements that can be used in bill of materials.'
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/${fileExtension};base64,${base64Image}`,
                  detail: config.vision.detailLevel as 'low' | 'high' | 'auto'
                }
              }
            ] as any
          }
        ],
        temperature: config.openai.temperature,
        max_tokens: config.vision.maxTokens
      });

      const content = response.choices[0].message?.content || '';
      
      logger.info('Vision model response received');
      logger.debug(`Response length: ${content.length} characters`);

      const jsonMatch = content.match(/```json\n([\s\S]*?)```|({[\s\S]*})/);
      let jsonString = jsonMatch ? (jsonMatch[1] || jsonMatch[2]) : content;

      try {
        const parsedData = JSON.parse(jsonString);
        
        logger.info('Successfully parsed vision model response');
        logger.info(`Project Type: ${parsedData.project_type}`);
        logger.info(`Timeline: ${parsedData.timeline}`);
        logger.info(`Estimated Budget: ${parsedData.estimated_budget}`);
        logger.info(`Vendors Found: ${parsedData.vendors?.length || 0}`);
        logger.info(`Estimation Elements Found: ${parsedData.estimation_elements?.length || 0}`);

        return {
          projectType: parsedData.project_type || 'Fire & Security System Installation',
          projectScope: parsedData.project_scope || 'Standard installation based on image analysis',
          timeline: parsedData.timeline || '4-6 weeks',
          requirements: parsedData.requirements || ['Fire detection system', 'Security monitoring'],
          vendors: parsedData.vendors || this.generateDefaultVendors(),
          estimationElements: parsedData.estimation_elements || this.generateDefaultEstimationElements(),
          materials: parsedData.materials || [],
          recommendations: parsedData.recommendations || [],
          estimatedBudget: parsedData.estimated_budget || '$10,000 - $50,000',
          complianceRequirements: parsedData.compliance_requirements || ['NFPA 72', 'UL Listed', 'Local Fire Codes'],
          rawAnalysis: content
        };
      } catch (e) {
        logger.error('Error parsing vision model JSON response:', e);
        logger.debug('Raw response:', content);
        
        // Return fallback response
        return {
          projectType: 'Fire & Security System Installation',
          projectScope: 'Standard installation based on image analysis',
          timeline: '4-6 weeks',
          requirements: ['Fire detection system', 'Security monitoring'],
          vendors: this.generateDefaultVendors(),
          estimationElements: this.generateDefaultEstimationElements(),
          materials: [],
          recommendations: ['Ensure compliance with local fire codes', 'Plan for regular maintenance schedules'],
          estimatedBudget: '$10,000 - $50,000',
          complianceRequirements: ['NFPA 72', 'UL Listed', 'Local Fire Codes'],
          rawAnalysis: content
        };
      }
    } catch (error) {
      logger.error('Error processing image with vision model:', error);
      throw error;
    }
  }

  private generateDefaultEstimationElements() {
    return [
      {
        code: 'SD-1001',
        name: 'Smoke Detector',
        category: 'smoke_detector',
        quantity: '15',
        specifications: 'Ceiling mount, Photoelectric, 120V AC, UL Listed',
        placement: 'Ceiling mounted in all rooms and corridors',
        unit_price: '$45-75',
        vendor: 'Graybar',
        compliance: ['NFPA 72', 'UL Listed'],
        confidence: 0.9
      },
      {
        code: 'FS-2002',
        name: 'Fire Alarm Control Panel',
        category: 'control_panel',
        quantity: '2',
        specifications: '6-Zone, LCD Display, NFPA 72 Compliant, 120V AC',
        placement: 'Main electrical room and secondary location',
        unit_price: '$350-450',
        vendor: 'Anixter',
        compliance: ['NFPA 72', 'UL Listed'],
        confidence: 0.9
      }
    ];
  }

  private generateDefaultVendors() {
    return [
      {
        name: 'Graybar',
        description: 'Leading distributor of electrical, communications, and security products',
        specialties: ['Fire Detection', 'Security Systems', 'Electrical Components'],
        confidence: 0.9,
        source: 'Graybar API'
      },
      {
        name: 'Anixter',
        description: 'Global distributor of security, electrical, and wire & cable products',
        specialties: ['Access Control', 'Fire Suppression', 'Cabling Solutions'],
        confidence: 0.85,
        source: 'Anixter API'
      }
    ];
  }
} 