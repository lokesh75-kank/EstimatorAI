import { NextResponse } from 'next/server';
import { apiService } from '@/services/api';

export async function POST(request: Request) {
  try {
    // Log the incoming request
    console.log('Received estimation request');

    // Parse and validate request body
    const body = await request.json();
    console.log('Request body:', body);

    // Validate required fields
    const requiredFields = ['projectDetails', 'extractedDocs', 'suggestions', 'bomData'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields);
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Create project
    const project = await apiService.createProject({
      projectName: body.projectDetails.projectName,
      clientName: body.projectDetails.clientName,
      clientEmail: body.projectDetails.clientEmail || 'temp@example.com',
      clientPhone: body.projectDetails.clientPhone || '',
      building: {
        type: body.projectDetails.buildingType,
        size: body.projectDetails.squareFootage.toString(),
        floors: body.projectDetails.numberOfFloors,
        zones: body.projectDetails.numberOfZones
      },
      location: body.projectDetails.location || {
        address: '',
        city: '',
        state: '',
        country: '',
        zipCode: ''
      },
      requirements: {
        description: body.projectDetails.projectDescription,
      },
      status: 'draft',
      messages: [],
      history: [],
      metadata: {
        extractedDocs: body.extractedDocs,
        suggestions: body.suggestions,
        bomData: body.bomData,
        warnings: body.warnings,
        proposalData: body.proposalData
      }
    });

    if (!project || !project.id) {
      console.error('Failed to create project: Invalid response from server');
      return NextResponse.json(
        { error: 'Failed to create project: Invalid response from server' },
        { status: 500 }
      );
    }

    // Log success
    console.log('Project created successfully:', project.id);

    return NextResponse.json({ 
      success: true, 
      projectId: project.id,
      message: 'Estimation created successfully'
    });

  } catch (error) {
    // Log the full error
    console.error('Error creating estimation:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    return NextResponse.json(
      { 
        error: 'Failed to create estimation',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 