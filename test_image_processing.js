const fs = require('fs');
const path = require('path');

console.log('🖼️ === Image Processing Test ===\n');

async function testImageProcessing() {
  const imagePath = path.join(__dirname, 'backend', 'uploads', 'images', 'PHOTO-2025-05-23-00-14-29.jpg');
  
  // Check if image exists
  if (!fs.existsSync(imagePath)) {
    console.log('❌ Image file not found:', imagePath);
    console.log('💡 Please add an image file to backend/uploads/images/ to test');
    return;
  }

  console.log('📸 === Found Image ===');
  console.log('Image Path:', imagePath);
  console.log('Image Size:', (fs.statSync(imagePath).size / 1024).toFixed(2), 'KB');
  console.log('\n' + '='.repeat(60) + '\n');

  try {
    console.log('🚀 === Testing Image Upload Processing ===');
    
    // Read the image file
    const imageBuffer = fs.readFileSync(imagePath);
    
    // Test the image upload endpoint
    const formData = new FormData();
    formData.append('image', new Blob([imageBuffer], { type: 'image/jpeg' }), 'test-image.jpg');
    formData.append('projectType', 'fire_security_systems');

    console.log('📤 === Sending Image to Backend ===');
    console.log('Endpoint: http://localhost:3001/api/images/process');
    console.log('Project Type: fire_security_systems');
    
    const response = await fetch('http://localhost:3001/api/images/process', {
      method: 'POST',
      body: formData
    });

    if (response.ok) {
      const result = await response.json();
      
      console.log('✅ === Image Processing Response ===');
      console.log('Status:', response.status);
      console.log('\n📊 === Full Response ===');
      console.log(JSON.stringify(result, null, 2));
      
      console.log('\n🎯 === Key Analysis Results ===');
      
      if (result.data) {
        const data = result.data;
        
        console.log('\n🏢 === Project Details ===');
        if (data.projectDetails) {
          console.log('Type:', data.projectDetails.type);
          console.log('Scope:', data.projectDetails.scope);
          console.log('Timeline:', data.projectDetails.timeline);
          console.log('Requirements:', data.projectDetails.requirements?.join(', '));
        }
        
        console.log('\n📋 === Estimation Elements ===');
        if (data.estimationElements && data.estimationElements.length > 0) {
          data.estimationElements.forEach((element, index) => {
            console.log(`${index + 1}. ${element.code} - ${element.description}`);
            console.log(`   Qty: ${element.qty}, Price: $${element.unitPrice}, Vendor: ${element.vendor}`);
            console.log(`   Specs: ${element.specSummary}`);
            console.log('');
          });
        } else {
          console.log('No estimation elements found');
        }
        
        console.log('\n🏪 === Vendor Recommendations ===');
        if (data.vendors && data.vendors.length > 0) {
          data.vendors.forEach((vendor, index) => {
            console.log(`${index + 1}. ${vendor.name} (${Math.round(vendor.confidence * 100)}% match)`);
            console.log(`   Description: ${vendor.description}`);
            console.log(`   Specialties: ${vendor.specialties?.join(', ')}`);
            console.log('');
          });
        } else {
          console.log('No vendor recommendations found');
        }
        
        console.log('\n📦 === Materials ===');
        if (data.materials && data.materials.length > 0) {
          data.materials.forEach((material, index) => {
            console.log(`${index + 1}. ${material.name}`);
            console.log(`   Category: ${material.category}`);
            console.log(`   Specs: ${material.specifications}`);
            console.log(`   Cost: ${material.estimatedCost}`);
            console.log('');
          });
        } else {
          console.log('No materials found');
        }
        
        console.log('\n💡 === Recommendations ===');
        if (data.recommendations && data.recommendations.length > 0) {
          data.recommendations.forEach((rec, index) => {
            console.log(`${index + 1}. ${rec}`);
          });
        } else {
          console.log('No recommendations found');
        }
        
      } else {
        console.log('❌ No analysis data in response');
      }
      
      console.log('\n🔧 === Metadata ===');
      if (result.metadata) {
        console.log('Model:', result.metadata.model);
        console.log('Detail Level:', result.metadata.detailLevel);
        console.log('Max Tokens:', result.metadata.maxTokens);
        console.log('Project Type:', result.metadata.projectType);
      }
      
    } else {
      const errorText = await response.text();
      console.log('❌ === Error Response ===');
      console.log('Status:', response.status);
      console.log('Error:', errorText);
    }
    
  } catch (error) {
    console.log('❌ === Network Error ===');
    console.log('Error:', error.message);
    console.log('\n💡 Make sure your backend server is running on http://localhost:3001');
  }
}

// Also test with base64 URL method
async function testImageURLProcessing() {
  console.log('\n' + '='.repeat(60));
  console.log('🔗 === Testing Image URL Processing ===\n');
  
  const imagePath = path.join(__dirname, 'backend', 'uploads', 'images', 'PHOTO-2025-05-23-00-14-29.jpg');
  
  // Check if image exists
  if (!fs.existsSync(imagePath)) {
    console.log('❌ Image file not found:', imagePath);
    console.log('💡 Please add an image file to backend/uploads/images/ to test');
    return;
  }

  try {
    // Read and encode image as base64
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    const dataURL = `data:image/jpeg;base64,${base64Image}`;
    
    console.log('📤 === Sending Image URL to Backend ===');
    console.log('Endpoint: http://localhost:3001/api/images/process-url');
    console.log('Image Size:', (imageBuffer.length / 1024).toFixed(2), 'KB');
    
    const response = await fetch('http://localhost:3001/api/images/process-url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageUrl: dataURL,
        projectType: 'fire_security_systems'
      })
    });

    if (response.ok) {
      const result = await response.json();
      
      console.log('✅ === Image URL Processing Response ===');
      console.log('Status:', response.status);
      console.log('\n📊 === Full Response ===');
      console.log(JSON.stringify(result, null, 2));
      
    } else {
      const errorText = await response.text();
      console.log('❌ === Error Response ===');
      console.log('Status:', response.status);
      console.log('Error:', errorText);
    }
    
  } catch (error) {
    console.log('❌ === Network Error ===');
    console.log('Error:', error.message);
  }
}

// Test supported formats
async function testSupportedFormats() {
  console.log('\n' + '='.repeat(60));
  console.log('📋 === Testing Supported Formats ===\n');
  
  try {
    const response = await fetch('http://localhost:3001/api/images/supported-formats');
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ === Supported Formats ===');
      console.log('Formats:', result.supportedFormats);
      console.log('Max File Size:', result.maxFileSize);
      console.log('Vision Model:', result.visionModel);
      console.log('Detail Level:', result.detailLevel);
    } else {
      console.log('❌ Failed to get supported formats');
    }
  } catch (error) {
    console.log('❌ Error getting supported formats:', error.message);
  }
}

// Run all tests
async function runImageTests() {
  await testSupportedFormats();
  await testImageProcessing();
  await testImageURLProcessing();
  
  console.log('\n' + '='.repeat(60));
  console.log('🎉 === Image Processing Test Complete ===');
  console.log('\n💡 Tips:');
  console.log('- Check the backend console for detailed vision model prompts and responses');
  console.log('- The vision model (gpt-4-vision-preview) analyzes the image content');
  console.log('- Look for extracted text, diagrams, equipment, and layout information');
  console.log('- The model should identify fire safety equipment, wiring, and installation details');
}

runImageTests().catch(console.error); 