import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const SUPPORTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];
const SUPPORTED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];
const SUPPORTED_ARCHIVE_TYPES = [
  'application/zip',
  'application/x-zip-compressed',
  'application/octet-stream', // Some ZIP files might have this type
];

export async function POST(request: NextRequest) {
  try {
    console.log('Starting document upload process...');
    
    // Get the file from the request
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      console.error('No file provided in request');
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    console.log('File received:', {
      name: file.name,
      type: file.type,
      size: file.size
    });

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      console.error('File too large:', file.size);
      return NextResponse.json(
        { error: `File size exceeds maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB` },
        { status: 400 }
      );
    }

    // Validate file type
    const fileType = file.type.toLowerCase();
    const isImage = SUPPORTED_IMAGE_TYPES.includes(fileType);
    const isDocument = SUPPORTED_DOCUMENT_TYPES.includes(fileType);
    const isArchive = SUPPORTED_ARCHIVE_TYPES.includes(fileType) || file.name.toLowerCase().endsWith('.zip');
    
    if (!isImage && !isDocument && !isArchive) {
      console.error('Unsupported file type:', fileType);
      return NextResponse.json(
        { 
          error: 'Unsupported file type',
          details: `Supported types: PDF, DOCX, JPG, PNG, ZIP. Received: ${fileType}`,
          supportedTypes: [...SUPPORTED_IMAGE_TYPES, ...SUPPORTED_DOCUMENT_TYPES, ...SUPPORTED_ARCHIVE_TYPES]
        },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'uploads');
    console.log('Upload directory path:', uploadDir);
    
    try {
      if (!existsSync(uploadDir)) {
        console.log('Creating upload directory...');
        await mkdir(uploadDir, { recursive: true });
      }
    } catch (dirError) {
      console.error('Error creating upload directory:', dirError);
      return NextResponse.json(
        { error: 'Failed to create upload directory', details: dirError instanceof Error ? dirError.message : 'Unknown error' },
        { status: 500 }
      );
    }

    // Generate unique filename to prevent conflicts
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop();
    const uniqueFilename = `${timestamp}-${randomSuffix}.${fileExtension}`;
    
    // Save file to local storage
    const buffer = Buffer.from(await file.arrayBuffer());
    const filePath = join(uploadDir, uniqueFilename);
    console.log('Saving file to:', filePath);
    
    try {
      await writeFile(filePath, buffer);
      console.log('File saved successfully');
    } catch (writeError) {
      console.error('Error writing file:', writeError);
      return NextResponse.json(
        { error: 'Failed to save file', details: writeError instanceof Error ? writeError.message : 'Unknown error' },
        { status: 500 }
      );
    }

    // Prepare response data
    const fileInfo = {
      originalName: file.name,
      storedName: uniqueFilename,
      size: file.size,
      type: file.type,
      fileUrl: `/uploads/${uniqueFilename}`, // URL for local file access
      localPath: filePath,
      uploadedAt: new Date().toISOString()
    };

    console.log('File upload successful:', fileInfo);

    // For development, we'll return the file info directly
    // In production, you might want to send this to a backend service for processing
    const response = {
      success: true,
      message: 'File uploaded successfully',
      file: fileInfo,
      processingStatus: 'pending', // Files will be processed asynchronously
      estimatedProcessingTime: '2-5 minutes'
    };

    return NextResponse.json(response);

  } catch (error: any) {
    console.error('Error in document upload:', error);
    return NextResponse.json(
      { 
        error: 'Failed to upload file',
        details: error?.message || 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 