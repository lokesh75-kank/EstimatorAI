# Local File Storage Implementation

## Overview

This implementation provides local file system storage for development purposes, allowing users to upload and store files directly on the server's local filesystem. This is ideal for development and testing scenarios where cloud storage is not required.

## Features

### ✅ Supported File Types
- **Documents**: PDF, DOC, DOCX, TXT
- **Images**: JPG, JPEG, PNG
- **Archives**: ZIP
- **Maximum file size**: 20MB per file

### ✅ Core Functionality
- Drag & drop file upload
- Multiple file upload support
- Real-time upload progress
- File validation and error handling
- Unique filename generation (prevents conflicts)
- File serving via API routes
- Session-based file persistence
- File removal and cleanup

## Architecture

### File Storage Structure
```
project-root/
├── uploads/                    # Local file storage directory
│   ├── 1703123456789-abc123.pdf
│   ├── 1703123456790-def456.docx
│   └── 1703123456791-ghi789.zip
├── frontend/
│   └── app/
│       └── api/
│           ├── documents/
│           │   └── upload/
│           │       └── route.ts    # File upload handler
│           └── uploads/
│               └── [...filename]/
│                   └── route.ts    # File serving handler
```

### API Endpoints

#### 1. File Upload
**POST** `/api/documents/upload`

Uploads files to local storage and returns file metadata.

**Request:**
```javascript
const formData = new FormData();
formData.append('file', file);

const response = await fetch('/api/documents/upload', {
  method: 'POST',
  body: formData,
});
```

**Response:**
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "file": {
    "originalName": "document.pdf",
    "storedName": "1703123456789-abc123.pdf",
    "size": 1024000,
    "type": "application/pdf",
    "fileUrl": "/api/uploads/1703123456789-abc123.pdf",
    "localPath": "/path/to/uploads/1703123456789-abc123.pdf",
    "uploadedAt": "2024-01-15T12:00:00Z"
  },
  "processingStatus": "pending",
  "estimatedProcessingTime": "2-5 minutes"
}
```

#### 2. File Serving
**GET** `/api/uploads/{filename}`

Serves uploaded files with proper content types and caching headers.

**Response:**
- File content with appropriate `Content-Type` header
- `Cache-Control: public, max-age=3600` (1 hour cache)
- `Content-Disposition: inline` for browser display

## Implementation Details

### File Upload Handler (`/api/documents/upload/route.ts`)

```typescript
// Key features:
1. File validation (type, size)
2. Unique filename generation
3. Local file system storage
4. Error handling and logging
5. Security checks (directory traversal prevention)
```

### File Serving Handler (`/api/uploads/[...filename]/route.ts`)

```typescript
// Key features:
1. Security validation (prevents directory traversal)
2. Content type detection
3. File existence checks
4. Proper HTTP headers
5. Error handling
```

### Session Integration

Files are integrated with the Redis-based session storage system:

```typescript
interface ProjectFormData {
  // ... other fields
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

## Usage Examples

### Basic File Upload
```typescript
const handleFileUpload = async (files: FileList) => {
  for (const file of files) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('/api/documents/upload', {
      method: 'POST',
      body: formData,
    });
    
    const result = await response.json();
    console.log('Uploaded file:', result.file);
  }
};
```

### File Display
```typescript
// Display uploaded file
<a href="/api/uploads/1703123456789-abc123.pdf" target="_blank">
  View PDF Document
</a>
```

### Session Integration
```typescript
// Save files to session
await updateSession({
  uploadedFiles: [
    {
      id: 'file-1',
      name: 'document.pdf',
      size: 1024000,
      type: 'application/pdf',
      url: '/api/uploads/1703123456789-abc123.pdf',
      status: 'success'
    }
  ]
});
```

## Benefits

### ✅ Development Advantages
- **No external dependencies**: No need for AWS S3 or other cloud services
- **Fast uploads**: Direct local storage, no network latency
- **Easy debugging**: Files are directly accessible on the filesystem
- **Cost-effective**: No storage costs during development
- **Offline capability**: Works without internet connection

### ✅ User Experience
- **Drag & drop interface**: Modern, intuitive upload experience
- **Real-time feedback**: Progress indicators and status updates
- **File preview**: Direct links to view uploaded files
- **Error handling**: Clear error messages for failed uploads
- **Session persistence**: Files persist across page refreshes

## Limitations

### ⚠️ Development-Only
- **Not scalable**: Limited by local disk space
- **No redundancy**: Single point of failure
- **Server restart**: Files lost if server restarts (unless persistent storage)
- **No CDN**: No global distribution for performance
- **Security**: Less secure than cloud storage with proper access controls

### ⚠️ Production Considerations
- **Storage limits**: Limited by server disk space
- **Backup requirements**: Manual backup strategy needed
- **Security**: File access control must be implemented
- **Performance**: No CDN benefits for global users

## Migration to Production

When ready for production, consider migrating to:

### AWS S3 Integration
```typescript
// Replace local storage with S3
const s3Upload = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('/api/documents/upload-s3', {
    method: 'POST',
    body: formData,
  });
  
  return response.json();
};
```

### Cloud Storage Benefits
- **Scalability**: Unlimited storage capacity
- **Reliability**: 99.99% availability
- **Security**: IAM roles and bucket policies
- **Performance**: Global CDN distribution
- **Backup**: Automatic replication and versioning

## Testing

### Test Page
Visit `/test-upload` to test the file upload functionality:

```bash
# Start the development server
npm run dev

# Navigate to test page
http://localhost:3000/test-upload
```

### Test Scenarios
1. **Single file upload**: Upload a PDF or image
2. **Multiple files**: Upload several files at once
3. **Large files**: Test with files near the 20MB limit
4. **Invalid files**: Try uploading unsupported file types
5. **File viewing**: Click "View file" links to verify serving
6. **Session persistence**: Refresh page to verify file persistence

## Configuration

### Environment Variables
```bash
# Optional: Customize upload directory
UPLOAD_DIR=./uploads

# Optional: Customize max file size (default: 20MB)
MAX_FILE_SIZE=20971520
```

### File Type Configuration
```typescript
// Supported file types can be modified in route.ts
const SUPPORTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];
const SUPPORTED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];
const SUPPORTED_ARCHIVE_TYPES = [
  'application/zip',
  'application/x-zip-compressed',
  'application/octet-stream',
];
```

## Security Considerations

### ✅ Implemented Security
- **File type validation**: Only allowed file types accepted
- **File size limits**: Prevents large file uploads
- **Directory traversal prevention**: Secure file path handling
- **Unique filenames**: Prevents filename conflicts and overwrites

### 🔒 Additional Security (Production)
- **Authentication**: Require user authentication for uploads
- **Authorization**: Check user permissions for file access
- **Virus scanning**: Implement malware detection
- **Rate limiting**: Prevent upload abuse
- **File encryption**: Encrypt sensitive files at rest

## Troubleshooting

### Common Issues

#### File Upload Fails
```bash
# Check uploads directory permissions
ls -la uploads/
chmod 755 uploads/

# Check disk space
df -h
```

#### Files Not Serving
```bash
# Verify file exists
ls -la uploads/filename.pdf

# Check API route logs
tail -f logs/api.log
```

#### Session Issues
```bash
# Check Redis connection
redis-cli ping

# Verify session data
redis-cli get session:your-session-id
```

### Debug Mode
Enable detailed logging by setting:
```bash
DEBUG=file-upload:*
npm run dev
```

## Future Enhancements

### Planned Features
- **File compression**: Automatic image optimization
- **Thumbnail generation**: Preview images for uploaded files
- **Batch operations**: Bulk file management
- **File metadata extraction**: Extract document properties
- **Version control**: File versioning and history

### Integration Opportunities
- **AI processing**: Connect to document analysis services
- **OCR integration**: Extract text from images and PDFs
- **Document parsing**: Extract structured data from documents
- **Workflow automation**: Trigger actions on file upload

---

This local file storage implementation provides a solid foundation for development and can be easily extended or migrated to cloud storage when needed for production deployment. 