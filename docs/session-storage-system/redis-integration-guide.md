# Redis Integration Guide for Session Storage (AWS ElastiCache)

## Overview
This guide explains how to use AWS ElastiCache for Redis as the session storage backend for your project creation flow. It covers AWS setup, local development, code changes, and troubleshooting.

---

## 1. Create an AWS ElastiCache Redis Cluster

1. Go to the [AWS ElastiCache Console](https://console.aws.amazon.com/elasticache/).
2. Click **Create** and select **Redis**.
3. Choose deployment type (Cluster Mode Disabled is fine for most dev/prod use cases).
4. Select a region, node type (e.g., `cache.t3.micro` for dev), and number of replicas (0 for dev).
5. Set up VPC, subnet group, and security group:
   - **VPC:** Use the same VPC as your backend server or development machine (if using AWS Cloud9/EC2).
   - **Security Group:** Allow inbound access on port 6379 from your IP or backend server's IP.
6. Click **Create**. Wait for the cluster to become available.
7. Copy the **Primary Endpoint** (host and port) from the cluster details.

> **Note:** For local development, you may need to set up an SSH tunnel or use an EC2 instance in the same VPC as the Redis cluster.

---

## 2. Install Redis Client in Your Project

For Node.js/TypeScript:
```bash
npm install redis
```

---

## 3. Configure Environment Variables

Add these to your `.env.local` or environment config:
```
REDIS_HOST=<your-elasticache-endpoint>
REDIS_PORT=6379
REDIS_PASSWORD= # (if you set one)
```

---

## 4. Create a Redis Session Storage Service

Create `frontend/lib/redisSessionStorage.ts`:
```typescript
import { createClient } from 'redis';

const redisClient = createClient({
  url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
  password: process.env.REDIS_PASSWORD || undefined,
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));

(async () => {
  if (!redisClient.isOpen) await redisClient.connect();
})();

const SESSION_PREFIX = 'project_session:';
const SESSION_TTL = 24 * 60 * 60; // 24 hours

export const redisSessionStorage = {
  async create(sessionData: any) {
    const sessionId = crypto.randomUUID();
    const key = `${SESSION_PREFIX}${sessionId}`;
    const session = {
      sessionId,
      ...sessionData,
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      expiresAt: new Date(Date.now() + SESSION_TTL * 1000).toISOString(),
    };
    await redisClient.setEx(key, SESSION_TTL, JSON.stringify(session));
    return sessionId;
  },
  async get(sessionId: string) {
    const key = `${SESSION_PREFIX}${sessionId}`;
    const data = await redisClient.get(key);
    if (!data) return null;
    const session = JSON.parse(data);
    // Optionally update lastActivity and extend TTL
    await redisClient.setEx(key, SESSION_TTL, JSON.stringify({ ...session, lastActivity: new Date().toISOString() }));
    return session;
  },
  async update(sessionId: string, sessionData: any) {
    const key = `${SESSION_PREFIX}${sessionId}`;
    const data = await redisClient.get(key);
    if (!data) throw new Error('Session not found');
    const session = JSON.parse(data);
    const updated = { ...session, ...sessionData, lastActivity: new Date().toISOString() };
    await redisClient.setEx(key, SESSION_TTL, JSON.stringify(updated));
  },
  async delete(sessionId: string) {
    const key = `${SESSION_PREFIX}${sessionId}`;
    await redisClient.del(key);
  },
};
```

---

## 5. Update API Routes to Use Redis

**Example for `frontend/app/api/project-session/route.ts`:**
```typescript
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
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { sessionId, projectData, currentStep, completedSteps } = body;
    await redisSessionStorage.update(sessionId, {
      projectData,
      currentStep,
      completedSteps
    });
    return NextResponse.json({ success: true, updatedAt: new Date() });
  } catch (error) {
    if (error instanceof Error && error.message === 'Session not found') {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to update session' }, { status: 500 });
  }
}
```

**Example for `frontend/app/api/project-session/[sessionId]/route.ts`:**
```typescript
import { NextResponse } from 'next/server';
import { redisSessionStorage } from '@/lib/redisSessionStorage';

export async function GET(
  request: Request,
  { params }: { params: { sessionId: string } }
) {
  try {
    const session = await redisSessionStorage.get(params.sessionId);
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }
    return NextResponse.json(session);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get session' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { sessionId: string } }
) {
  try {
    await redisSessionStorage.delete(params.sessionId);
    return NextResponse.json({ success: true, deletedAt: new Date() });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete session' }, { status: 500 });
  }
}
```

---

## 6. Test Your Integration

- Create a session via the UI or API.
- Refresh the page and verify session data persists.
- Check Redis with a CLI or GUI (e.g., `redis-cli`, RedisInsight):
  ```bash
  redis-cli -h <your-elasticache-endpoint> -p 6379
  keys project_session:*
  get project_session:<sessionId>
  ```

---

## 7. Troubleshooting & Tips

- **Connection refused?**
  - Check security group rules and VPC/subnet settings.
  - For local dev, use SSH tunnel or run backend in AWS EC2.
- **Timeouts?**
  - ElastiCache is only accessible within the same VPC by default.
- **Session not found after refresh?**
  - Ensure all API routes use the Redis storage, not in-memory.
- **Performance:**
  - Use `setEx` for TTL, avoid large session payloads.
- **Security:**
  - Never expose Redis to the public internet.
  - Use VPC, security groups, and/or SSH tunnels.

---

## 8. References
- [AWS ElastiCache for Redis Docs](https://docs.aws.amazon.com/elasticache/latest/red-ug/WhatIs.html)
- [Node.js redis client](https://www.npmjs.com/package/redis)
- [Next.js API Routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes)

---

## 9. Example `.env.local`
```
REDIS_HOST=your-redis-endpoint.amazonaws.com
REDIS_PORT=6379
REDIS_PASSWORD=
```

---

**You are now ready to use AWS ElastiCache Redis for robust, persistent session storage!** 