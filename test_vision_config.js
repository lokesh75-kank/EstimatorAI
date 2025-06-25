const fs = require('fs');
const path = require('path');

console.log('🔍 === Vision Model Configuration Test ===');

// Read the .env.openai file directly
const envOpenaiPath = path.join(__dirname, 'backend', '.env.openai');

console.log('📁 === Environment Files ===');
console.log('.env.openai path:', envOpenaiPath);

// Check if files exist
if (fs.existsSync(envOpenaiPath)) {
  console.log('✅ .env.openai file exists');
  const envOpenaiContent = fs.readFileSync(envOpenaiPath, 'utf8');
  console.log('\n📄 .env.openai content:');
  console.log(envOpenaiContent);
  
  // Parse the models from the file
  const openaiModelMatch = envOpenaiContent.match(/OPENAI_MODEL=(.+)/);
  const visionModelMatch = envOpenaiContent.match(/VISION_MODEL=(.+)/);
  
  if (openaiModelMatch) {
    const openaiModel = openaiModelMatch[1].trim();
    console.log('\n🎯 Found OPENAI_MODEL (for documents):', openaiModel);
    
    if (openaiModel === 'gpt-4o-mini') {
      console.log('✅ SUCCESS: gpt-4o-mini is configured for document processing!');
    } else {
      console.log('⚠️  WARNING: Expected gpt-4o-mini for documents but found:', openaiModel);
    }
  } else {
    console.log('❌ ERROR: OPENAI_MODEL not found in .env.openai');
  }
  
  if (visionModelMatch) {
    const visionModel = visionModelMatch[1].trim();
    console.log('\n🎯 Found VISION_MODEL (for images):', visionModel);
    
    if (visionModel === 'gpt-4-vision-preview') {
      console.log('✅ SUCCESS: gpt-4-vision-preview is configured for image processing!');
    } else {
      console.log('⚠️  WARNING: Expected gpt-4-vision-preview for images but found:', visionModel);
    }
  } else {
    console.log('❌ ERROR: VISION_MODEL not found in .env.openai');
  }
  
  // Check other vision settings
  const visionEnabledMatch = envOpenaiContent.match(/VISION_MODEL_ENABLED=(.+)/);
  const visionDetailMatch = envOpenaiContent.match(/VISION_DETAIL_LEVEL=(.+)/);
  const visionMaxTokensMatch = envOpenaiContent.match(/VISION_MAX_TOKENS=(.+)/);
  const supportedFormatsMatch = envOpenaiContent.match(/VISION_SUPPORTED_FORMATS=(.+)/);
  
  console.log('\n🔧 === Vision Configuration ===');
  console.log('Vision Enabled:', visionEnabledMatch ? visionEnabledMatch[1].trim() : 'Not set');
  console.log('Detail Level:', visionDetailMatch ? visionDetailMatch[1].trim() : 'Not set');
  console.log('Max Tokens:', visionMaxTokensMatch ? visionMaxTokensMatch[1].trim() : 'Not set');
  console.log('Supported Formats:', supportedFormatsMatch ? supportedFormatsMatch[1].trim() : 'Not set');
  
} else {
  console.log('❌ .env.openai file does not exist');
}

console.log('\n🎯 === Expected Configuration ===');
console.log('Document Processing Model: gpt-4o-mini');
console.log('Image Processing Model: gpt-4-vision-preview');
console.log('Vision Enabled: true');
console.log('Detail Level: high');
console.log('Max Tokens: 4096');
console.log('Supported Formats: jpg,jpeg,png,gif,bmp,webp');
console.log('=====================================');

console.log('\n📋 === API Endpoints ===');
console.log('Document Processing: POST /api/documents/process');
console.log('Image Processing: POST /api/images/process');
console.log('Image from URL: POST /api/images/process-url');
console.log('Supported Formats: GET /api/images/supported-formats');
console.log('====================================='); 