export interface Section {
    id: string;
    title: string;
    content: string;
    pageRange: [number, number];
}

export interface Chunk {
    sections: string[];
    content: string[];
    tokenCount: number;
}

export interface ProcessedChunk {
    [key: string]: any;
}

export interface ValidationResult {
    isValid: boolean;
    confidence: number;
    errors?: string[];
}

export interface FieldValidation {
    value: any;
    confidence: number;
    validationResult: ValidationResult;
}

export interface DocumentMetadata {
    fileName: string;
    fileType: string;
    fileSize: number;
    uploadDate: Date;
    processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
    error?: string;
} 