const fs = require('fs');

async function testLLMDebug() {
  console.log('🔍 Testing LLM Debug Endpoint\n');

  const testText = `
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

  try {
    console.log('📤 Sending test document to debug endpoint...');
    
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
      
      console.log('✅ Debug endpoint successful!\n');
      console.log('📊 DEBUG RESULTS:');
      console.log('Prompt Length:', result.debug.prompt.length, 'characters');
      console.log('Response Length:', result.debug.response.length, 'characters');
      
      if (result.debug.response.parsed) {
        console.log('\n🎯 PARSED DATA:');
        console.log('- Project Type:', result.debug.response.parsed.project_type);
        console.log('- Timeline:', result.debug.response.parsed.timeline);
        console.log('- Estimated Budget:', result.debug.response.parsed.estimated_budget);
        
        if (result.debug.response.parsed.estimation_elements) {
          console.log('- Estimation Elements:', result.debug.response.parsed.estimation_elements.length, 'items');
          result.debug.response.parsed.estimation_elements.forEach((element, index) => {
            console.log(`  ${index + 1}. ${element.code} - ${element.name} (${element.quantity} units)`);
          });
        }
        
        if (result.debug.response.parsed.vendors) {
          console.log('- Vendors:', result.debug.response.parsed.vendors.length, 'recommendations');
          result.debug.response.parsed.vendors.forEach((vendor, index) => {
            console.log(`  ${index + 1}. ${vendor.name} (${Math.round(vendor.confidence * 100)}% confidence)`);
          });
        }
      }
      
      if (result.debug.response.parseError) {
        console.log('\n❌ PARSE ERROR:', result.debug.response.parseError);
      }
      
      console.log('\n📝 To see the full prompt and response, check the backend console output.');
      console.log('💡 The backend console will show the complete LLM interaction.');
      
    } else {
      const error = await response.text();
      console.log('❌ Debug endpoint failed:', error);
    }
  } catch (error) {
    console.log('❌ Error testing debug endpoint:', error.message);
  }
}

// Run the test
testLLMDebug(); 