import { ExtractedDoc } from '../types';

export interface BuildingDetailsCardProps {
  data?: Record<string, any>;
  onEdit: (field: string, value: any) => void;
  isConfirmed: boolean;
} 