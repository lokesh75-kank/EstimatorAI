import axios from 'axios';

interface DocumentMetadata {
  documentType: string;
  extractedData: Record<string, any>;
  confidence: number;
}

const documentService = {
  async uploadDocument(file: File): Promise<DocumentMetadata> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('/api/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw new Error('Failed to upload document');
    }
  },

  async parseDocument(documentId: string): Promise<DocumentMetadata> {
    try {
      const response = await axios.post(`/api/documents/${documentId}/parse`);
      return response.data;
    } catch (error) {
      console.error('Error parsing document:', error);
      throw new Error('Failed to parse document');
    }
  },

  async getDocumentMetadata(documentId: string): Promise<DocumentMetadata> {
    try {
      const response = await axios.get(`/api/documents/${documentId}/metadata`);
      return response.data;
    } catch (error) {
      console.error('Error fetching document metadata:', error);
      throw new Error('Failed to fetch document metadata');
    }
  },
};

export default documentService; 