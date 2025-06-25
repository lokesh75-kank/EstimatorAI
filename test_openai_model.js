const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, 'backend/.env') });

// Load OpenAI-specific environment variables from .env.openai file
dotenv.config({ path: path.resolve(__dirname, 'backend/.env.openai') });

console.log('🔍 === OpenAI Model Configuration Test ===');
console.log('Environment Variables Loaded:');
console.log('OPENAI_MODEL:', process.env.OPENAI_MODEL);
console.log('OPENAI_TEMPERATURE:', process.env.OPENAI_TEMPERATURE);
console.log('OPENAI_MAX_TOKENS:', process.env.OPENAI_MAX_TOKENS);
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? '✅ Set' : '❌ Not Set');

// Test the config import
try {
  const { config } = require('./backend/src/config/env');
  console.log('\n📋 === Backend Configuration ===');
  console.log('Model:', config.openai.model);
  console.log('Temperature:', config.openai.temperature);
  console.log('Max Tokens:', config.openai.maxTokens);
  console.log('API Key:', config.openai.apiKey ? '✅ Set' : '❌ Not Set');
  
  if (config.openai.model === 'gpt-4o-mini') {
    console.log('\n✅ SUCCESS: System is configured to use gpt-4o-mini!');
  } else {
    console.log('\n⚠️  WARNING: System is not using gpt-4o-mini. Current model:', config.openai.model);
  }
} catch (error) {
  console.error('❌ Error loading backend config:', error.message);
}

console.log('\n🎯 === Expected Configuration ===');
console.log('Model: gpt-4o-mini');
console.log('Temperature: 0.7');
console.log('Max Tokens: 2000');
console.log('====================================='); 