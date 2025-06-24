import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('[API/projects] Incoming request body:', body);
    
    // Validate required fields from the actual projectData structure
    const requiredFields = [
      { key: 'projectName', label: 'Project Name', description: 'A short name for your project (max 100 characters)' },
      { key: 'buildingType', label: 'Building Type', description: 'Type of building (e.g., office, residential, industrial, retail, healthcare, education)' },
      { key: 'squareFootage', label: 'Square Footage', description: 'Total area in square feet (must be a positive number)' }
    ];
    const missingFields = requiredFields.filter(field => !body[field.key]);
    
    if (missingFields.length > 0) {
      const details = missingFields.map(f => `${f.label}: ${f.description}`).join('; ');
      console.error('[API/projects] Missing required fields:', missingFields.map(f => f.key));
      return NextResponse.json(
        { 
          error: `Missing required fields: ${missingFields.map(f => f.label).join(', ')}`,
          details: `Please provide the following: ${details}`
        },
        { status: 400 }
      );
    }

    // Transform data to match backend schema
    const projectData = {
      clientName: body.clientName || body.projectName || 'Unknown Client',
      clientEmail: body.clientEmail || '',
      building: {
        type: body.buildingType,
        size: Number(body.squareFootage),
        floors: body.numberOfFloors || 1,
        zones: body.numberOfZones || 1,
      }
    };

    // Additional validation for field types/values
    const errors: string[] = [];
    if (typeof projectData.building.size !== 'number' || isNaN(projectData.building.size) || projectData.building.size <= 0) {
      errors.push('Square Footage must be a positive number.');
    }
    if (!['office', 'residential', 'industrial', 'retail', 'healthcare', 'education'].includes(projectData.building.type)) {
      errors.push('Building Type must be one of: office, residential, industrial, retail, healthcare, education.');
    }
    if (projectData.clientEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(projectData.clientEmail)) {
      errors.push('Client Email must be a valid email address (or leave empty).');
    }
    if (errors.length > 0) {
      return NextResponse.json(
        { error: 'Validation failed', details: errors.join(' ') },
        { status: 400 }
      );
    }

    console.log('[API/projects] Sending to backend:', projectData);

    // Call backend API
    const response = await fetch(`${API_BASE_URL}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(projectData),
    });

    console.log('[API/projects] Backend response status:', response.status);
    let backendResponseBody = null;
    try {
      backendResponseBody = await response.clone().json();
    } catch (e) {
      backendResponseBody = await response.clone().text();
    }
    console.log('[API/projects] Backend response body:', backendResponseBody);

    if (!response.ok) {
      console.error('[API/projects] Backend API error:', backendResponseBody);
      return NextResponse.json(
        { error: 'Failed to create project', details: backendResponseBody },
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
    console.error('[API/projects] Error creating project:', error);
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