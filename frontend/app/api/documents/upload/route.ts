import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// Debug logging for environment variables
console.log('API Route Environment Check:', {
  hasOpenAIKey: !!process.env.OPENAI_API_KEY,
  openAIKeyLength: process.env.OPENAI_API_KEY?.length || 0,
  openAIKeyPrefix: process.env.OPENAI_API_KEY?.substring(0, 7)
});

// Initialize OpenAI with error handling
let openai: OpenAI;
try {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set in environment variables');
  }
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
} catch (error) {
  console.error('Error initializing OpenAI:', error);
  throw error;
}

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

    // Ensure upload directory exists
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

    // Save the file temporarily
    let buffer: Buffer;
    try {
      const bytes = await file.arrayBuffer();
      buffer = Buffer.from(bytes);
      const filePath = join(uploadDir, file.name);
      console.log('Saving file to:', filePath);
      await writeFile(filePath, buffer);
    } catch (fileError) {
      console.error('Error saving file:', fileError);
      return NextResponse.json(
        { error: 'Failed to save file', details: fileError instanceof Error ? fileError.message : 'Unknown error' },
        { status: 500 }
      );
    }

    // Detect file type
    const isImage = file.type.startsWith('image/');
    const isText = SUPPORTED_TEXT_TYPES.includes(file.type);
    console.log('File type detection:', { isImage, isText, fileType: file.type });

    // File type/size checks
    if (isImage) {
      if (!SUPPORTED_IMAGE_TYPES.includes(file.type)) {
        console.error('Unsupported image type:', file.type);
        return NextResponse.json(
          { error: `Unsupported image type: ${file.type}` },
          { status: 400 }
        );
      }
      if (buffer.length > MAX_IMAGE_SIZE) {
        console.error('File too large:', buffer.length);
        return NextResponse.json(
          { error: 'Image file too large. Max 20MB allowed.' },
          { status: 400 }
        );
      }
    } else if (!isText) {
      console.error('Unsupported file type:', file.type);
      return NextResponse.json(
        { error: `Unsupported file type: ${file.type}` },
        { status: 400 }
      );
    }

    let completion;
    console.log('Processing with OpenAI...');

    try {
      if (isImage) {
        // For images, use vision model
        const base64 = buffer.toString('base64');
        const dataUrl = `data:${file.type};base64,${base64}`;
        console.log('Using GPT-4 Vision for image analysis');
        completion = await openai.chat.completions.create({
          model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are a document analysis expert. Extract all text from the image and summarize the project requirements. Return the analysis in a structured format.'
            },
            {
              role: 'user',
              content: [
                { type: 'text', text: 'Please extract and analyze this document image.' },
                { type: 'image_url', image_url: { url: dataUrl } }
              ]
            }
          ],
          max_tokens: 4096
        });
      } else {
        // For text-based files, use standard GPT-4
        const fileContent = buffer.toString('utf-8');
        console.log('Using GPT-4 Turbo for text analysis');
        completion = await openai.chat.completions.create({
          model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are a document analysis expert. Analyze the following document and extract key information about the project, including building specifications, requirements, and any relevant technical details. Return the analysis in a structured JSON format.'
            },
            {
              role: 'user',
              content: fileContent
            }
          ],
          response_format: { type: 'json_object' }
        });
      }
    } catch (aiError: any) {
      console.error('OpenAI API Error:', {
        error: aiError,
        message: aiError?.message,
        response: aiError?.response?.data
      });
      return NextResponse.json(
        { 
          error: 'Failed to process with OpenAI',
          details: aiError?.message || 'Unknown error',
          openaiError: aiError?.response?.data
        },
        { status: 500 }
      );
    }

    console.log('OpenAI processing completed');
    const content = completion.choices[0].message.content;
    if (!content) {
      console.error('No content received from OpenAI');
      throw new Error('No content received from OpenAI');
    }

    let analysis;
    try {
      // For text documents, the response is already JSON
      // For images, we need to parse any structured data from the text response
      analysis = isImage ? { extractedText: content } : JSON.parse(content);
      console.log('Analysis parsed successfully');
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      analysis = { rawContent: content };
    }

    console.log('Sending successful response');
    return NextResponse.json({
      documentType: file.type,
      extractedData: analysis,
      confidence: 0.95, // This would be calculated based on the analysis
      url: isImage ? `data:${file.type};base64,${buffer.toString('base64')}` : undefined
    });
  } catch (error: any) {
    console.error('Unhandled error in document processing:', {
      error,
      message: error?.message,
      stack: error?.stack
    });
    return NextResponse.json(
      { 
        error: 'Failed to process document',
        details: error?.message || 'Unknown error',
        stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined
      },
      { status: 500 }
    );
  }
} 