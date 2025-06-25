# Temporary Project Storage System

## Overview

The Temporary Project Storage System is designed to store project creation data temporarily during the multi-step wizard process. Project data is only permanently saved to the database after all steps are completed successfully.

## Problem Statement

### Current Issues
- Project data is only saved at the final step
- No way to recover incomplete projects
- Data loss on page refresh or browser crash
- No validation between steps
- Incomplete projects clutter the database

### Requirements
- ✅ Temporary storage during wizard flow
- ✅ Auto-save on each step completion
- ✅ Session recovery on page refresh
- ✅ Data validation between steps
- ✅ Automatic cleanup of abandoned sessions
- ✅ Only complete projects saved permanently

## Architecture

### System Components

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Session API    │    │   Storage       │
│   (React)       │◄──►│   (Next.js)      │◄──►│   (Redis/Memory)│
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Step 1-4      │    │   Session CRUD   │    │   Temporary     │
│   Auto-save     │    │   Operations     │    │   Data Store    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Data Flow

1. **User starts project creation** → Session created
2. **User completes each step** → Auto-save to session
3. **User navigates between steps** → Load from session
4. **User refreshes page** → Recover from session
5. **User completes all steps** → Save to permanent database
6. **Session cleanup** → Remove temporary data

## Implementation

### 1. Session Data Structure

```typescript
interface ProjectSession {
  sessionId: string;
  projectData: ProjectFormData;
  currentStep: number;
  completedSteps: number[];
  validationStatus: {
    step1: boolean;
    step2: boolean;
    step3: boolean;
    step4: boolean;
  };
  createdAt: Date;
  lastActivity: Date;
  expiresAt: Date; // 24 hours from creation
  metadata: {
    userAgent: string;
    ipAddress: string;
    deviceInfo: string;
  };
}

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
```

### 2. API Endpoints

#### Create Session
```http
POST /api/project-session
Content-Type: application/json

{
  "projectData": {},
  "currentStep": 1,
  "completedSteps": []
}
```

#### Update Session
```http
PUT /api/project-session
Content-Type: application/json

{
  "sessionId": "uuid",
  "projectData": {...},
  "currentStep": 2,
  "completedSteps": [1]
}
```

#### Get Session
```http
GET /api/project-session/[sessionId]
```

#### Delete Session
```http
DELETE /api/project-session/[sessionId]
```

### 3. Frontend Implementation

#### Session Management Hook
```typescript
// hooks/useProjectSession.ts
export const useProjectSession = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [projectData, setProjectData] = useState<ProjectFormData | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const createSession = async (initialData: Partial<ProjectFormData>) => {
    const response = await fetch('/api/project-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectData: initialData,
        currentStep: 1,
        completedSteps: []
      })
    });
    
    const { sessionId } = await response.json();
    setSessionId(sessionId);
    localStorage.setItem('projectSessionId', sessionId);
    return sessionId;
  };

  const updateSession = async (data: Partial<ProjectFormData>, step: number) => {
    if (!sessionId) return;
    
    const updatedData = { ...projectData, ...data };
    setProjectData(updatedData);
    
    await fetch('/api/project-session', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        projectData: updatedData,
        currentStep: step,
        completedSteps: [...completedSteps, step]
      })
    });
  };

  const loadSession = async (id: string) => {
    const response = await fetch(`/api/project-session/${id}`);
    const session = await response.json();
    
    setSessionId(session.sessionId);
    setProjectData(session.projectData);
    setCurrentStep(session.currentStep);
    setCompletedSteps(session.completedSteps);
  };

  const clearSession = async () => {
    if (sessionId) {
      await fetch(`/api/project-session/${sessionId}`, { method: 'DELETE' });
      localStorage.removeItem('projectSessionId');
      setSessionId(null);
      setProjectData(null);
    }
  };

  return {
    sessionId,
    projectData,
    currentStep,
    completedSteps,
    createSession,
    updateSession,
    loadSession,
    clearSession
  };
};
```

#### Project Creation Page Integration
```typescript
// app/projects/new/page.tsx
const CreateProjectPage: React.FC = () => {
  const {
    sessionId,
    projectData,
    currentStep,
    completedSteps,
    createSession,
    updateSession,
    loadSession,
    clearSession
  } = useProjectSession();

  // Auto-save on step completion
  const handleStepComplete = async (stepData: Partial<ProjectFormData>) => {
    await updateSession(stepData, currentStep);
  };

  // Load existing session on page load
  useEffect(() => {
    const savedSessionId = localStorage.getItem('projectSessionId');
    if (savedSessionId) {
      loadSession(savedSessionId);
    } else {
      createSession({});
    }
  }, []);

  // Final project creation
  const handleFinalSubmit = async () => {
    if (completedSteps.length < 4) {
      throw new Error('Please complete all steps');
    }

    // Save to permanent database
    const response = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projectData)
    });

    // Clear session
    await clearSession();

    // Redirect to project page
    const result = await response.json();
    router.push(`/projects/${result.project.id}`);
  };
};
```

### 4. Backend Implementation

#### Session Service
```typescript
// backend/src/services/session.service.ts
export class SessionService {
  private redis: Redis;
  private readonly SESSION_PREFIX = 'project_session:';
  private readonly SESSION_TTL = 24 * 60 * 60; // 24 hours

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD
    });
  }

  async createSession(sessionData: ProjectSession): Promise<string> {
    const sessionId = uuidv4();
    const key = `${this.SESSION_PREFIX}${sessionId}`;
    
    await this.redis.setex(
      key,
      this.SESSION_TTL,
      JSON.stringify(sessionData)
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
    
    const updated = { ...existing, ...sessionData, lastActivity: new Date() };
    
    await this.redis.setex(
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

#### Session Controller
```typescript
// backend/src/controllers/session.controller.ts
export class SessionController {
  private sessionService: SessionService;

  constructor() {
    this.sessionService = new SessionService();
  }

  async createSession(req: Request, res: Response) {
    try {
      const { projectData, currentStep, completedSteps } = req.body;
      
      const session: ProjectSession = {
        sessionId: '',
        projectData,
        currentStep,
        completedSteps,
        validationStatus: {
          step1: false,
          step2: false,
          step3: false,
          step4: false
        },
        createdAt: new Date(),
        lastActivity: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        metadata: {
          userAgent: req.headers['user-agent'] || '',
          ipAddress: req.ip || '',
          deviceInfo: req.headers['sec-ch-ua-platform'] || ''
        }
      };

      const sessionId = await this.sessionService.createSession(session);
      
      res.status(201).json({ sessionId });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create session' });
    }
  }

  async getSession(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      const session = await this.sessionService.getSession(sessionId);
      
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }
      
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get session' });
    }
  }

  async updateSession(req: Request, res: Response) {
    try {
      const { sessionId, projectData, currentStep, completedSteps } = req.body;
      
      await this.sessionService.updateSession(sessionId, {
        projectData,
        currentStep,
        completedSteps,
        lastActivity: new Date()
      });
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update session' });
    }
  }

  async deleteSession(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      await this.sessionService.deleteSession(sessionId);
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete session' });
    }
  }
}
```

## Storage Options

### Option 1: Redis (Recommended for Production)

**Benefits:**
- ✅ Persistent across server restarts
- ✅ Automatic expiration
- ✅ High performance
- ✅ Scalable
- ✅ Built-in session management

**Setup:**
```bash
# Install Redis
brew install redis  # macOS
sudo apt-get install redis-server  # Ubuntu

# Install Redis client
npm install redis
```

### Option 2: In-Memory Storage (Development/Testing)

**Benefits:**
- ✅ Simple implementation
- ✅ No external dependencies
- ✅ Fast access
- ❌ Lost on server restart

**Implementation:**
```typescript
class InMemorySessionService {
  private sessions = new Map<string, ProjectSession>();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Cleanup expired sessions every hour
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredSessions();
    }, 60 * 60 * 1000);
  }

  private cleanupExpiredSessions() {
    const now = new Date();
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.expiresAt < now) {
        this.sessions.delete(sessionId);
      }
    }
  }
}
```

## Validation Rules

### Step 1: Project Details
- ✅ Project name (required, max 100 chars)
- ✅ Building type (required)
- ✅ Square footage (required, > 0, < 1M)
- ✅ Email format validation (if provided)
- ✅ Budget validation (non-negative)

### Step 2: Requirements
- ✅ At least one document uploaded
- ✅ Document format validation
- ✅ File size limits

### Step 3: Data Sources
- ✅ AI sourcing enabled/disabled
- ✅ Manual connectors configured (optional)

### Step 4: Review & Create
- ✅ All previous steps completed
- ✅ Data integrity check
- ✅ Final validation

## Error Handling

### Session Errors
```typescript
enum SessionError {
  SESSION_NOT_FOUND = 'SESSION_NOT_FOUND',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  INVALID_STEP = 'INVALID_STEP',
  VALIDATION_FAILED = 'VALIDATION_FAILED'
}
```

### Recovery Strategies
1. **Session not found** → Create new session
2. **Session expired** → Clear and restart
3. **Invalid step** → Redirect to last valid step
4. **Validation failed** → Show error and allow retry

## Security Considerations

### Session Security
- ✅ Session ID generation using UUID v4
- ✅ Session expiration (24 hours)
- ✅ IP address tracking
- ✅ User agent validation
- ✅ Rate limiting on session creation

### Data Protection
- ✅ No sensitive data in session storage
- ✅ Encrypted storage (Redis with SSL)
- ✅ Automatic cleanup
- ✅ Access logging

## Monitoring & Analytics

### Metrics to Track
- Session creation rate
- Session completion rate
- Step abandonment rate
- Session expiration rate
- Error rates by step

### Logging
```typescript
interface SessionLog {
  sessionId: string;
  action: 'create' | 'update' | 'delete' | 'expire';
  step: number;
  timestamp: Date;
  duration?: number;
  success: boolean;
  error?: string;
}
```

## Implementation Timeline

### Phase 1: Basic Implementation (1-2 days)
- [ ] Session service (in-memory)
- [ ] Frontend session hook
- [ ] Auto-save functionality
- [ ] Basic validation

### Phase 2: Production Ready (2-3 days)
- [ ] Redis integration
- [ ] Error handling
- [ ] Security measures
- [ ] Monitoring

### Phase 3: Enhanced Features (1-2 days)
- [ ] Analytics dashboard
- [ ] Advanced validation
- [ ] Performance optimization
- [ ] Documentation

## Testing Strategy

### Unit Tests
- Session service methods
- Validation rules
- Error handling

### Integration Tests
- End-to-end flow
- Session persistence
- Auto-save functionality

### Performance Tests
- Concurrent sessions
- Memory usage
- Response times

## Deployment Considerations

### Environment Variables
```bash
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Session Configuration
SESSION_TTL=86400  # 24 hours
SESSION_CLEANUP_INTERVAL=3600  # 1 hour

# Security
SESSION_RATE_LIMIT=100  # per minute
SESSION_MAX_ATTEMPTS=5  # per IP
```

### Health Checks
- Redis connectivity
- Session service availability
- Memory usage monitoring
- Error rate monitoring

## Conclusion

The Temporary Project Storage System provides a robust solution for managing project creation data during the multi-step wizard process. It ensures data integrity, user experience, and system performance while maintaining security and scalability.

The session-based approach allows users to safely navigate between steps, recover from interruptions, and only commit complete projects to the permanent database. 