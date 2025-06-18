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

async function extractFieldsWithLLM(text: string): Promise<any> {
  try {
    const prompt = `
You are an expert project estimator. Extract all important project fields from the following document. 
Return the result as a JSON object with field names and values. 
If a field is not present, omit it. Only return valid JSON.

Document text:
${text}
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a helpful assistant for extracting structured data from project documents.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2,
      max_tokens: 2048
    });

    const content = response.choices[0].message?.content || '';
    const jsonMatch = content.match(/```json\n([\s\S]*?)```|({[\s\S]*})/);
    let jsonString = jsonMatch ? (jsonMatch[1] || jsonMatch[2]) : content;

    try {
      return JSON.parse(jsonString);
    } catch (e) {
      console.error('Error parsing JSON response:', e);
      return { raw: content };
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

export default router; 