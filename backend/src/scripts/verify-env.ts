import { config } from '../config/env';

function verifyEnvSetup() {
    // Required environment files
    const requiredEnvFiles = [
        '.env',
        '.env.document-processor',
        '.env.openai'
    ];

    console.log('Verifying environment setup...\n');

    // Check for required .env files
    console.log('Checking required .env files:');
    requiredEnvFiles.forEach(file => {
        const exists = require('fs').existsSync(require('path').resolve(__dirname, '../../', file));
        console.log(`- ${file}: ${exists ? '✅ Found' : '❌ Missing'}`);
    });

    console.log('\nChecking configuration:');
    
    // Document Processor Configuration
    console.log('\nDocument Processor Configuration:');
    console.log(`- Max tokens per chunk: ${config.documentProcessor.maxTokensPerChunk}`);
    console.log(`- Min confidence threshold: ${config.documentProcessor.minConfidenceThreshold}`);

    // OpenAI Configuration
    console.log('\nOpenAI Configuration:');
    console.log(`- Model: ${config.openai.model}`);
    console.log(`- Max tokens: ${config.openai.maxTokens}`);
    console.log(`- Temperature: ${config.openai.temperature}`);

    // Server Configuration
    console.log('\nServer Configuration:');
    console.log(`- Port: ${config.server.port}`);
    console.log(`- Environment: ${config.server.nodeEnv}`);

    // Logging Configuration
    console.log('\nLogging Configuration:');
    console.log(`- Level: ${config.logging.level}`);
    console.log(`- File path: ${config.logging.filePath}`);

    // Check for sensitive data exposure
    console.log('\nChecking for sensitive data exposure:');
    const sensitiveVars = ['OPENAI_API_KEY', 'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY'];
    sensitiveVars.forEach(varName => {
        const value = process.env[varName];
        if (value) {
            console.log(`- ${varName}: ${value.substring(0, 4)}...${value.substring(value.length - 4)}`);
        } else {
            console.log(`- ${varName}: Not set`);
        }
    });
}

verifyEnvSetup(); 