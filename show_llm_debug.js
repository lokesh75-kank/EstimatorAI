const fs = require('fs');

console.log('🔍 === LLM Debug Information ===\n');

// Test the debug endpoint
async function showLLMDebug() {
  const testText = `
Project: Fire Alarm System Installation
Location: Office Building, 123 Main St
Building Type: Office Building
Square Footage: 15,000 sq ft
Number of Floors: 3

Requirements:
- Smoke detectors in all rooms (45 units required)
- Fire alarm control panel with monitoring (2 panels needed)
- Emergency lighting system
- Pull stations at exits (6 units)
- Heat detectors in mechanical rooms (8 units)

Technical Specifications:
- UL listed equipment required
- NFPA 72 compliant system
- 24/7 monitoring service

Vendor: ACME Fire & Security Systems
Timeline: 6-8 weeks
Budget: $45,000 - $65,000
`;

  try {
    console.log('📄 === Test Document ===');
    console.log(testText);
    console.log('\n' + '='.repeat(60) + '\n');

    console.log('🚀 === Calling LLM Debug Endpoint ===');
    
    const response = await fetch('http://localhost:3001/api/documents/debug', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: testText,
        projectType: 'fire_security_systems'
      })
    });

    if (response.ok) {
      const result = await response.json();
      
      console.log('✅ === LLM Debug Response ===');
      console.log('\n🤖 === PROMPT SENT TO OPENAI ===');
      console.log(result.prompt);
      
      console.log('\n' + '='.repeat(60));
      console.log('🤖 === RAW LLM RESPONSE ===');
      console.log(result.rawResponse);
      
      console.log('\n' + '='.repeat(60));
      console.log('📊 === PARSED JSON ===');
      console.log(JSON.stringify(result.parsedData, null, 2));
      
      console.log('\n' + '='.repeat(60));
      console.log('🎯 === KEY EXTRACTIONS ===');
      
      if (result.parsedData) {
        const data = result.parsedData;
        
        console.log('\n📋 Estimation Elements:');
        if (data.estimation_elements && data.estimation_elements.length > 0) {
          data.estimation_elements.forEach((element, index) => {
            console.log(`  ${index + 1}. ${element.code || 'N/A'} - ${element.name || element.description || 'N/A'}`);
            console.log(`     Qty: ${element.quantity || 'N/A'}, Price: ${element.unit_price || 'N/A'}`);
            console.log(`     Vendor: ${element.vendor || 'N/A'}`);
            console.log(`     Specs: ${element.specifications || 'N/A'}`);
            console.log('');
          });
        } else {
          console.log('  No estimation elements found');
        }
        
        console.log('\n🏪 Vendors:');
        if (data.vendors && data.vendors.length > 0) {
          data.vendors.forEach((vendor, index) => {
            console.log(`  ${index + 1}. ${vendor.name || 'N/A'} (${vendor.confidence || 'N/A'} confidence)`);
            console.log(`     Description: ${vendor.description || 'N/A'}`);
            console.log(`     Specialties: ${vendor.specialties?.join(', ') || 'N/A'}`);
            console.log('');
          });
        } else {
          console.log('  No vendors found');
        }
        
        console.log('\n📦 Materials:');
        if (data.materials && data.materials.length > 0) {
          data.materials.forEach((material, index) => {
            console.log(`  ${index + 1}. ${material.name || 'N/A'}`);
            console.log(`     Category: ${material.category || 'N/A'}`);
            console.log(`     Specs: ${material.specifications || 'N/A'}`);
            console.log(`     Cost: ${material.estimatedCost || 'N/A'}`);
            console.log('');
          });
        } else {
          console.log('  No materials found');
        }
        
        console.log('\n💡 Recommendations:');
        if (data.recommendations && data.recommendations.length > 0) {
          data.recommendations.forEach((rec, index) => {
            console.log(`  ${index + 1}. ${rec}`);
          });
        } else {
          console.log('  No recommendations found');
        }
        
        console.log('\n📊 Project Details:');
        console.log(`  Type: ${data.project_type || 'N/A'}`);
        console.log(`  Scope: ${data.project_scope || 'N/A'}`);
        console.log(`  Timeline: ${data.timeline || 'N/A'}`);
        console.log(`  Budget: ${data.estimated_budget || 'N/A'}`);
        
      } else {
        console.log('❌ No parsed data available');
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
    console.log('💡 Make sure the debug endpoint is available');
  }
}

showLLMDebug().catch(console.error); 