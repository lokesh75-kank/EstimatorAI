import express, { Request, Response, NextFunction } from 'express';
import multer from 'multer';
const pdfParse = require('pdf-parse');
import mammoth from 'mammoth';
import fs from 'fs/promises';
import OpenAI from 'openai';
import path from 'path';
import dotenv from 'dotenv';
import { config } from '../config/env';
import { ImageProcessor } from '../services/image-processor/ImageProcessor';

dotenv.config();

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Save documents in uploads/documents/
    const uploadDir = path.join(process.cwd(), 'uploads', 'documents');
    require('fs').mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 20 * 1024 * 1024 // 20MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-word.document.12',
      'text/plain'
    ];
    console.log('Received file type:', file.mimetype);
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      const error = new Error(`Unsupported file type: ${file.mimetype}. Allowed types are: ${allowedTypes.join(', ')}`);
      error.name = 'FileTypeError';
      cb(error);
    }
  }
});

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function extractText(filePath: string, mimetype: string): Promise<string> {
  try {
    if (mimetype === 'application/pdf') {
      const data = await fs.readFile(filePath);
      const pdfData = await pdfParse(data);
      return pdfData.text;
    } else if (
      mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mimetype === 'application/msword'
    ) {
      const data = await fs.readFile(filePath);
      const result = await mammoth.extractRawText({ buffer: data });
      return result.value;
    } else if (mimetype === 'text/plain') {
      return await fs.readFile(filePath, 'utf-8');
    } else {
      throw new Error('Unsupported file type');
    }
  } catch (error) {
    console.error('Error extracting text:', error);
    throw new Error(`Failed to extract text: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function extractFieldsWithLLM(text: string, projectType: string = 'fire_security_systems'): Promise<any> {
  try {
    const prompt = `
You are an expert project estimator specializing in fire and security systems. Analyze the following document and extract structured information for project estimation.

Focus on extracting estimation elements (devices, accessories, wiring, panels, conduits) with their metadata:

1. **Estimation Elements**: Identify specific devices and components mentioned
2. **Quantities**: Extract quantities for each element
3. **Specifications**: Technical specs (voltage, detection type, mounting type, etc.)
4. **Placement Location**: Where each element should be installed
5. **Vendor Recommendations**: Best vendors for each component type
6. **Project Requirements**: Overall project scope and constraints
7. **Compliance**: Code requirements (NFPA, IBC, local codes)

Return the result as a JSON object with the following structure:
{
  "project_type": "string",
  "project_scope": "string",
  "timeline": "string",
  "requirements": ["array of requirements"],
  "vendors": [
    {
      "name": "vendor name",
      "description": "vendor description",
      "specialties": ["array of specialties"],
      "confidence": 0.9,
      "source": "API/CSV/Manual"
    }
  ],
  "estimation_elements": [
    {
      "code": "auto-generated code (e.g., SD-1001)",
      "name": "element name",
      "category": "smoke_detector|control_panel|pull_station|heat_detector|backbox|cable|conduit|accessory",
      "quantity": "extracted or estimated quantity",
      "specifications": "detailed technical specifications",
      "placement": "installation location description",
      "unit_price": "estimated unit price range",
      "vendor": "recommended vendor name",
      "compliance": ["NFPA 72", "UL Listed", etc.],
      "confidence": 0.9
    }
  ],
  "materials": [
    {
      "name": "material name",
      "category": "category",
      "specifications": "specifications",
      "estimatedCost": "cost range"
    }
  ],
  "recommendations": ["array of recommendations"],
  "estimated_budget": "budget range",
  "compliance_requirements": ["NFPA 72", "IBC", "local codes"]
}

Document text:
${text}

Project Type: ${projectType}

Important: Focus on extracting specific estimation elements that can be used in a bill of materials (BOM). Each element should have a unique code, clear specifications, and vendor recommendations.
`;

    // Log the prompt being sent to OpenAI
    console.log('\n🤖 === LLM PROMPT SENT TO OPENAI ===');
    console.log('Project Type:', projectType);
    console.log('Document Length:', text.length, 'characters');
    console.log('Prompt Length:', prompt.length, 'characters');
    console.log('Document Preview:', text.substring(0, 200) + '...');
    console.log('=====================================\n');

    const response = await openai.chat.completions.create({
      model: config.openai.model,
      messages: [
        { 
          role: 'system', 
          content: 'You are a specialized AI assistant for fire and security systems project estimation. Extract structured data and provide actionable recommendations. Focus on specific estimation elements that can be used in bill of materials.' 
        },
        { role: 'user', content: prompt }
      ],
      temperature: config.openai.temperature,
      max_tokens: config.openai.maxTokens
    });

    const content = response.choices[0].message?.content || '';
    
    // Log the raw response from OpenAI
    console.log('\n🤖 === LLM RESPONSE FROM OPENAI ===');
    console.log('Response Length:', content.length, 'characters');
    console.log('Raw Response:');
    console.log(content);
    console.log('=====================================\n');

    const jsonMatch = content.match(/```json\n([\s\S]*?)```|({[\s\S]*})/);
    let jsonString = jsonMatch ? (jsonMatch[1] || jsonMatch[2]) : content;

    try {
      const parsedData = JSON.parse(jsonString);
      
      // Log the parsed data
      console.log('\n🤖 === PARSED LLM RESPONSE ===');
      console.log('Successfully parsed JSON response');
      console.log('Project Type:', parsedData.project_type);
      console.log('Timeline:', parsedData.timeline);
      console.log('Estimated Budget:', parsedData.estimated_budget);
      console.log('Vendors Found:', parsedData.vendors?.length || 0);
      console.log('Estimation Elements Found:', parsedData.estimation_elements?.length || 0);
      console.log('Compliance Requirements:', parsedData.compliance_requirements?.length || 0);
      console.log('=====================================\n');
      
      // Enhance the parsed data with better structure
      const enhancedData = {
        ...parsedData,
        estimation_elements: parsedData.estimation_elements || generateDefaultEstimationElements(),
        vendors: parsedData.vendors || generateDefaultVendors(),
        compliance_requirements: parsedData.compliance_requirements || ['NFPA 72', 'UL Listed', 'Local Fire Codes']
      };

      return enhancedData;
    } catch (e) {
      console.error('Error parsing JSON response:', e);
      console.log('\n🤖 === JSON PARSING FAILED ===');
      console.log('Attempted to parse:', jsonString);
      console.log('Error:', e);
      console.log('Using fallback response...');
      console.log('=====================================\n');
      
      // Return a structured fallback response with estimation elements
      return {
        project_type: 'Fire & Security System Installation',
        project_scope: 'Standard installation based on document analysis',
        timeline: '4-6 weeks',
        requirements: ['Fire detection system', 'Security monitoring'],
        vendors: generateDefaultVendors(),
        estimation_elements: generateDefaultEstimationElements(),
        materials: [
          {
            name: 'Smoke Detectors',
            category: 'Fire Detection',
            specifications: 'Photoelectric and ionization sensors',
            estimatedCost: '$50-150 each'
          }
        ],
        recommendations: [
          'Ensure compliance with local fire codes',
          'Plan for regular maintenance schedules',
          'Consider backup power systems'
        ],
        estimated_budget: '$10,000 - $50,000',
        compliance_requirements: ['NFPA 72', 'UL Listed', 'Local Fire Codes'],
        raw_analysis: content
      };
    }
  } catch (error) {
    console.error('Error in LLM processing:', error);
    throw new Error(`Failed to process with LLM: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Generate default estimation elements
function generateDefaultEstimationElements() {
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
    },
    {
      code: 'BX-3003',
      name: 'Backbox',
      category: 'backbox',
      quantity: '20',
      specifications: '4" Square, Deep, Metal, Weatherproof',
      placement: 'Wall mounted for devices and switches',
      unit_price: '$5-10',
      vendor: 'Graybar',
      compliance: ['UL Listed'],
      confidence: 0.8
    },
    {
      code: 'WP-4004',
      name: 'Pull Station',
      category: 'pull_station',
      quantity: '8',
      specifications: 'Single Action, Red, UL Listed, Manual activation',
      placement: 'Near exits and in corridors',
      unit_price: '$20-35',
      vendor: 'Anixter',
      compliance: ['NFPA 72', 'UL Listed'],
      confidence: 0.9
    },
    {
      code: 'HR-5005',
      name: 'Heat Detector',
      category: 'heat_detector',
      quantity: '12',
      specifications: 'Fixed Temperature, 135°F, Ceiling Mount, UL Listed',
      placement: 'Kitchens, mechanical rooms, and high-temperature areas',
      unit_price: '$30-50',
      vendor: 'Graybar',
      compliance: ['NFPA 72', 'UL Listed'],
      confidence: 0.8
    }
  ];
}

// Generate default vendors
function generateDefaultVendors() {
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
    },
    {
      name: 'WESCO',
      description: 'Electrical, industrial, and communications MRO and OEM product distributor',
      specialties: ['Electrical Components', 'Industrial Controls', 'Safety Equipment'],
      confidence: 0.8,
      source: 'WESCO API'
    }
  ];
}

// Error handling middleware
const handleMulterError = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err.name === 'FileTypeError') {
    return res.status(400).json({
      error: 'Invalid file type',
      message: err.message,
      details: {
        receivedType: err.message.split(': ')[1]?.split('.')[0],
        allowedTypes: [
          'PDF (.pdf)',
          'Word Document (.doc, .docx)',
          'Text File (.txt)'
        ]
      }
    });
  }
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large',
        message: 'Maximum file size is 20MB',
        details: {
          maxSize: '20MB',
          receivedSize: req.file?.size
        }
      });
    }
    return res.status(400).json({
      error: 'File upload error',
      message: err.message
    });
  }
  next(err);
};

// Define interface for the request with file
interface FileRequest extends Request {
  file?: Express.Multer.File;
}

// Route for processing uploaded files
router.post('/api/documents/process', upload.single('file'), handleMulterError, async (req: FileRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        error: 'No file uploaded',
        message: 'Please provide a file to process'
      });
    }

    const filePath = req.file.path;
    const mimetype = req.file.mimetype;

    console.log('Processing file:', {
      path: filePath,
      mimetype: mimetype,
      size: req.file.size
    });

    // 1. Extract text from file
    const text = await extractText(filePath, mimetype);

    // 2. Extract fields using LLM
    const extractedData = await extractFieldsWithLLM(text);

    // 3. Clean up uploaded file
    try {
      await fs.unlink(filePath);
    } catch (cleanupError) {
      console.error('Error cleaning up file:', cleanupError);
      // Don't fail the request if cleanup fails
    }

    // 4. Return extracted data
    res.json({
      success: true,
      extractedData,
      message: 'Document processed successfully',
      fileInfo: {
        name: req.file.originalname,
        type: req.file.mimetype,
        size: req.file.size
      }
    });
  } catch (error: any) {
    console.error('Error processing document:', error);
    res.status(500).json({ 
      error: 'Failed to process document',
      message: error.message || 'An unexpected error occurred',
      details: {
        fileInfo: req.file ? {
          name: req.file.originalname,
          type: req.file.mimetype,
          size: req.file.size
        } : null
      }
    });
  }
});

// Route for processing existing files (JSON payload)
router.post('/api/documents/process-json', async (req: Request, res: Response) => {
  try {
    const { filePath, fileName, projectType } = req.body;
    
    if (!filePath || !fileName) {
      return res.status(400).json({
        error: 'Missing required parameters',
        message: 'filePath and fileName are required'
      });
    }

    console.log('Processing existing file:', { filePath, fileName, projectType });

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch (error) {
      return res.status(404).json({
        error: 'File not found',
        message: `File not found at path: ${filePath}`
      });
    }

    // Determine file type from extension
    const fileExtension = path.extname(fileName).toLowerCase();
    let mimetype = 'text/plain';
    
    switch (fileExtension) {
      case '.pdf':
        mimetype = 'application/pdf';
        break;
      case '.docx':
        mimetype = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        break;
      case '.doc':
        mimetype = 'application/msword';
        break;
      case '.txt':
        mimetype = 'text/plain';
        break;
      default:
        return res.status(400).json({
          error: 'Unsupported file type',
          message: `Unsupported file extension: ${fileExtension}`
        });
    }

    // 1. Extract text from file
    const text = await extractText(filePath, mimetype);

    // 2. Extract fields using LLM with project type
    const extractedData = await extractFieldsWithLLM(text, projectType || 'fire_security_systems');

    // 3. Return extracted data
    res.json({
      success: true,
      extractedData,
      message: 'Document processed successfully with AI analysis',
      fileInfo: {
        name: fileName,
        path: filePath,
        type: mimetype
      }
    });

  } catch (error: any) {
    console.error('Error processing document:', error);
    res.status(500).json({
      error: 'Failed to process document',
      message: error.message || 'An unexpected error occurred'
    });
  }
});

// Debug endpoint to see LLM prompts and responses
router.post('/api/documents/debug', async (req: Request, res: Response) => {
  try {
    const { text, projectType } = req.body;
    
    if (!text) {
      return res.status(400).json({
        error: 'Missing required parameter: text'
      });
    }

    console.log('\n🔍 === DEBUG MODE: LLM ANALYSIS ===');
    
    const prompt = `
You are an expert project estimator specializing in fire and security systems. Analyze the following document and extract structured information for project estimation.

Focus on extracting estimation elements (devices, accessories, wiring, panels, conduits) with their metadata:

1. **Estimation Elements**: Identify specific devices and components mentioned
2. **Quantities**: Extract quantities for each element
3. **Specifications**: Technical specs (voltage, detection type, mounting type, etc.)
4. **Placement Location**: Where each element should be installed
5. **Vendor Recommendations**: Best vendors for each component type
6. **Project Requirements**: Overall project scope and constraints
7. **Compliance**: Code requirements (NFPA, IBC, local codes)

Return the result as a JSON object with the following structure:
{
  "project_type": "string",
  "project_scope": "string",
  "timeline": "string",
  "requirements": ["array of requirements"],
  "vendors": [
    {
      "name": "vendor name",
      "description": "vendor description",
      "specialties": ["array of specialties"],
      "confidence": 0.9,
      "source": "API/CSV/Manual"
    }
  ],
  "estimation_elements": [
    {
      "code": "auto-generated code (e.g., SD-1001)",
      "name": "element name",
      "category": "smoke_detector|control_panel|pull_station|heat_detector|backbox|cable|conduit|accessory",
      "quantity": "extracted or estimated quantity",
      "specifications": "detailed technical specifications",
      "placement": "installation location description",
      "unit_price": "estimated unit price range",
      "vendor": "recommended vendor name",
      "compliance": ["NFPA 72", "UL Listed", etc.],
      "confidence": 0.9
    }
  ],
  "materials": [
    {
      "name": "material name",
      "category": "category",
      "specifications": "specifications",
      "estimatedCost": "cost range"
    }
  ],
  "recommendations": ["array of recommendations"],
  "estimated_budget": "budget range",
  "compliance_requirements": ["NFPA 72", "IBC", "local codes"]
}

Document text:
${text}

Project Type: ${projectType || 'fire_security_systems'}

Important: Focus on extracting specific estimation elements that can be used in a bill of materials (BOM). Each element should have a unique code, clear specifications, and vendor recommendations.
`;

    console.log('📤 PROMPT SENT TO OPENAI:');
    console.log(prompt);
    console.log('\n' + '='.repeat(80) + '\n');

    const response = await openai.chat.completions.create({
      model: config.openai.model,
      messages: [
        { 
          role: 'system', 
          content: 'You are a specialized AI assistant for fire and security systems project estimation. Extract structured data and provide actionable recommendations. Focus on specific estimation elements that can be used in bill of materials.' 
        },
        { role: 'user', content: prompt }
      ],
      temperature: config.openai.temperature,
      max_tokens: config.openai.maxTokens
    });

    const content = response.choices[0].message?.content || '';
    
    console.log('📥 RESPONSE FROM OPENAI:');
    console.log(content);
    console.log('\n' + '='.repeat(80) + '\n');

    const jsonMatch = content.match(/```json\n([\s\S]*?)```|({[\s\S]*})/);
    let jsonString = jsonMatch ? (jsonMatch[1] || jsonMatch[2]) : content;

    let parsedData;
    let parseError = null;

    try {
      parsedData = JSON.parse(jsonString);
      console.log('✅ SUCCESSFULLY PARSED JSON');
    } catch (e) {
      parseError = e;
      console.log('❌ FAILED TO PARSE JSON:', e);
      console.log('Attempted to parse:', jsonString);
    }

    console.log('🔍 === DEBUG MODE END ===\n');

    res.json({
      success: true,
      debug: {
        prompt: {
          length: prompt.length,
          preview: prompt.substring(0, 500) + '...',
          full: prompt
        },
        response: {
          length: content.length,
          raw: content,
          parsed: parsedData,
          parseError: parseError instanceof Error ? parseError.message : String(parseError)
        },
        metadata: {
          model: config.openai.model,
          temperature: config.openai.temperature,
          maxTokens: config.openai.maxTokens,
          projectType: projectType || 'fire_security_systems'
        }
      }
    });

  } catch (error: any) {
    console.error('Debug endpoint error:', error);
    res.status(500).json({
      error: 'Debug processing failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Route for processing images with AI
router.post('/api/documents/process-image', async (req: Request, res: Response) => {
  try {
    const { fileName, sessionId } = req.body;
    if (!fileName) {
      return res.status(400).json({ error: 'Missing fileName in request body' });
    }
    // Find the image in uploads/images
    const imagePath = path.join(process.cwd(), 'uploads', 'images', fileName);
    const imageProcessor = new ImageProcessor();
    const aiAnalysis = await imageProcessor.processImage(imagePath);
    res.json({ aiAnalysis });
  } catch (error: any) {
    console.error('Error processing image:', error);
    res.status(500).json({ error: 'Failed to process image', message: error.message });
  }
});

export default router; 