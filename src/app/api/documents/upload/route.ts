import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import { writeFile } from 'fs/promises';
import { join } from 'path';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Save the file temporarily
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const uploadDir = join(process.cwd(), 'uploads');
    const filePath = join(uploadDir, file.name);
    await writeFile(filePath, buffer);

    // Read the file content
    const fileContent = buffer.toString('utf-8');

    // Use OpenAI to analyze the document
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are a document analysis expert. Analyze the following document and extract key information about the project, including building specifications, requirements, and any relevant technical details."
        },
        {
          role: "user",
          content: fileContent
        }
      ],
      response_format: { type: "json_object" }
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error('No content received from OpenAI');
    }

    const analysis = JSON.parse(content);

    return NextResponse.json({
      documentType: file.type,
      extractedData: analysis,
      confidence: 0.95, // This would be calculated based on the analysis
    });
  } catch (error) {
    console.error('Error processing document:', error);
    return NextResponse.json(
      { error: 'Failed to process document' },
      { status: 500 }
    );
  }
} 