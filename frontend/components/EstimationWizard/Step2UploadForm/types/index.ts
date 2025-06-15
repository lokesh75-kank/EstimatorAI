export interface ExtractedData {
  project_type?: string;
  square_footage?: number;
  floors?: number;
  zones?: number;
  devices?: Array<{
    type: string;
    count: number;
  }>;
  [key: string]: any;
}

export interface ExtractedDoc {
  id: string;
  name: string;
  documentType?: string;
  detectedType: string;
  confidence: number;
  url?: string;
  extractedData: ExtractedData;
}

export interface Step2UploadFormProps {
  extractedDocs: ExtractedDoc[];
  setExtractedDocs: React.Dispatch<React.SetStateAction<ExtractedDoc[]>>;
  setIsSubmitting: (val: boolean) => void;
  setError: (val: string | null) => void;
  isSubmitting: boolean;
  error: string | null;
  projectDetails: any;
  setProjectDetails: (val: any) => void;
} 