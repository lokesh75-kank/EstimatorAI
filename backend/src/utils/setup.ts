import fs from 'fs';
import path from 'path';
import { config } from '../config/env';

export function ensureDirectoriesExist(): void {
    // Ensure log directory exists
    const logDir = path.resolve(process.cwd(), config.logging.filePath);
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
    }

    // Ensure uploads directory exists
    const uploadsDir = path.resolve(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }
} 