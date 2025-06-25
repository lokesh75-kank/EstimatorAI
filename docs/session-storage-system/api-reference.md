# Session Storage System - API Reference

## Overview

This document provides detailed API specifications for the Temporary Project Storage System.

## Base URL

```
Development: http://localhost:3001/api
Production: https://your-domain.com/api
```

## Authentication

All endpoints require a valid session ID in the request body or URL parameters.

## Data Types

### ProjectSession

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
  expiresAt: Date;
  metadata: {
    userAgent: string;
    ipAddress: string;
    deviceInfo: string;
  };
}
```

### ProjectFormData

```typescript
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

### Error Response

```typescript
interface ErrorResponse {
  error: string;
  code?: string;
  details?: any;
  timestamp: string;
}
```

## Endpoints

### 1. Create Session

Creates a new project creation session.

**Endpoint:** `POST /sessions`

**Request Body:**
```json
{
  "projectData": {
    "projectName": "Sample Project",
    "buildingType": "office",
    "squareFootage": 1000
  },
  "currentStep": 1,
  "completedSteps": []
}
```

**Response (201 Created):**
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "createdAt": "2024-01-15T10:30:00Z",
  "expiresAt": "2024-01-16T10:30:00Z"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid request data
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

**Example:**
```bash
curl -X POST http://localhost:3001/api/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "projectData": {
      "projectName": "New Office Building",
      "buildingType": "office"
    },
    "currentStep": 1,
    "completedSteps": []
  }'
```

### 2. Get Session

Retrieves an existing session by ID.

**Endpoint:** `GET /sessions/{sessionId}`

**Path Parameters:**
- `sessionId` (string, required) - The session ID

**Response (200 OK):**
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "projectData": {
    "projectName": "Sample Project",
    "buildingType": "office",
    "squareFootage": 1000,
    "clientName": "John Doe",
    "clientEmail": "john@example.com"
  },
  "currentStep": 2,
  "completedSteps": [1],
  "validationStatus": {
    "step1": true,
    "step2": false,
    "step3": false,
    "step4": false
  },
  "createdAt": "2024-01-15T10:30:00Z",
  "lastActivity": "2024-01-15T11:45:00Z",
  "expiresAt": "2024-01-16T10:30:00Z",
  "metadata": {
    "userAgent": "Mozilla/5.0...",
    "ipAddress": "192.168.1.1",
    "deviceInfo": "macOS"
  }
}
```

**Error Responses:**
- `404 Not Found` - Session not found
- `410 Gone` - Session expired
- `500 Internal Server Error` - Server error

**Example:**
```bash
curl -X GET http://localhost:3001/api/sessions/550e8400-e29b-41d4-a716-446655440000
```

### 3. Update Session

Updates an existing session with new data.

**Endpoint:** `PUT /sessions`

**Request Body:**
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "projectData": {
    "projectName": "Updated Project Name",
    "clientPhone": "+1234567890"
  },
  "currentStep": 3,
  "completedSteps": [1, 2]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "updatedAt": "2024-01-15T12:00:00Z"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid request data
- `404 Not Found` - Session not found
- `410 Gone` - Session expired
- `500 Internal Server Error` - Server error

**Example:**
```bash
curl -X PUT http://localhost:3001/api/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "550e8400-e29b-41d4-a716-446655440000",
    "projectData": {
      "projectName": "Updated Project"
    },
    "currentStep": 2,
    "completedSteps": [1]
  }'
```

### 4. Delete Session

Deletes a session and cleans up all associated data.

**Endpoint:** `DELETE /sessions/{sessionId}`

**Path Parameters:**
- `sessionId` (string, required) - The session ID

**Response (200 OK):**
```json
{
  "success": true,
  "deletedAt": "2024-01-15T12:30:00Z"
}
```

**Error Responses:**
- `404 Not Found` - Session not found
- `500 Internal Server Error` - Server error

**Example:**
```bash
curl -X DELETE http://localhost:3001/api/sessions/550e8400-e29b-41d4-a716-446655440000
```

### 5. Validate Session

Validates session data and returns validation status.

**Endpoint:** `POST /sessions/{sessionId}/validate`

**Request Body:**
```json
{
  "step": 1,
  "data": {
    "projectName": "Sample Project",
    "buildingType": "office",
    "squareFootage": 1000
  }
}
```

**Response (200 OK):**
```json
{
  "valid": true,
  "errors": [],
  "warnings": [
    "Consider adding a project description for better documentation"
  ],
  "validationStatus": {
    "step1": true,
    "step2": false,
    "step3": false,
    "step4": false
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "valid": false,
  "errors": [
    "Project name is required",
    "Square footage must be greater than 0"
  ],
  "warnings": [],
  "validationStatus": {
    "step1": false,
    "step2": false,
    "step3": false,
    "step4": false
  }
}
```

**Example:**
```bash
curl -X POST http://localhost:3001/api/sessions/550e8400-e29b-41d4-a716-446655440000/validate \
  -H "Content-Type: application/json" \
  -d '{
    "step": 1,
    "data": {
      "projectName": "Sample Project",
      "buildingType": "office"
    }
  }'
```

### 6. Health Check

Checks the health status of the session service.

**Endpoint:** `GET /sessions/health`

**Response (200 OK):**
```json
{
  "status": "healthy",
  "redis": "connected",
  "uptime": 3600,
  "activeSessions": 15,
  "totalSessions": 150,
  "expiredSessions": 5,
  "timestamp": "2024-01-15T12:00:00Z"
}
```

**Error Response (503 Service Unavailable):**
```json
{
  "status": "unhealthy",
  "redis": "disconnected",
  "error": "Redis connection failed",
  "timestamp": "2024-01-15T12:00:00Z"
}
```

**Example:**
```bash
curl -X GET http://localhost:3001/api/sessions/health
```

## Validation Rules

### Step 1: Project Details

| Field | Type | Required | Validation Rules |
|-------|------|----------|------------------|
| projectName | string | Yes | Max 100 characters, alphanumeric + spaces |
| projectDescription | string | No | Max 500 characters |
| buildingType | string | Yes | Must be one of: office, residential, industrial, retail, healthcare, education |
| squareFootage | number | Yes | > 0, < 1,000,000 |
| numberOfFloors | number | Yes | > 0, < 100 |
| numberOfZones | number | Yes | > 0, < 50 |
| clientName | string | Yes | Max 100 characters |
| clientEmail | string | No | Valid email format |
| clientPhone | string | No | Valid phone format |
| projectLocation | string | Yes | Max 200 characters |
| estimatedStartDate | string | No | Valid date, future date |
| estimatedEndDate | string | No | Valid date, after start date |
| budget | number | No | >= 0 |
| priority | string | No | Must be: low, medium, high |

### Step 2: Requirements

| Field | Type | Required | Validation Rules |
|-------|------|----------|------------------|
| documents | array | Yes | At least one document |
| documentTypes | array | Yes | Valid document types |
| fileSizes | array | Yes | Each file < 10MB |

### Step 3: Data Sources

| Field | Type | Required | Validation Rules |
|-------|------|----------|------------------|
| aiSourcing | boolean | Yes | true/false |
| connectors | array | No | Valid connector configurations |

### Step 4: Review & Create

| Field | Type | Required | Validation Rules |
|-------|------|----------|------------------|
| allStepsComplete | boolean | Yes | Must be true |
| dataIntegrity | boolean | Yes | Must be true |

## Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| SESSION_NOT_FOUND | Session does not exist | 404 |
| SESSION_EXPIRED | Session has expired | 410 |
| INVALID_STEP | Invalid step number | 400 |
| VALIDATION_FAILED | Data validation failed | 400 |
| RATE_LIMIT_EXCEEDED | Too many requests | 429 |
| STORAGE_ERROR | Storage service error | 500 |
| INVALID_SESSION_ID | Invalid session ID format | 400 |

## Rate Limiting

- **Session Creation:** 10 requests per minute per IP
- **Session Updates:** 60 requests per minute per session
- **Session Retrieval:** 100 requests per minute per session
- **Session Deletion:** 5 requests per minute per session

## Session Expiration

- **Default TTL:** 24 hours from creation
- **Activity Extension:** Last activity extends TTL by 1 hour
- **Maximum TTL:** 48 hours total
- **Cleanup:** Automatic cleanup every hour

## Security Headers

All responses include the following security headers:

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

## CORS Configuration

```typescript
{
  origin: ['http://localhost:3000', 'https://your-domain.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400
}
```

## Monitoring & Metrics

### Available Metrics

- `sessions_created_total` - Total sessions created
- `sessions_completed_total` - Total sessions completed
- `sessions_expired_total` - Total sessions expired
- `sessions_active_current` - Currently active sessions
- `session_operations_duration_seconds` - Operation duration histogram
- `session_validation_errors_total` - Total validation errors

### Logging

All API operations are logged with the following structure:

```json
{
  "timestamp": "2024-01-15T12:00:00Z",
  "level": "info",
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "operation": "create",
  "duration": 150,
  "status": "success",
  "ipAddress": "192.168.1.1",
  "userAgent": "Mozilla/5.0..."
}
```

## SDK Examples

### JavaScript/TypeScript

```typescript
class SessionClient {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:3001/api') {
    this.baseUrl = baseUrl;
  }

  async createSession(data: any): Promise<string> {
    const response = await fetch(`${this.baseUrl}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`Failed to create session: ${response.statusText}`);
    }

    const result = await response.json();
    return result.sessionId;
  }

  async getSession(sessionId: string): Promise<ProjectSession> {
    const response = await fetch(`${this.baseUrl}/sessions/${sessionId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to get session: ${response.statusText}`);
    }

    return response.json();
  }

  async updateSession(sessionId: string, data: any): Promise<void> {
    const response = await fetch(`${this.baseUrl}/sessions`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, ...data })
    });

    if (!response.ok) {
      throw new Error(`Failed to update session: ${response.statusText}`);
    }
  }

  async deleteSession(sessionId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/sessions/${sessionId}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error(`Failed to delete session: ${response.statusText}`);
    }
  }
}

// Usage
const client = new SessionClient();
const sessionId = await client.createSession({
  projectData: { projectName: 'Test Project' },
  currentStep: 1,
  completedSteps: []
});
```

### Python

```python
import requests
import json
from typing import Dict, Any

class SessionClient:
    def __init__(self, base_url: str = "http://localhost:3001/api"):
        self.base_url = base_url

    def create_session(self, data: Dict[str, Any]) -> str:
        response = requests.post(
            f"{self.base_url}/sessions",
            json=data,
            headers={"Content-Type": "application/json"}
        )
        response.raise_for_status()
        return response.json()["sessionId"]

    def get_session(self, session_id: str) -> Dict[str, Any]:
        response = requests.get(f"{self.base_url}/sessions/{session_id}")
        response.raise_for_status()
        return response.json()

    def update_session(self, session_id: str, data: Dict[str, Any]) -> None:
        response = requests.put(
            f"{self.base_url}/sessions",
            json={"sessionId": session_id, **data},
            headers={"Content-Type": "application/json"}
        )
        response.raise_for_status()

    def delete_session(self, session_id: str) -> None:
        response = requests.delete(f"{self.base_url}/sessions/{session_id}")
        response.raise_for_status()

# Usage
client = SessionClient()
session_id = client.create_session({
    "projectData": {"projectName": "Test Project"},
    "currentStep": 1,
    "completedSteps": []
})
```

## Troubleshooting

### Common Issues

1. **Session Not Found (404)**
   - Check if session ID is correct
   - Verify session hasn't expired
   - Ensure session was created successfully

2. **Session Expired (410)**
   - Session TTL exceeded
   - Create new session and start over
   - Consider implementing session recovery

3. **Rate Limit Exceeded (429)**
   - Implement exponential backoff
   - Reduce request frequency
   - Check rate limit headers

4. **Validation Errors (400)**
   - Review validation rules
   - Check data types and formats
   - Ensure required fields are provided

### Debug Headers

Include `X-Debug: true` header for additional debug information:

```bash
curl -H "X-Debug: true" http://localhost:3001/api/sessions/health
```

### Health Check

Always check service health before troubleshooting:

```bash
curl http://localhost:3001/api/sessions/health
``` 