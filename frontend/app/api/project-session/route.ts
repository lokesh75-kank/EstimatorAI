import { NextResponse } from 'next/server';
import { redisSessionStorage } from '@/lib/redisSessionStorage';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const sessionId = await redisSessionStorage.create({
      projectData: body.projectData || {},
      currentStep: body.currentStep || 1,
      completedSteps: body.completedSteps || [],
      validationStatus: {
        step1: false,
        step2: false,
        step3: false,
        step4: false
      }
    });
    
    const session = await redisSessionStorage.get(sessionId);
    
    return NextResponse.json({ 
      sessionId,
      createdAt: session?.createdAt,
      expiresAt: session?.expiresAt
    });
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { sessionId, projectData, currentStep, completedSteps } = body;
    
    console.log('Updating session:', sessionId);
    console.log('New projectData:', projectData);
    
    const existingSession = await redisSessionStorage.get(sessionId);
    if (!existingSession) {
      throw new Error('Session not found');
    }
    
    console.log('Existing projectData:', existingSession.projectData);
    
    // Merge project data properly, ensuring uploadedFiles are preserved
    const mergedProjectData = {
      ...existingSession.projectData,
      ...projectData,
      // Ensure uploadedFiles are properly merged
      uploadedFiles: projectData.uploadedFiles || existingSession.projectData.uploadedFiles || []
    };
    
    console.log('Merged projectData:', mergedProjectData);
    console.log('Merged uploadedFiles:', mergedProjectData.uploadedFiles);
    
    await redisSessionStorage.update(sessionId, {
      projectData: mergedProjectData,
      currentStep,
      completedSteps
    });
    
    return NextResponse.json({ 
      success: true,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating session:', error);
    if (error instanceof Error && error.message === 'Session not found') {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    } else if (error instanceof Error && error.message === 'Session expired') {
      return NextResponse.json(
        { error: 'Session expired' },
        { status: 410 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update session' },
      { status: 500 }
    );
  }
} 