import { NextRequest, NextResponse } from 'next/server';
import { apiService } from '@/services/api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, action } = body;

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    if (action === 'start_estimation') {
      // In a real implementation, this would:
      // 1. Fetch the project data from your database
      // 2. Get the uploaded files
      // 3. Send them to your AI service for processing
      // 4. Update the project with estimation status
      
      console.log(`Starting AI estimation for project: ${projectId}`);
      
      // Simulate AI processing time
      // In production, this would be an async job that updates the project status
      
      return NextResponse.json({
        success: true,
        message: 'AI estimation started successfully',
        estimationId: `est_${Date.now()}`,
        status: 'in_progress'
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Estimation API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const estimationId = searchParams.get('estimationId');

    if (!projectId && !estimationId) {
      return NextResponse.json(
        { error: 'Project ID or Estimation ID is required' },
        { status: 400 }
      );
    }

    // In a real implementation, this would fetch estimation status from your database
    // For now, return mock data
    const mockEstimation = {
      id: estimationId || `est_${Date.now()}`,
      projectId: projectId || '1',
      status: 'completed',
      estimatedCost: 125000,
      breakdown: {
        fireSuppression: 45000,
        securitySystem: 35000,
        monitoring: 15000,
        installation: 20000,
        permits: 10000
      },
      confidence: 0.85,
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString()
    };

    return NextResponse.json(mockEstimation);

  } catch (error) {
    console.error('Estimation status API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 