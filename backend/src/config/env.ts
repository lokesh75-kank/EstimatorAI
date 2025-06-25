import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Load OpenAI-specific environment variables from .env.openai file
dotenv.config({ path: path.resolve(__dirname, '../../.env.openai') });

export const config = {
    openai: {
        apiKey: process.env.OPENAI_API_KEY,
        model: process.env.OPENAI_MODEL || 'gpt-4-1106-preview',
        maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '4000', 10),
        temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0'),
    },
    vision: {
        model: process.env.VISION_MODEL || 'gpt-4o',
        enabled: process.env.VISION_MODEL_ENABLED === 'true',
        detailLevel: process.env.VISION_DETAIL_LEVEL || 'high',
        maxTokens: parseInt(process.env.VISION_MAX_TOKENS || '4096', 10),
        supportedFormats: process.env.VISION_SUPPORTED_FORMATS?.split(',') || ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'],
    },
    documentProcessor: {
        maxTokensPerChunk: parseInt(process.env.MAX_TOKENS_PER_CHUNK || '8000', 10),
        minConfidenceThreshold: parseFloat(process.env.MIN_CONFIDENCE_THRESHOLD || '0.7'),
    },
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        filePath: process.env.LOG_FILE_PATH || 'logs',
    },
    server: {
        port: parseInt(process.env.PORT || '3000', 10),
        nodeEnv: process.env.NODE_ENV || 'development',
    },
    aws: {
        region: process.env.AWS_REGION || 'us-east-1',
        dynamoDB: {
            endpoint: process.env.DYNAMODB_ENDPOINT || 'http://localhost:8000',
            table: process.env.DYNAMODB_TABLE || 'projects',
        },
        s3: {
            bucket: process.env.AWS_S3_BUCKET,
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        }
    },
    agent: {
        apiUrl: process.env.AGENT_API_URL || 'http://localhost:8000',
        apiKey: process.env.AGENT_API_KEY,
    }
} as const;

// Validate required environment variables
const requiredEnvVars = {
    openai: ['OPENAI_API_KEY'],
    aws: ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY'],
    agent: ['AGENT_API_KEY']
};

const missingVars: string[] = [];

for (const [service, vars] of Object.entries(requiredEnvVars)) {
    for (const envVar of vars) {
        if (!process.env[envVar]) {
            missingVars.push(`${service}: ${envVar}`);
        }
    }
}

if (missingVars.length > 0) {
    throw new Error(
        `Missing required environment variables:\n${missingVars.join('\n')}\n` +
        'Please check your .env files and ensure all required variables are set.'
    );
} 