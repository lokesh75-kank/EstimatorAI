export interface Project {
  id: number;
  clientName: string;
  clientEmail: string;
  building: {
    type: string;
    size: number;
    floors: number;
    zones: number;
  };
  analysis?: string;
  status: 'draft' | 'in_review' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
} 