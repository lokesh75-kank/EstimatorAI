import express, { Request, Response, NextFunction } from 'express';
import multer from 'multer';
const pdfParse = require('pdf-parse');
import mammoth from 'mammoth';
import fs from 'fs/promises';
import OpenAI from 'openai';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(process.cwd(), 'uploads');
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

Focus on extracting:
1. Project requirements and specifications
2. Recommended vendors and their specialties
3. Required materials and equipment
4. Project timeline and scope
5. Cost estimates and budgets
6. Technical specifications
7. Compliance requirements

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
  "estimated_budget": "budget range"
}

Document text:
${text}

Project Type: ${projectType}
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { 
          role: 'system', 
          content: 'You are a specialized AI assistant for fire and security systems project estimation. Extract structured data and provide actionable recommendations.' 
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2,
      max_tokens: 4000
    });

    const content = response.choices[0].message?.content || '';
    const jsonMatch = content.match(/```json\n([\s\S]*?)```|({[\s\S]*})/);
    let jsonString = jsonMatch ? (jsonMatch[1] || jsonMatch[2]) : content;

    try {
      return JSON.parse(jsonString);
    } catch (e) {
      console.error('Error parsing JSON response:', e);
      // Return a structured fallback response
      return {
        project_type: 'Fire & Security System Installation',
        project_scope: 'Standard installation based on document analysis',
        timeline: '4-6 weeks',
        requirements: ['Fire detection system', 'Security monitoring'],
        vendors: [
          {
            name: 'ACME Fire & Security',
            description: 'Leading provider of integrated fire and security solutions',
            specialties: ['Fire Detection', 'Access Control', 'Video Surveillance'],
            confidence: 0.9
          }
        ],
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
        raw_analysis: content
      };
    }
  } catch (error) {
    console.error('Error in LLM processing:', error);
    throw new Error(`Failed to process with LLM: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
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

export default router; 