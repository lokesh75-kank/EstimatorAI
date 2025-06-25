# Session Storage System - Implementation Guide

## Quick Start Implementation

This guide provides step-by-step instructions to implement the temporary project storage system.

## Phase 1: Basic Implementation (In-Memory)

### Step 1: Create Session API Route

Create `frontend/app/api/project-session/route.ts`:

```typescript
import { NextResponse } from 'next/server';

// In-memory storage (replace with Redis in production)
const sessions = new Map<string, any>();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const sessionId = crypto.randomUUID();
    
    const session = {
      sessionId,
      projectData: body.projectData || {},
      currentStep: body.currentStep || 1,
      completedSteps: body.completedSteps || [],
      createdAt: new Date(),
      lastActivity: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    };
    
    sessions.set(sessionId, session);
    
    return NextResponse.json({ sessionId });
  } catch (error) {
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
    
    const session = sessions.get(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }
    
    session.projectData = { ...session.projectData, ...projectData };
    session.currentStep = currentStep;
    session.completedSteps = completedSteps;
    session.lastActivity = new Date();
    
    sessions.set(sessionId, session);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update session' },
      { status: 500 }
    );
  }
}
```

Create `frontend/app/api/project-session/[sessionId]/route.ts`:

```typescript
import { NextResponse } from 'next/server';

const sessions = new Map<string, any>();

export async function GET(
  request: Request,
  { params }: { params: { sessionId: string } }
) {
  try {
    const session = sessions.get(params.sessionId);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(session);
  } catch (error) {
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
    const deleted = sessions.delete(params.sessionId);
    
    if (!deleted) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete session' },
      { status: 500 }
    );
  }
}
```

### Step 2: Create Session Management Hook

Create `frontend/hooks/useProjectSession.ts`:

```typescript
import { useState, useEffect } from 'react';

interface ProjectFormData {
  projectName: string;
  projectDescription: string;
  buildingType: string;
  squareFootage: number;
  numberOfFloors: number;
  numberOfZones: number;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  projectLocation: string;
  estimatedStartDate: string;
  estimatedEndDate: string;
  budget: number;
  priority: 'low' | 'medium' | 'high';
}

export const useProjectSession = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [projectData, setProjectData] = useState<ProjectFormData | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  const createSession = async (initialData: Partial<ProjectFormData> = {}) => {
    setLoading(true);
    try {
      const response = await fetch('/api/project-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectData: initialData,
          currentStep: 1,
          completedSteps: []
        })
      });
      
      if (!response.ok) throw new Error('Failed to create session');
      
      const { sessionId } = await response.json();
      setSessionId(sessionId);
      localStorage.setItem('projectSessionId', sessionId);
      return sessionId;
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateSession = async (data: Partial<ProjectFormData>, step: number) => {
    if (!sessionId) return;
    
    setLoading(true);
    try {
      const updatedData = { ...projectData, ...data };
      setProjectData(updatedData);
      
      const response = await fetch('/api/project-session', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          projectData: updatedData,
          currentStep: step,
          completedSteps: [...completedSteps, step]
        })
      });
      
      if (!response.ok) throw new Error('Failed to update session');
    } catch (error) {
      console.error('Error updating session:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loadSession = async (id: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/project-session/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          // Session expired, create new one
          await createSession();
          return;
        }
        throw new Error('Failed to load session');
      }
      
      const session = await response.json();
      
      setSessionId(session.sessionId);
      setProjectData(session.projectData);
      setCurrentStep(session.currentStep);
      setCompletedSteps(session.completedSteps);
    } catch (error) {
      console.error('Error loading session:', error);
      // Fallback to new session
      await createSession();
    } finally {
      setLoading(false);
    }
  };

  const clearSession = async () => {
    if (sessionId) {
      try {
        await fetch(`/api/project-session/${sessionId}`, { method: 'DELETE' });
      } catch (error) {
        console.error('Error clearing session:', error);
      }
      localStorage.removeItem('projectSessionId');
      setSessionId(null);
      setProjectData(null);
      setCurrentStep(1);
      setCompletedSteps([]);
    }
  };

  return {
    sessionId,
    projectData,
    currentStep,
    completedSteps,
    loading,
    createSession,
    updateSession,
    loadSession,
    clearSession
  };
};
```

### Step 3: Update Project Creation Page

Update `frontend/app/projects/new/page.tsx`:

```typescript
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useProjectSession } from '@/hooks/useProjectSession';

const CreateProjectPage: React.FC = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const {
    sessionId,
    projectData,
    currentStep,
    completedSteps,
    loading,
    createSession,
    updateSession,
    loadSession,
    clearSession
  } = useProjectSession();

  // Initialize session on page load
  useEffect(() => {
    const savedSessionId = localStorage.getItem('projectSessionId');
    if (savedSessionId) {
      loadSession(savedSessionId);
    } else {
      createSession();
    }
  }, []);

  // Auto-save on step completion
  const handleStepComplete = async (stepData: Partial<ProjectFormData>) => {
    try {
      await updateSession(stepData, currentStep);
    } catch (error) {
      console.error('Auto-save failed:', error);
      // Don't show error to user for auto-save failures
    }
  };

  const handleNext = async () => {
    // Validate current step
    const errors = validateCurrentStep();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    // Auto-save current step
    await handleStepComplete(projectData || {});

    // Move to next step
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Validate all steps are complete
      if (completedSteps.length < 4) {
        throw new Error('Please complete all steps before creating the project');
      }

      // Save to permanent database
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create project');
      }

      const result = await response.json();
      
      // Clear session after successful creation
      await clearSession();
      
      // Redirect to project detail page
      router.push(`/projects/${result.project.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create project');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state
  if (loading && !projectData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading project session...</p>
        </div>
      </div>
    );
  }

  // Rest of the component remains the same...
};
```

### Step 4: Add Auto-Save to Form Components

Update form components to auto-save on change:

```typescript
// In ProjectDetailsStep component
const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
  const { name, value } = e.target;
  const newValue = e.target.type === 'number' ? Number(value) : value;
  
  setProjectData(prev => ({
    ...prev,
    [name]: newValue
  }));

  // Auto-save after a short delay
  clearTimeout(autoSaveTimeout.current);
  autoSaveTimeout.current = setTimeout(() => {
    handleStepComplete({ [name]: newValue });
  }, 1000); // 1 second delay
};
```

## Phase 2: Production Ready (Redis)

### Step 1: Install Redis Dependencies

```bash
# Install Redis
brew install redis  # macOS
sudo apt-get install redis-server  # Ubuntu

# Install Redis client
npm install redis
```

### Step 2: Create Redis Session Service

Create `backend/src/services/session.service.ts`:

```typescript
import Redis from 'redis';
import { v4 as uuidv4 } from 'uuid';

interface ProjectSession {
  sessionId: string;
  projectData: any;
  currentStep: number;
  completedSteps: number[];
  createdAt: Date;
  lastActivity: Date;
  expiresAt: Date;
}

export class SessionService {
  private redis: Redis.RedisClientType;
  private readonly SESSION_PREFIX = 'project_session:';
  private readonly SESSION_TTL = 24 * 60 * 60; // 24 hours

  constructor() {
    this.redis = Redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });
    
    this.redis.connect().catch(console.error);
  }

  async createSession(sessionData: Omit<ProjectSession, 'sessionId'>): Promise<string> {
    const sessionId = uuidv4();
    const key = `${this.SESSION_PREFIX}${sessionId}`;
    
    const session: ProjectSession = {
      sessionId,
      ...sessionData
    };
    
    await this.redis.setEx(
      key,
      this.SESSION_TTL,
      JSON.stringify(session)
    );
    
    return sessionId;
  }

  async getSession(sessionId: string): Promise<ProjectSession | null> {
    const key = `${this.SESSION_PREFIX}${sessionId}`;
    const data = await this.redis.get(key);
    
    if (!data) return null;
    
    return JSON.parse(data);
  }

  async updateSession(sessionId: string, sessionData: Partial<ProjectSession>): Promise<void> {
    const key = `${this.SESSION_PREFIX}${sessionId}`;
    const existing = await this.getSession(sessionId);
    
    if (!existing) throw new Error('Session not found');
    
    const updated = { 
      ...existing, 
      ...sessionData, 
      lastActivity: new Date() 
    };
    
    await this.redis.setEx(
      key,
      this.SESSION_TTL,
      JSON.stringify(updated)
    );
  }

  async deleteSession(sessionId: string): Promise<void> {
    const key = `${this.SESSION_PREFIX}${sessionId}`;
    await this.redis.del(key);
  }

  async cleanupExpiredSessions(): Promise<void> {
    // Redis automatically handles expiration
    // This method can be used for additional cleanup logic
  }
}
```

### Step 3: Update Frontend to Use Redis

Update the frontend API routes to use the backend session service:

```typescript
// frontend/app/api/project-session/route.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const response = await fetch(`${API_BASE_URL}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error('Failed to create session');
    }

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}
```

## Testing

### Unit Tests

Create `__tests__/session.test.ts`:

```typescript
import { SessionService } from '../src/services/session.service';

describe('SessionService', () => {
  let sessionService: SessionService;

  beforeEach(() => {
    sessionService = new SessionService();
  });

  test('should create session', async () => {
    const sessionData = {
      projectData: { projectName: 'Test Project' },
      currentStep: 1,
      completedSteps: [],
      createdAt: new Date(),
      lastActivity: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    };

    const sessionId = await sessionService.createSession(sessionData);
    expect(sessionId).toBeDefined();
    expect(typeof sessionId).toBe('string');
  });

  test('should retrieve session', async () => {
    const sessionData = {
      projectData: { projectName: 'Test Project' },
      currentStep: 1,
      completedSteps: [],
      createdAt: new Date(),
      lastActivity: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    };

    const sessionId = await sessionService.createSession(sessionData);
    const retrieved = await sessionService.getSession(sessionId);

    expect(retrieved).toBeDefined();
    expect(retrieved?.projectData.projectName).toBe('Test Project');
  });
});
```

### Integration Tests

Test the complete flow:

```typescript
describe('Project Creation Flow', () => {
  test('should auto-save on step completion', async () => {
    // Navigate to project creation page
    await page.goto('/projects/new');
    
    // Fill step 1
    await page.fill('[name="projectName"]', 'Test Project');
    await page.fill('[name="buildingType"]', 'office');
    await page.fill('[name="squareFootage"]', '1000');
    
    // Wait for auto-save
    await page.waitForTimeout(1500);
    
    // Refresh page
    await page.reload();
    
    // Check if data is restored
    await expect(page.locator('[name="projectName"]')).toHaveValue('Test Project');
  });
});
```

## Deployment

### Environment Variables

Add to `.env.local`:

```bash
# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=

# Session Configuration
SESSION_TTL=86400
SESSION_CLEANUP_INTERVAL=3600

# Security
SESSION_RATE_LIMIT=100
SESSION_MAX_ATTEMPTS=5
```

### Docker Compose

Add Redis to `docker-compose.yml`:

```yaml
version: '3.8'
services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes

  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - REDIS_URL=redis://redis:6379
    depends_on:
      - redis

volumes:
  redis_data:
```

## Monitoring

### Health Checks

Add health check endpoint:

```typescript
// backend/src/routes/health.routes.ts
router.get('/health', async (req, res) => {
  try {
    // Check Redis connectivity
    await sessionService.getSession('test');
    res.json({ status: 'healthy', redis: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'unhealthy', redis: 'disconnected' });
  }
});
```

### Metrics

Track session metrics:

```typescript
// Track session creation
const sessionMetrics = {
  created: 0,
  completed: 0,
  expired: 0,
  errors: 0
};

// Update metrics in session service
async createSession(data: any): Promise<string> {
  try {
    const sessionId = await this.redis.createSession(data);
    sessionMetrics.created++;
    return sessionId;
  } catch (error) {
    sessionMetrics.errors++;
    throw error;
  }
}
```

This implementation guide provides a complete path from basic in-memory storage to production-ready Redis-based session management. 