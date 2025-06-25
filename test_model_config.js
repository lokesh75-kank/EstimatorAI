const fs = require('fs');
const path = require('path');

console.log('🔍 === OpenAI Model Configuration Test ===');

// Read the .env.openai file directly
const envOpenaiPath = path.join(__dirname, 'backend', '.env.openai');
const envPath = path.join(__dirname, 'backend', '.env');

console.log('📁 === Environment Files ===');
console.log('.env.openai path:', envOpenaiPath);
console.log('.env path:', envPath);

// Check if files exist
if (fs.existsSync(envOpenaiPath)) {
  console.log('✅ .env.openai file exists');
  const envOpenaiContent = fs.readFileSync(envOpenaiPath, 'utf8');
  console.log('\n📄 .env.openai content:');
  console.log(envOpenaiContent);
  
  // Parse the OPENAI_MODEL from the file
  const modelMatch = envOpenaiContent.match(/OPENAI_MODEL=(.+)/);
  if (modelMatch) {
    const model = modelMatch[1].trim();
    console.log('\n🎯 Found OPENAI_MODEL:', model);
    
    if (model === 'gpt-4o-mini') {
      console.log('✅ SUCCESS: gpt-4o-mini is configured!');
    } else {
      console.log('⚠️  WARNING: Expected gpt-4o-mini but found:', model);
    }
  } else {
    console.log('❌ ERROR: OPENAI_MODEL not found in .env.openai');
  }
} else {
  console.log('❌ .env.openai file does not exist');
}

if (fs.existsSync(envPath)) {
  console.log('\n✅ .env file exists');
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log('\n📄 .env content:');
  console.log(envContent);
} else {
  console.log('\n❌ .env file does not exist');
}

console.log('\n🎯 === Expected Configuration ===');
console.log('Model: gpt-4o-mini');
console.log('Temperature: 0.7');
console.log('Max Tokens: 2000');
console.log('====================================='); 