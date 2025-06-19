import { NextResponse } from 'next/server';
import { redisSessionStorage } from '@/lib/redisSessionStorage';

export async function GET() {
  try {
    const health = await redisSessionStorage.healthCheck();
    
    if (health.status === 'healthy') {
      return NextResponse.json({
        status: 'healthy',
        redis: 'connected',
        sessionCount: health.sessionCount,
        timestamp: new Date().toISOString()
      });
    } else {
      return NextResponse.json({
        status: 'unhealthy',
        redis: 'disconnected',
        error: 'Redis connection failed',
        timestamp: new Date().toISOString()
      }, { status: 503 });
    }
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json({
      status: 'unhealthy',
      redis: 'disconnected',
      error: 'Health check failed',
      timestamp: new Date().toISOString()
    }, { status: 503 });
  }
} 