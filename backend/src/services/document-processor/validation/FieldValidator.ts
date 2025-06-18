import { FieldValidation, ValidationResult } from '../types';
import { logger } from '../../../utils/logger';
import { config } from '../../../config/env';

export class FieldValidator {
    private readonly minConfidenceThreshold: number;

    constructor() {
        this.minConfidenceThreshold = config.documentProcessor.minConfidenceThreshold;
    }

    async validateFields(data: Record<string, any>): Promise<Record<string, FieldValidation>> {
        const validatedFields: Record<string, FieldValidation> = {};

        for (const [key, value] of Object.entries(data)) {
            try {
                const validationResult = await this.validateField(key, value);
                validatedFields[key] = {
                    value: value.value,
                    confidence: value.confidence,
                    validationResult
                };
            } catch (error) {
                logger.error(`Error validating field ${key}:`, error);
                validatedFields[key] = {
                    value: value.value,
                    confidence: 0,
                    validationResult: {
                        isValid: false,
                        confidence: 0,
                        errors: ['Validation failed']
                    }
                };
            }
        }

        return validatedFields;
    }

    private async validateField(key: string, value: any): Promise<ValidationResult> {
        const errors: string[] = [];
        let isValid = true;

        // Check confidence threshold
        if (value.confidence < this.minConfidenceThreshold) {
            errors.push(`Confidence score ${value.confidence} is below threshold ${this.minConfidenceThreshold}`);
            isValid = false;
        }

        // Add specific validation rules based on field type
        switch (key.toLowerCase()) {
            case 'date':
                if (!this.isValidDate(value.value)) {
                    errors.push('Invalid date format');
                    isValid = false;
                }
                break;
            case 'cost':
            case 'budget':
            case 'price':
                if (!this.isValidNumber(value.value)) {
                    errors.push('Invalid number format');
                    isValid = false;
                }
                break;
            case 'email':
                if (!this.isValidEmail(value.value)) {
                    errors.push('Invalid email format');
                    isValid = false;
                }
                break;
        }

        return {
            isValid,
            confidence: value.confidence,
            errors: errors.length > 0 ? errors : undefined
        };
    }

    private isValidDate(value: string): boolean {
        const date = new Date(value);
        return date instanceof Date && !isNaN(date.getTime());
    }

    private isValidNumber(value: string | number): boolean {
        if (typeof value === 'number') return true;
        return !isNaN(Number(value.replace(/[^0-9.-]+/g, '')));
    }

    private isValidEmail(value: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);
    }
} 