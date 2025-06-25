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
    console.log('Starting file upload process...');
    
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

    // Route to appropriate backend endpoint based on file type
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    
    if (isImage) {
      console.log('Routing image to backend image processing...');
      
      // Create form data for backend
      const backendFormData = new FormData();
      backendFormData.append('image', file);
      backendFormData.append('projectType', 'fire_security_systems');
      
      try {
        const backendResponse = await fetch(`${backendUrl}/api/images/process`, {
          method: 'POST',
          body: backendFormData
        });
        
        if (!backendResponse.ok) {
          const errorData = await backendResponse.text();
          console.error('Backend image processing failed:', errorData);
          throw new Error(`Backend processing failed: ${errorData}`);
        }
        
        const backendResult = await backendResponse.json();
        console.log('Backend image processing successful:', backendResult);
        
        return NextResponse.json({
          success: true,
          message: 'Image uploaded and processed successfully',
          file: {
            originalName: file.name,
            type: file.type,
            size: file.size,
            uploadedAt: new Date().toISOString(),
            processingType: 'image'
          },
          backendResult: backendResult,
          processingStatus: 'completed'
        });
        
      } catch (backendError: any) {
        console.error('Backend image processing error:', backendError);
        return NextResponse.json(
          { 
            error: 'Failed to process image',
            details: backendError?.message || 'Backend processing failed',
            timestamp: new Date().toISOString()
          },
          { status: 500 }
        );
      }
      
    } else {
      // For documents and archives, save to backend documents directory and route to backend
      console.log('Routing document to backend document processing...');
      
      // Create backend uploads directory if it doesn't exist
      const uploadDir = join(process.cwd(), 'backend', 'uploads', 'documents');
      console.log('Upload directory path:', uploadDir);
      
      try {
        if (!existsSync(uploadDir)) {
          console.log('Creating backend upload directory...');
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
      
      // Save file to backend documents directory
      const buffer = Buffer.from(await file.arrayBuffer());
      const filePath = join(uploadDir, uniqueFilename);
      console.log('Saving file to:', filePath);
      
      try {
        await writeFile(filePath, buffer);
        console.log('File saved successfully to backend');
      } catch (writeError) {
        console.error('Error writing file:', writeError);
        return NextResponse.json(
          { error: 'Failed to save file', details: writeError instanceof Error ? writeError.message : 'Unknown error' },
          { status: 500 }
        );
      }

      // Route to backend document processing
      try {
        const backendResponse = await fetch(`${backendUrl}/api/documents/process-json`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            filePath: filePath,
            fileName: file.name,
            projectType: 'fire_security_systems',
            content: buffer.toString('utf-8') // For text-based documents
          })
        });
        
        if (!backendResponse.ok) {
          const errorData = await backendResponse.text();
          console.error('Backend document processing failed:', errorData);
          // Don't throw error here, just log it and return file info
        } else {
          const backendResult = await backendResponse.json();
          console.log('Backend document processing successful:', backendResult);
        }
        
      } catch (backendError) {
        console.error('Backend document processing error:', backendError);
        // Don't throw error here, just log it and return file info
      }

      // Prepare response data
      const fileInfo = {
        originalName: file.name,
        storedName: uniqueFilename,
        size: file.size,
        type: file.type,
        fileUrl: `/backend/uploads/documents/${uniqueFilename}`, // Updated URL path
        localPath: filePath,
        uploadedAt: new Date().toISOString(),
        processingType: 'document'
      };

      console.log('File upload successful:', fileInfo);

      return NextResponse.json({
        success: true,
        message: 'Document uploaded successfully',
        file: fileInfo,
        processingStatus: 'pending', // Documents will be processed asynchronously
        estimatedProcessingTime: '2-5 minutes'
      });
    }

  } catch (error: any) {
    console.error('Error in file upload:', error);
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