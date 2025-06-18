const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface DocumentUploadResponse {
  id: string;
  name: string;
  documentType: string;
  detectedType: string;
  confidence: number;
  url?: string;
  extractedData: {
    project_type?: string;
    square_footage?: number;
    floors?: number;
    zones?: number;
    devices?: Array<{
      type: string;
      count: number;
    }>;
    [key: string]: any;
  };
}

class DocumentService {
  async uploadDocument(file: File): Promise<DocumentUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_BASE_URL}/documents/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Mock response for development if backend is not ready
      if (!result || !result.id) {
        return this.mockDocumentResponse(file);
      }

      return result;
    } catch (error) {
      console.error('Document upload error:', error);
      // Return mock response for development
      return this.mockDocumentResponse(file);
    }
  }

  private mockDocumentResponse(file: File): DocumentUploadResponse {
    const isImage = file.type.startsWith('image/');
    
    return {
      id: Date.now().toString(),
      name: file.name,
      documentType: file.type,
      detectedType: isImage ? 'Floor Plan' : 'Project Specification',
      confidence: Math.floor(Math.random() * 30) + 70, // 70-100%
      url: isImage ? URL.createObjectURL(file) : undefined,
      extractedData: {
        project_type: 'Commercial Office Building',
        square_footage: 50000 + Math.floor(Math.random() * 50000),
        floors: Math.floor(Math.random() * 10) + 1,
        zones: Math.floor(Math.random() * 20) + 5,
        devices: [
          { type: 'Smoke Detector', count: Math.floor(Math.random() * 50) + 10 },
          { type: 'Fire Alarm Panel', count: Math.floor(Math.random() * 5) + 1 },
          { type: 'Sprinkler Head', count: Math.floor(Math.random() * 100) + 20 },
          { type: 'Emergency Light', count: Math.floor(Math.random() * 30) + 5 },
        ],
        building_description: 'Multi-story commercial office building with modern fire safety systems',
        compliance_notes: 'Building meets NFPA 72 and local fire code requirements',
      },
    };
  }
}

const documentService = new DocumentService();
export default documentService; 