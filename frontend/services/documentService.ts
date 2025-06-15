import axios, { AxiosError } from 'axios';

interface DocumentMetadata {
  documentType: string;
  extractedData: Record<string, any>;
  confidence: number;
  url?: string;
}

interface APIError {
  error: string;
  details?: string;
  openaiError?: any;
}

const documentService = {
  async uploadDocument(file: File): Promise<DocumentMetadata> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post<DocumentMetadata>('/api/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error uploading document:', error);
      
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<APIError>;
        if (axiosError.response?.data) {
          const apiError = axiosError.response.data as APIError;
          throw new Error(
            apiError.details || 
            apiError.error || 
            'Failed to upload document'
          );
        }
      }
      
      throw new Error(
        error instanceof Error ? error.message : 'Failed to upload document'
      );
    }
  },

  async parseDocument(documentId: string): Promise<DocumentMetadata> {
    try {
      const response = await axios.post<DocumentMetadata>(`/api/documents/${documentId}/parse`);
      return response.data;
    } catch (error) {
      console.error('Error parsing document:', error);
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<APIError>;
        if (axiosError.response?.data) {
          const apiError = axiosError.response.data as APIError;
          throw new Error(
            apiError.details || 
            apiError.error || 
            'Failed to parse document'
          );
        }
      }
      throw new Error(
        error instanceof Error ? error.message : 'Failed to parse document'
      );
    }
  },

  async getDocumentMetadata(documentId: string): Promise<DocumentMetadata> {
    try {
      const response = await axios.get<DocumentMetadata>(`/api/documents/${documentId}/metadata`);
      return response.data;
    } catch (error) {
      console.error('Error fetching document metadata:', error);
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<APIError>;
        if (axiosError.response?.data) {
          const apiError = axiosError.response.data as APIError;
          throw new Error(
            apiError.details || 
            apiError.error || 
            'Failed to fetch document metadata'
          );
        }
      }
      throw new Error(
        error instanceof Error ? error.message : 'Failed to fetch document metadata'
      );
    }
  },
};

export default documentService; 