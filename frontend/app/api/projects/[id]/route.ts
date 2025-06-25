import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`[API/projects/${params.id}] Deleting project with ID: ${params.id}`);

    // Call backend API to delete the project
    const response = await fetch(`${API_BASE_URL}/projects/${params.id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log(`[API/projects/${params.id}] Backend response status:`, response.status);

    if (!response.ok) {
      console.error(`[API/projects/${params.id}] Backend API error:`, response.statusText);
      return NextResponse.json(
        { error: 'Failed to delete project' },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Project deleted successfully'
    });

  } catch (error) {
    console.error(`[API/projects/${params.id}] Error deleting project:`, error);
    return NextResponse.json(
      { 
        error: 'Failed to delete project',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`[API/projects/${params.id}] Fetching project with ID: ${params.id}`);

    // Call backend API to get the project
    const response = await fetch(`${API_BASE_URL}/projects/${params.id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: response.status }
      );
    }

    const project = await response.json();
    return NextResponse.json(project);

  } catch (error) {
    console.error(`[API/projects/${params.id}] Error fetching project:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    );
  }
} 