import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['projectName', 'buildingType', 'squareFootage'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Transform data to match backend schema
    const projectData = {
      projectName: body.projectName,
      clientName: body.clientName || 'Unknown Client',
      clientEmail: body.clientEmail || '',
      clientPhone: body.clientPhone || '',
      buildingType: body.buildingType,
      buildingSize: body.squareFootage.toString(),
      location: {
        address: body.projectLocation || '',
        city: '',
        state: '',
        country: '',
        zipCode: ''
      },
      requirements: {
        description: body.projectDescription || '',
        numberOfFloors: body.numberOfFloors || 1,
        numberOfZones: body.numberOfZones || 1,
        priority: body.priority || 'medium',
        estimatedStartDate: body.estimatedStartDate || '',
        estimatedEndDate: body.estimatedEndDate || '',
        budget: body.budget || 0,
        uploadedFiles: body.uploadedFiles || []
      },
      status: 'draft',
      messages: [],
      history: [],
      metadata: {
        files: body.uploadedFiles?.map((file: any) => ({
          id: file.id,
          name: file.name,
          size: file.size,
          type: file.type,
          url: file.url,
          status: file.status,
          uploadedAt: new Date().toISOString()
        })) || []
      }
    };

    console.log('Creating project with data:', {
      ...projectData,
      requirements: {
        ...projectData.requirements,
        uploadedFiles: projectData.requirements.uploadedFiles?.length || 0
      }
    });

    // Call backend API
    const response = await fetch(`${API_BASE_URL}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(projectData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Backend API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to create project', details: errorData },
        { status: response.status }
      );
    }

    const project = await response.json();
    
    return NextResponse.json({
      success: true,
      project: project,
      message: 'Project created successfully'
    });

  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create project',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const response = await fetch(`${API_BASE_URL}/projects`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch projects' },
        { status: response.status }
      );
    }

    const projects = await response.json();
    return NextResponse.json(projects);

  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
} 