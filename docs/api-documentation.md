# API Documentation

## Base URL
```
http://localhost:8000/api/v1
```

## Authentication
All endpoints require authentication using a Bearer token in the Authorization header:
```
Authorization: Bearer <your_token>
```

## Endpoints

### Projects

#### Create Project
```http
POST /projects/
```
Request body:
```json
{
  "name": "Project Name",
  "client_name": "Client Name",
  "location": "Project Location",
  "systems": [
    {
      "name": "Fire Alarm System",
      "type": "fire",
      "components": ["Control Panel", "Smoke Detectors"]
    }
  ]
}
```
Response:
```json
{
  "id": "project_id",
  "name": "Project Name",
  "client_name": "Client Name",
  "location": "Project Location",
  "systems": [...],
  "created_at": "2024-03-21T10:00:00Z"
}
```

#### Get Project
```http
GET /projects/{project_id}/
```
Response:
```json
{
  "id": "project_id",
  "name": "Project Name",
  "client_name": "Client Name",
  "location": "Project Location",
  "systems": [...],
  "created_at": "2024-03-21T10:00:00Z"
}
```

#### List Projects
```http
GET /projects/
```
Query parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `sort`: Sort field (default: created_at)
- `order`: Sort order (asc/desc, default: desc)

Response:
```json
{
  "items": [...],
  "total": 100,
  "page": 1,
  "limit": 10
}
```

### Estimates

#### Generate Estimate
```http
POST /estimates/generate/
```
Request body:
```json
{
  "project_id": "project_id",
  "options": {
    "include_installation": true,
    "include_maintenance": true
  }
}
```
Response:
```json
{
  "id": "estimate_id",
  "project_id": "project_id",
  "total_cost": 50000.00,
  "breakdown": {
    "materials": 30000.00,
    "labor": 15000.00,
    "maintenance": 5000.00
  },
  "created_at": "2024-03-21T10:00:00Z"
}
```

#### Get Estimate
```http
GET /estimates/{estimate_id}/
```
Response:
```json
{
  "id": "estimate_id",
  "project_id": "project_id",
  "total_cost": 50000.00,
  "breakdown": {...},
  "created_at": "2024-03-21T10:00:00Z"
}
```

### Proposals

#### Generate Proposal
```http
POST /proposals/generate/
```
Request body:
```json
{
  "estimate_id": "estimate_id",
  "template": "standard",
  "options": {
    "include_terms": true,
    "include_warranty": true
  }
}
```
Response:
```json
{
  "id": "proposal_id",
  "estimate_id": "estimate_id",
  "document_url": "https://example.com/proposals/proposal_id.pdf",
  "created_at": "2024-03-21T10:00:00Z"
}
```

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Bad Request",
  "message": "Invalid request parameters",
  "details": {...}
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
``` 