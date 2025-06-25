const fs = require('fs');
const path = require('path');

console.log('🔍 === Vision Analysis Test ===\n');

async function testVisionAnalysis() {
  // Check for images in the backend uploads
  const imagesDir = path.join(__dirname, 'backend', 'uploads', 'images');
  
  if (!fs.existsSync(imagesDir)) {
    console.log('❌ Backend images directory not found');
    return;
  }
  
  const imageFiles = fs.readdirSync(imagesDir).filter(file => 
    /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(file)
  );
  
  if (imageFiles.length === 0) {
    console.log('📭 No image files found in backend/uploads/images/');
    console.log('💡 Please upload an image through the Requirements window first');
    return;
  }
  
  const testImage = imageFiles[0];
  const imagePath = path.join(imagesDir, testImage);
  
  console.log('📸 === Found Image ===');
  console.log('Image:', testImage);
  console.log('Path:', imagePath);
  console.log('Size:', (fs.statSync(imagePath).size / 1024).toFixed(2), 'KB');
  console.log('\n' + '='.repeat(60) + '\n');

  try {
    console.log('🚀 === Sending to Vision Model ===');
    
    // Read image and convert to base64
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    const fileExtension = path.extname(testImage).toLowerCase().replace('.', '');
    
    // Create the exact prompt that the backend uses
    const prompt = `
Analyze this image of a fire and security systems project. Extract detailed information about:

1. **Project Type**: What type of fire/security system is shown
2. **Project Scope**: What areas/rooms are covered
3. **Timeline**: Estimated completion time based on scope
4. **Requirements**: Specific system requirements visible
5. **Vendors**: Recommended vendors for the equipment shown
6. **Estimation Elements**: Specific items with codes, quantities, specs
7. **Materials**: Equipment and materials needed
8. **Recommendations**: Best practices and suggestions
9. **Estimated Budget**: Cost range based on scope
10. **Compliance Requirements**: Safety and code requirements

Focus on extracting specific estimation elements that can be used in a bill of materials (BOM). Each element should have a unique code, clear specifications, and vendor recommendations.

Project Type: fire_security_systems

Important: Provide your response in JSON format with the following structure:
{
  "project_type": "string",
  "project_scope": "string", 
  "timeline": "string",
  "requirements": ["string"],
  "vendors": [{"name": "string", "description": "string", "specialties": ["string"], "confidence": number, "source": "string"}],
  "estimation_elements": [{"code": "string", "name": "string", "category": "string", "quantity": "string", "specifications": "string", "placement": "string", "unit_price": "string", "vendor": "string", "compliance": ["string"], "confidence": number}],
  "materials": [{"name": "string", "category": "string", "specifications": "string", "estimatedCost": "string"}],
  "recommendations": ["string"],
  "estimated_budget": "string",
  "compliance_requirements": ["string"]
}
`;

    console.log('📝 === PROMPT SENT TO VISION MODEL ===');
    console.log(prompt);
    console.log('\n' + '='.repeat(60) + '\n');

    // Test the backend image processing endpoint
    const formData = new FormData();
    formData.append('image', new Blob([imageBuffer], { type: `image/${fileExtension}` }), testImage);
    formData.append('projectType', 'fire_security_systems');
    
    console.log('📤 === Calling Backend Image Processing ===');
    console.log('Endpoint: http://localhost:3001/api/images/process');
    console.log('Model: gpt-4o (vision model)');
    console.log('Detail Level: high');
    
    const response = await fetch('http://localhost:3001/api/images/process', {
      method: 'POST',
      body: formData
    });

    if (response.ok) {
      const result = await response.json();
      
      console.log('✅ === VISION MODEL RESPONSE ===');
      console.log('Status:', response.status);
      console.log('\n📊 === Full Response ===');
      console.log(JSON.stringify(result, null, 2));
      
      console.log('\n🎯 === EXTRACTED ELEMENTS & QUANTITIES ===');
      
      if (result.data && result.data.estimationElements) {
        console.log('\n📋 Estimation Elements Found:');
        result.data.estimationElements.forEach((element, index) => {
          console.log(`\n${index + 1}. ${element.code} - ${element.name}`);
          console.log(`   Category: ${element.category}`);
          console.log(`   Quantity: ${element.quantity}`);
          console.log(`   Specifications: ${element.specifications}`);
          console.log(`   Placement: ${element.placement}`);
          console.log(`   Unit Price: ${element.unit_price}`);
          console.log(`   Vendor: ${element.vendor}`);
          console.log(`   Compliance: ${element.compliance?.join(', ')}`);
          console.log(`   Confidence: ${Math.round(element.confidence * 100)}%`);
        });
      } else {
        console.log('❌ No estimation elements found in response');
      }
      
      console.log('\n🏪 === Vendor Recommendations ===');
      if (result.data && result.data.vendors) {
        result.data.vendors.forEach((vendor, index) => {
          console.log(`${index + 1}. ${vendor.name} (${Math.round(vendor.confidence * 100)}% match)`);
          console.log(`   Description: ${vendor.description}`);
          console.log(`   Specialties: ${vendor.specialties?.join(', ')}`);
        });
      } else {
        console.log('❌ No vendor recommendations found');
      }
      
      console.log('\n📦 === Materials ===');
      if (result.data && result.data.materials) {
        result.data.materials.forEach((material, index) => {
          console.log(`${index + 1}. ${material.name}`);
          console.log(`   Category: ${material.category}`);
          console.log(`   Specifications: ${material.specifications}`);
          console.log(`   Estimated Cost: ${material.estimatedCost}`);
        });
      } else {
        console.log('❌ No materials found');
      }
      
      console.log('\n💡 === Project Details ===');
      if (result.data) {
        console.log(`Project Type: ${result.data.projectType}`);
        console.log(`Project Scope: ${result.data.projectScope}`);
        console.log(`Timeline: ${result.data.timeline}`);
        console.log(`Estimated Budget: ${result.data.estimatedBudget}`);
        console.log(`Requirements: ${result.data.requirements?.join(', ')}`);
      }
      
      console.log('\n🔧 === Model Configuration ===');
      if (result.metadata) {
        console.log(`Vision Model: ${result.metadata.model}`);
        console.log(`Detail Level: ${result.metadata.detailLevel}`);
        console.log(`Max Tokens: ${result.metadata.maxTokens}`);
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
    console.log('💡 Make sure you have a valid OpenAI API key configured');
  }
}

// Run the test
testVisionAnalysis().catch(console.error); 