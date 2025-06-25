const fs = require('fs');
const path = require('path');

console.log('📖 === File Reading Test ===\n');

// Test file reading from different locations
async function testFileReading() {
  const testLocations = [
    {
      name: 'Frontend Uploads',
      path: path.join(__dirname, 'uploads'),
      description: 'Frontend uploads directory'
    },
    {
      name: 'Backend Documents',
      path: path.join(__dirname, 'backend', 'uploads', 'documents'),
      description: 'Backend documents directory'
    },
    {
      name: 'Backend Images',
      path: path.join(__dirname, 'backend', 'uploads', 'images'),
      description: 'Backend images directory'
    }
  ];

  for (const location of testLocations) {
    console.log(`🔍 === Testing ${location.name} ===`);
    console.log(`Path: ${location.path}`);
    console.log(`Description: ${location.description}`);
    
    try {
      // Check if directory exists
      if (fs.existsSync(location.path)) {
        console.log('✅ Directory exists');
        
        // List files in directory
        const files = fs.readdirSync(location.path);
        console.log(`📁 Files found: ${files.length}`);
        
        if (files.length > 0) {
          console.log('📄 Files:');
          files.forEach(file => {
            const filePath = path.join(location.path, file);
            const stats = fs.statSync(filePath);
            const sizeKB = (stats.size / 1024).toFixed(2);
            console.log(`  - ${file} (${sizeKB} KB)`);
            
            // Try to read the first few bytes to verify file is accessible
            try {
              const buffer = fs.readFileSync(filePath, { encoding: null, flag: 'r' });
              console.log(`    ✅ File is readable (${buffer.length} bytes)`);
            } catch (readError) {
              console.log(`    ❌ File read error: ${readError.message}`);
            }
          });
        } else {
          console.log('📭 No files found');
        }
      } else {
        console.log('❌ Directory does not exist');
      }
    } catch (error) {
      console.log(`❌ Error checking directory: ${error.message}`);
    }
    
    console.log('');
  }
}

// Test backend file processing endpoints
async function testBackendEndpoints() {
  console.log('🚀 === Testing Backend Endpoints ===\n');
  
  // Test document processing endpoint
  try {
    console.log('📄 Testing document processing endpoint...');
    const response = await fetch('http://localhost:3001/api/documents/process-json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filePath: path.join(__dirname, 'uploads', 'REQUEST FOR PROPOSAL (RFP).docx'),
        fileName: 'REQUEST FOR PROPOSAL (RFP).docx',
        projectType: 'fire_security_systems'
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Document processing successful');
      console.log('Response:', JSON.stringify(result, null, 2));
    } else {
      const errorText = await response.text();
      console.log('❌ Document processing failed');
      console.log('Error:', errorText);
    }
  } catch (error) {
    console.log('❌ Document processing error:', error.message);
  }
  
  console.log('');
  
  // Test image processing endpoint
  try {
    console.log('🖼️ Testing image processing endpoint...');
    
    // Check if there are any images in the backend/images directory
    const imagesDir = path.join(__dirname, 'backend', 'uploads', 'images');
    if (fs.existsSync(imagesDir)) {
      const imageFiles = fs.readdirSync(imagesDir).filter(file => 
        /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(file)
      );
      
      if (imageFiles.length > 0) {
        const testImage = imageFiles[0];
        const imagePath = path.join(imagesDir, testImage);
        
        console.log(`Testing with image: ${testImage}`);
        
        const formData = new FormData();
        const imageBuffer = fs.readFileSync(imagePath);
        formData.append('image', new Blob([imageBuffer], { type: 'image/jpeg' }), testImage);
        formData.append('projectType', 'fire_security_systems');
        
        const response = await fetch('http://localhost:3001/api/images/process', {
          method: 'POST',
          body: formData
        });

        if (response.ok) {
          const result = await response.json();
          console.log('✅ Image processing successful');
          console.log('Response:', JSON.stringify(result, null, 2));
        } else {
          const errorText = await response.text();
          console.log('❌ Image processing failed');
          console.log('Error:', errorText);
        }
      } else {
        console.log('📭 No image files found in backend/uploads/images/');
      }
    } else {
      console.log('❌ Backend images directory does not exist');
    }
  } catch (error) {
    console.log('❌ Image processing error:', error.message);
  }
}

// Run tests
async function runTests() {
  await testFileReading();
  await testBackendEndpoints();
  
  console.log('🎉 === File Reading Test Complete ===');
  console.log('\n💡 Summary:');
  console.log('- Check if directories exist and are accessible');
  console.log('- Verify files can be read by the backend');
  console.log('- Test both document and image processing endpoints');
}

runTests().catch(console.error); 