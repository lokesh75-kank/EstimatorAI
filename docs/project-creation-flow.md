# Project Creation Flow - Complete Guide

## Overview

The project creation wizard is a 4-step process that collects project information, uploads documents, and creates a project for AI-powered cost estimation. This document explains the complete flow from file upload to AI processing.

## Flow Summary

```
User Uploads Files → Files Stored Locally → Project Created → AI Processes Files → Cost Estimation
```

## Step-by-Step Flow

### 1. **File Upload (Step 2: Requirements)**

**What happens:**
- User drags & drops or selects files (PDF, DOCX, JPG, PNG, ZIP)
- Files are uploaded to `/api/documents/upload`
- Files are stored in `uploads/` directory with unique names
- File metadata is saved to Redis session
- Files are served via `/api/uploads/{filename}`

**File Storage:**
```
project-root/
├── uploads/                    # Physical file storage
│   ├── 1703123456789-abc123.pdf
│   ├── 1703123456790-def456.docx
│   └── 1703123456791-ghi789.zip
```

**Session Storage (Redis):**
```json
{
  "uploadedFiles": [
    {
      "id": "file-1",
      "name": "project-specs.pdf",
      "size": 1024000,
      "type": "application/pdf",
      "url": "/api/uploads/1703123456789-abc123.pdf",
      "status": "success"
    }
  ]
}
```

### 2. **Project Creation (Step 4: Review & Create)**

**What happens:**
- User reviews all project information including uploaded files
- Clicks "Create Project" button
- System validates all required data
- Project is created in backend database
- File metadata is included in project record
- Session is cleared
- User is redirected to project detail page

**Project Data Structure:**
```json
{
  "projectName": "Downtown Office Building",
  "buildingType": "Office Building",
  "squareFootage": 50000,
  "requirements": {
    "uploadedFiles": [
      {
        "id": "file-1",
        "name": "project-specs.pdf",
        "size": 1024000,
        "type": "application/pdf",
        "url": "/api/uploads/1703123456789-abc123.pdf",
        "status": "success"
      }
    ]
  },
  "metadata": {
    "files": [
      {
        "id": "file-1",
        "name": "project-specs.pdf",
        "size": 1024000,
        "type": "application/pdf",
        "url": "/api/uploads/1703123456789-abc123.pdf",
        "status": "success",
        "uploadedAt": "2024-01-15T12:00:00Z"
      }
    ]
  }
}
```

### 3. **AI Processing (After Project Creation)**

**What happens:**
- AI system reads project data from database
- AI accesses uploaded files from `uploads/` directory
- AI processes documents to extract:
  - Project requirements
  - Technical specifications
  - Building details
  - Equipment requirements
- AI generates cost estimates and BOM

**AI Processing Flow:**
```
1. Read project metadata from database
2. Access files: /api/uploads/{filename}
3. Process documents (OCR, text extraction, etc.)
4. Extract requirements and specifications
5. Generate cost estimates
6. Create Bill of Materials (BOM)
7. Update project with results
```

## File Storage Architecture

### **Local File System (Development)**

**Location:** `uploads/` directory in project root

**Benefits:**
- ✅ No external dependencies
- ✅ Fast uploads (no network latency)
- ✅ Easy debugging and file access
- ✅ Cost-effective (no storage costs)
- ✅ Works offline

**File Naming Convention:**
```
{timestamp}-{randomString}.{extension}
Example: 1703123456789-abc123.pdf
```

**Security Features:**
- File type validation
- File size limits (20MB)
- Directory traversal prevention
- Unique filename generation

### **File Serving**

**API Endpoint:** `GET /api/uploads/{filename}`

**Features:**
- Secure file serving
- Proper content types
- Caching headers (1 hour)
- Error handling

**Example Usage:**
```javascript
// Access uploaded file
const fileUrl = "/api/uploads/1703123456789-abc123.pdf";
window.open(fileUrl, '_blank');
```

## Session Integration

### **Redis Session Storage**

Files are integrated with the Redis-based session system:

```typescript
interface ProjectFormData {
  // ... other project fields
  uploadedFiles?: Array<{
    id: string;
    name: string;
    size: number;
    type: string;
    url: string;
    status: 'uploading' | 'success' | 'error';
    error?: string;
  }>;
}
```

### **Session Lifecycle**

1. **Creation:** Session created when user starts project
2. **File Upload:** Files added to session as they're uploaded
3. **Auto-save:** Session automatically saves file metadata
4. **Project Creation:** Session data used to create project
5. **Cleanup:** Session cleared after successful project creation

## API Endpoints

### **File Upload**
```
POST /api/documents/upload
Content-Type: multipart/form-data

Request:
- file: File object

Response:
{
  "success": true,
  "file": {
    "originalName": "document.pdf",
    "storedName": "1703123456789-abc123.pdf",
    "fileUrl": "/api/uploads/1703123456789-abc123.pdf"
  }
}
```

### **File Serving**
```
GET /api/uploads/{filename}

Response:
- File content with appropriate headers
- Content-Type based on file extension
- Cache-Control: public, max-age=3600
```

### **Project Creation**
```
POST /api/projects
Content-Type: application/json

Request:
{
  "projectName": "Project Name",
  "uploadedFiles": [...],
  // ... other project data
}

Response:
{
  "success": true,
  "project": { ... }
}
```

## AI Processing Integration

### **File Access for AI**

The AI system can access uploaded files through:

1. **Direct File System Access:**
   ```bash
   # AI reads files directly from uploads directory
   /path/to/project/uploads/1703123456789-abc123.pdf
   ```

2. **API Access:**
   ```javascript
   // AI fetches files via API
   const response = await fetch('/api/uploads/1703123456789-abc123.pdf');
   const fileBuffer = await response.arrayBuffer();
   ```

### **AI Processing Steps**

1. **Document Analysis:**
   - Extract text from PDFs
   - Process images with OCR
   - Parse structured documents

2. **Requirement Extraction:**
   - Building specifications
   - Equipment requirements
   - Safety requirements
   - Compliance needs

3. **Cost Estimation:**
   - Material costs
   - Labor costs
   - Equipment costs
   - Installation costs

4. **BOM Generation:**
   - Detailed parts list
   - Quantities
   - Specifications
   - Pricing

## Error Handling

### **Upload Errors**
- File type not supported
- File too large (>20MB)
- Disk space full
- Network errors

### **Processing Errors**
- Corrupted files
- Unreadable documents
- AI processing failures

### **Recovery**
- Retry upload functionality
- File validation before processing
- Graceful error messages
- Session recovery

## Testing the Flow

### **Test Scenarios**

1. **Basic Upload:**
   ```bash
   # Upload a PDF file
   curl -X POST -F "file=@document.pdf" http://localhost:3000/api/documents/upload
   ```

2. **Project Creation:**
   ```bash
   # Create project with files
   curl -X POST -H "Content-Type: application/json" \
     -d '{"projectName":"Test","uploadedFiles":[...]}' \
     http://localhost:3000/api/projects
   ```

3. **File Access:**
   ```bash
   # Access uploaded file
   curl http://localhost:3000/api/uploads/1703123456789-abc123.pdf
   ```

### **Test Page**
Visit `/test-upload` for standalone file upload testing.

## Production Considerations

### **Migration to Cloud Storage**

When ready for production:

1. **Replace local storage with S3:**
   ```typescript
   // Update upload handler to use S3
   const s3Upload = await uploadToS3(file);
   ```

2. **Update file URLs:**
   ```typescript
   // Change from local to S3 URLs
   fileUrl: "https://bucket.s3.amazonaws.com/filename.pdf"
   ```

3. **AI Integration:**
   ```typescript
   // AI accesses S3 files
   const s3File = await getS3File(fileUrl);
   ```

### **Benefits of Cloud Storage**
- **Scalability:** Unlimited storage
- **Reliability:** 99.99% availability
- **Security:** IAM roles and policies
- **Performance:** Global CDN
- **Backup:** Automatic replication

## Summary

The current configuration provides:

✅ **Local file storage** in `uploads/` directory  
✅ **Session persistence** via Redis  
✅ **File serving** via API routes  
✅ **Project creation** with file metadata  
✅ **AI-ready** file access for processing  
✅ **Development-friendly** setup  

When the wizard is completed:
1. Files remain in `uploads/` directory
2. Project is created with file metadata
3. AI can access files for cost estimation
4. User is redirected to project details

This setup is perfect for development and can be easily migrated to cloud storage for production deployment. 