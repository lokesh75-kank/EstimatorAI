import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const MAX_IMAGE_SIZE = 20 * 1024 * 1024; // 20MB
const SUPPORTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];
const SUPPORTED_TEXT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
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

    // Save file temporarily
    const buffer = Buffer.from(await file.arrayBuffer());
    const tempPath = join(uploadDir, file.name);
    console.log('Saving file to:', tempPath);
    await writeFile(tempPath, buffer);

    // Check file type
    const fileType = file.type.toLowerCase();
    if (!SUPPORTED_IMAGE_TYPES.includes(fileType) && !SUPPORTED_TEXT_TYPES.includes(fileType)) {
      console.error('Unsupported file type:', fileType);
      return NextResponse.json(
        { error: 'Unsupported file type' },
        { status: 400 }
      );
    }

    // Check file size
    if (file.size > MAX_IMAGE_SIZE) {
      console.error('File too large:', file.size);
      return NextResponse.json(
        { error: 'File too large' },
        { status: 400 }
      );
    }

    // Send file to backend for processing
    const backendUrl = process.env.NEXT_PUBLIC_API_URL;
    const apiKey = process.env.NEXT_PUBLIC_AGENT_API_KEY;

    if (!backendUrl) {
      console.error('Backend URL not configured');
      return NextResponse.json(
        { error: 'Backend URL not configured' },
        { status: 500 }
      );
    }

    if (!apiKey) {
      console.error('API key not configured');
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    const fullUrl = `${backendUrl}/api/documents/api/documents/process`;
    console.log('Backend URL:', backendUrl);
    console.log('Full request URL:', fullUrl);

    try {
      // Create a new FormData instance for the backend request
      const backendFormData = new FormData();
      // Create a new Blob with the original file type
      const fileBlob = new Blob([buffer], { type: file.type });
      backendFormData.append('file', fileBlob, file.name);

      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
        body: backendFormData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Backend error response:', errorText);
        
        // Try to parse the error message if it's JSON
        let errorMessage = 'Failed to process document';
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error || errorJson.message || errorMessage;
        } catch (e) {
          // If not JSON, extract the error message from HTML if present
          const errorMatch = errorText.match(/<pre>([^<]+)<\/pre>/);
          if (errorMatch) {
            errorMessage = errorMatch[1].trim();
          }
        }
        
        throw new Error(`Document processing failed: ${errorMessage}`);
      }

      const result = await response.json();
      console.log('Backend processing result:', result);

      return NextResponse.json(result);
    } catch (error) {
      console.error('Error sending file to backend:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return NextResponse.json(
        { 
          error: 'Failed to process document',
          details: errorMessage,
          fileInfo: {
            name: file.name,
            type: file.type,
            size: file.size
          }
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Error in document upload:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process document',
        details: error?.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
} 