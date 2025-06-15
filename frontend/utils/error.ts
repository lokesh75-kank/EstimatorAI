import { AxiosError } from 'axios';
import type { ErrorResponse } from '@/types/api';

export function handleApiError(error: unknown): string {
  if (error instanceof AxiosError) {
    const errorData = error.response?.data as ErrorResponse | undefined;
    return errorData?.message || error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
}

export function isApiError(error: unknown): error is AxiosError<ErrorResponse> {
  return error instanceof AxiosError;
} 