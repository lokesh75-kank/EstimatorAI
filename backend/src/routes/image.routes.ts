import express, { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import { ImageProcessor } from '../services/image-processor/ImageProcessor';
import { config } from '../config/env';
import { logger } from '../utils/logger';

const router = express.Router();
const imageProcessor = new ImageProcessor();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/images'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedFormats = config.vision.supportedFormats;
  const fileExtension = path.extname(file.originalname).toLowerCase().replace('.', '');
  
  if (allowedFormats.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported image format: ${fileExtension}. Supported formats: ${allowedFormats.join(', ')}`));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

// Route to process uploaded image
router.post('/process', upload.single('image'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No image file provided',
        message: 'Please upload an image file',
        supportedFormats: config.vision.supportedFormats
      });
    }

    const projectType = req.body.projectType || 'fire_security_systems';
    
    logger.info(`Processing image: ${req.file.filename}`);
    logger.info(`Project type: ${projectType}`);
    logger.info(`File size: ${req.file.size} bytes`);

    const result = await imageProcessor.processImage(req.file.path, projectType);

    res.json({
      success: true,
      data: result,
      metadata: {
        model: config.vision.model,
        detailLevel: config.vision.detailLevel,
        maxTokens: config.vision.maxTokens,
        projectType: projectType,
        originalFilename: req.file.originalname,
        processedFilename: req.file.filename
      }
    });

  } catch (error) {
    logger.error('Error processing image:', error);
    next(error);
  }
});

// Route to process image from URL
router.post('/process-url', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { imageUrl, projectType = 'fire_security_systems' } = req.body;

    if (!imageUrl) {
      return res.status(400).json({
        error: 'No image URL provided',
        message: 'Please provide an image URL'
      });
    }

    logger.info(`Processing image from URL: ${imageUrl}`);
    logger.info(`Project type: ${projectType}`);

    // For URL processing, we'll need to download the image first
    // This is a simplified version - in production you might want to add URL validation
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image from URL: ${response.statusText}`);
    }

    const imageBuffer = await response.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString('base64');
    
    // Determine file extension from URL or default to jpg
    const urlPath = new URL(imageUrl).pathname;
    const fileExtension = path.extname(urlPath).toLowerCase().replace('.', '') || 'jpg';

    if (!config.vision.supportedFormats.includes(fileExtension)) {
      return res.status(400).json({
        error: 'Unsupported image format',
        message: `Format ${fileExtension} is not supported`,
        supportedFormats: config.vision.supportedFormats
      });
    }

    // Create a temporary file path
    const tempFileName = `temp-${Date.now()}.${fileExtension}`;
    const tempFilePath = path.join(__dirname, '../../uploads/images', tempFileName);

    // Save the image temporarily
    require('fs').writeFileSync(tempFilePath, Buffer.from(imageBuffer));

    try {
      const result = await imageProcessor.processImage(tempFilePath, projectType);

      res.json({
        success: true,
        data: result,
        metadata: {
          model: config.vision.model,
          detailLevel: config.vision.detailLevel,
          maxTokens: config.vision.maxTokens,
          projectType: projectType,
          sourceUrl: imageUrl
        }
      });
    } finally {
      // Clean up temporary file
      try {
        require('fs').unlinkSync(tempFilePath);
      } catch (cleanupError) {
        logger.warn('Failed to cleanup temporary file:', cleanupError);
      }
    }

  } catch (error) {
    logger.error('Error processing image from URL:', error);
    next(error);
  }
});

// Route to get supported image formats
router.get('/supported-formats', (req: Request, res: Response) => {
  res.json({
    supportedFormats: config.vision.supportedFormats,
    maxFileSize: '10MB',
    visionModel: config.vision.model,
    detailLevel: config.vision.detailLevel
  });
});

// Error handling middleware
const handleMulterError = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err.name === 'FileTypeError') {
    return res.status(400).json({
      error: 'Invalid file type',
      message: err.message,
      details: {
        receivedType: err.message.split(': ')[1]?.split('.')[0],
        allowedTypes: config.vision.supportedFormats.map(format => `${format.toUpperCase()} (.${format})`)
      }
    });
  }
  
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      error: 'File too large',
      message: 'Image file size exceeds the 10MB limit'
    });
  }
  
  next(err);
};

router.use(handleMulterError);

export default router; 