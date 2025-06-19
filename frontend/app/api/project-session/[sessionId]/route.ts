import { NextResponse } from 'next/server';
import { redisSessionStorage } from '@/lib/redisSessionStorage';

export async function GET(
  request: Request,
  { params }: { params: { sessionId: string } }
) {
  try {
    console.log('GET session request for ID:', params.sessionId);
    console.log('Available sessions:', await redisSessionStorage.getAll());
    
    const session = await redisSessionStorage.get(params.sessionId);
    
    if (!session) {
      console.log('Session not found:', params.sessionId);
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }
    
    console.log('Session found and returned:', params.sessionId);
    return NextResponse.json(session);
  } catch (error) {
    console.error('Error getting session:', error);
    return NextResponse.json(
      { error: 'Failed to get session' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { sessionId: string } }
) {
  try {
    const deleted = await redisSessionStorage.delete(params.sessionId);
    
    if (!deleted) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true,
      deletedAt: new Date()
    });
  } catch (error) {
    console.error('Error deleting session:', error);
    return NextResponse.json(
      { error: 'Failed to delete session' },
      { status: 500 }
    );
  }
} 