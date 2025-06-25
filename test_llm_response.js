const fs = require('fs');
const path = require('path');

console.log('🤖 === LLM Response Test ===\n');

// Test document content
const testDocument = `
Project: Fire Alarm System Installation
Location: Office Building, 123 Main St, Downtown
Building Type: Office Building
Square Footage: 15,000 sq ft
Number of Floors: 3

Requirements:
- Smoke detectors in all rooms (45 units required)
- Fire alarm control panel with monitoring (2 panels needed)
- Emergency lighting system
- Sprinkler system integration
- Access control system
- Pull stations at exits (6 units)
- Heat detectors in mechanical rooms (8 units)

Technical Specifications:
- UL listed equipment required
- NFPA 72 compliant system
- 24/7 monitoring service
- Backup power system
- Integration with building management system

Materials Required:
- Smoke detectors (photoelectric and ionization) - 45 units
- Control panel (Fire-Lite MS-9200UDLS) - 2 units
- Emergency lights (LED type) - 12 units
- Wiring and conduit - 2000 feet
- Mounting hardware - 60 sets
- Pull stations (manual activation) - 6 units
- Heat detectors (135°F fixed temperature) - 8 units

Vendor: ACME Fire & Security Systems
Timeline: 6-8 weeks
Budget: $45,000 - $65,000
`;

async function testLLMResponse() {
  console.log('📄 === Test Document ===');
  console.log(testDocument);
  console.log('\n' + '='.repeat(80) + '\n');

  try {
    console.log('🚀 === Sending to LLM ===');
    console.log('Calling /api/documents/process...\n');

    const response = await fetch('http://localhost:3000/api/documents/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filePath: 'test_document.txt',
        fileName: 'test_document.txt',
        projectType: 'fire_security_systems'
      })
    });

    if (response.ok) {
      const result = await response.json();
      
      console.log('✅ === LLM Response Received ===');
      console.log('Status:', response.status);
      console.log('Response Time:', response.headers.get('x-response-time') || 'N/A');
      console.log('\n📊 === Full Response ===');
      console.log(JSON.stringify(result, null, 2));
      
      console.log('\n🎯 === Key Analysis Results ===');
      
      if (result.analysis) {
        const analysis = result.analysis;
        
        console.log('\n🏢 === Project Details ===');
        if (analysis.projectDetails) {
          console.log('Type:', analysis.projectDetails.type);
          console.log('Scope:', analysis.projectDetails.scope);
          console.log('Timeline:', analysis.projectDetails.timeline);
          console.log('Requirements:', analysis.projectDetails.requirements?.join(', '));
        }
        
        console.log('\n📋 === Estimation Elements ===');
        if (analysis.estimationElements && analysis.estimationElements.length > 0) {
          analysis.estimationElements.forEach((element, index) => {
            console.log(`${index + 1}. ${element.code} - ${element.description}`);
            console.log(`   Qty: ${element.qty}, Price: $${element.unitPrice}, Vendor: ${element.vendor}`);
            console.log(`   Specs: ${element.specSummary}`);
            console.log('');
          });
        } else {
          console.log('No estimation elements found');
        }
        
        console.log('\n🏪 === Vendor Recommendations ===');
        if (analysis.vendors && analysis.vendors.length > 0) {
          analysis.vendors.forEach((vendor, index) => {
            console.log(`${index + 1}. ${vendor.name} (${Math.round(vendor.confidence * 100)}% match)`);
            console.log(`   Description: ${vendor.description}`);
            console.log(`   Specialties: ${vendor.specialties?.join(', ')}`);
            console.log('');
          });
        } else {
          console.log('No vendor recommendations found');
        }
        
        console.log('\n📦 === Materials ===');
        if (analysis.materials && analysis.materials.length > 0) {
          analysis.materials.forEach((material, index) => {
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
        if (analysis.recommendations && analysis.recommendations.length > 0) {
          analysis.recommendations.forEach((rec, index) => {
            console.log(`${index + 1}. ${rec}`);
          });
        } else {
          console.log('No recommendations found');
        }
        
      } else {
        console.log('❌ No analysis data in response');
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
    console.log('\n💡 Make sure your frontend server is running on http://localhost:3000');
  }
}

// Also test the backend directly to see raw LLM response
async function testBackendLLM() {
  console.log('\n' + '='.repeat(80));
  console.log('🔧 === Testing Backend LLM Directly ===\n');
  
  try {
    console.log('🚀 === Calling Backend /api/documents/process-json ===');
    
    const response = await fetch('http://localhost:3001/api/documents/process-json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filePath: 'test_document.txt',
        fileName: 'test_document.txt',
        projectType: 'fire_security_systems',
        content: testDocument
      })
    });

    if (response.ok) {
      const result = await response.json();
      
      console.log('✅ === Backend LLM Response ===');
      console.log('Status:', response.status);
      console.log('\n📊 === Raw Backend Response ===');
      console.log(JSON.stringify(result, null, 2));
      
    } else {
      const errorText = await response.text();
      console.log('❌ === Backend Error ===');
      console.log('Status:', response.status);
      console.log('Error:', errorText);
    }
    
  } catch (error) {
    console.log('❌ === Backend Network Error ===');
    console.log('Error:', error.message);
    console.log('\n💡 Make sure your backend server is running on http://localhost:3001');
  }
}

// Run both tests
async function runTests() {
  await testLLMResponse();
  await testBackendLLM();
  
  console.log('\n' + '='.repeat(80));
  console.log('🎉 === Test Complete ===');
  console.log('\n💡 Tips:');
  console.log('- Check the backend console for detailed LLM prompts and responses');
  console.log('- The backend logs show the exact prompt sent to OpenAI');
  console.log('- Frontend transforms the response for display');
  console.log('- Use the debug endpoint for more detailed analysis');
}

runTests().catch(console.error); 