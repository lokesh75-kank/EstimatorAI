# AI-Powered Data Source Integration Guide

## Overview

The Estimator AI agent now includes advanced AI-powered document processing capabilities for connecting to data sources. When users upload project documents, the AI agent automatically analyzes the content and provides intelligent recommendations for vendors, materials, and project details.

## Features

### 🔍 **Intelligent Document Analysis**
- **Multi-format Support**: PDF, DOCX, TXT files
- **AI-Powered Extraction**: Automatically extracts project requirements, specifications, and constraints
- **Vendor Recommendations**: Suggests appropriate vendors based on project scope and requirements
- **Material Suggestions**: Recommends materials and equipment with estimated costs
- **Project Insights**: Analyzes timeline, budget, and technical requirements

### 🎯 **Specialized for Fire & Security Systems**
The AI is specifically trained to understand:
- Fire detection and alarm systems
- Security and access control systems
- Emergency lighting and backup systems
- Compliance requirements (NFPA, UL, etc.)
- Installation and maintenance considerations

## How to Use

### 1. Access Data Sources
Navigate to the Data Sources page:
```
http://localhost:3000/data-sources
```

### 2. Add New Data Source
1. Click **"Add Data Source"** button
2. Select **"File Upload"** as the data source type
3. Enter a descriptive name for your data source

### 3. Upload Project Documents
1. **Drag & Drop** or **Click to Browse** your project documents
2. Supported formats: PDF, DOCX, TXT (up to 20MB)
3. Multiple files can be uploaded simultaneously

### 4. AI Analysis Process
The system will automatically:
1. **Upload** your files to secure storage
2. **Extract** text content from documents
3. **Analyze** content using GPT-4 AI model
4. **Generate** structured recommendations
5. **Display** results in an organized interface

### 5. Review AI Recommendations

#### 🏢 **Vendor Recommendations**
- **Vendor Name**: Matched vendor companies
- **Confidence Score**: AI confidence in the recommendation
- **Specialties**: Vendor's areas of expertise
- **Description**: Brief vendor overview

#### 📦 **Material Recommendations**
- **Material Name**: Recommended equipment/components
- **Category**: Type of material (Fire Detection, Security, etc.)
- **Specifications**: Technical details and requirements
- **Estimated Cost**: Price range for the material

#### 📋 **Project Analysis**
- **Project Type**: Categorized project scope
- **Timeline**: Estimated completion time
- **Requirements**: Key project requirements
- **Scope**: Detailed project description

#### 💡 **AI Recommendations**
- **Best Practices**: Industry recommendations
- **Compliance Notes**: Regulatory considerations
- **Integration Tips**: System coordination advice
- **Risk Mitigation**: Potential issues and solutions

## Technical Architecture

### Frontend Components
```
frontend/components/data-sources/wizard/Step2FileUpload.tsx
├── File upload interface with drag & drop
├── Real-time upload progress tracking
├── AI analysis results display
└── Vendor and material recommendations
```

### Backend Services
```
backend/src/services/document-processor/
├── LLMProcessor.ts          # AI analysis engine
├── DocumentProcessor.ts     # Main processing pipeline
├── parsers/                 # File format parsers
├── chunking/               # Document segmentation
└── validation/             # Data validation
```

### API Endpoints
```
POST /api/documents/upload          # File upload
POST /api/documents/process         # AI processing
POST /api/documents/process-json    # Process existing files
```

## Configuration

### Environment Variables
```bash
# Backend (.env)
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4o-mini
OPENAI_MAX_TOKENS=2000
OPENAI_TEMPERATURE=0.7

# Vision Model Configuration (.env.openai)
VISION_MODEL=gpt-4-vision-preview
VISION_MODEL_ENABLED=true
VISION_DETAIL_LEVEL=high
VISION_MAX_TOKENS=4096
VISION_SUPPORTED_FORMATS=jpg,jpeg,png,gif,bmp,webp

# Frontend (.env.local)
BACKEND_URL=http://localhost:3001
```

### Dual Model Configuration
The system uses different AI models for different types of content:

#### 📄 **Document Processing** (`gpt-4o-mini`)
- **Purpose**: Text-based document analysis (PDFs, Word docs, text files)
- **Model**: GPT-4o Mini (fast, cost-effective)
- **Features**: 
  - Document text extraction and analysis
  - Estimation element identification
  - Vendor recommendations
  - Compliance requirement extraction
- **Max Tokens**: 2000
- **Temperature**: 0.7

#### 🖼️ **Image Processing** (`gpt-4-vision-preview`)
- **Purpose**: Visual analysis of project images, drawings, and diagrams
- **Model**: GPT-4 Vision Preview (high detail analysis)
- **Features**:
  - Visual project scope analysis
  - Equipment identification from images
  - Drawing and diagram interpretation
  - Spatial layout analysis
  - Visual compliance checking
- **Max Tokens**: 4096
- **Detail Level**: High
- **Supported Formats**: JPG, JPEG, PNG, GIF, BMP, WEBP

## API Endpoints

### Document Processing
```
POST /api/documents/process          # Process uploaded documents
POST /api/documents/process-json     # Process existing files
```

### Image Processing
```
POST /api/images/process             # Upload and process images
POST /api/images/process-url         # Process images from URL
GET  /api/images/supported-formats   # Get supported image formats
```

## Testing

### Run the Test Suite
```bash
# Test LLM integration
cd backend
npm test -- --testPathPattern=llm-processor.test.ts

# Test complete workflow
node test_data_source_workflow.js
```

### Manual Testing
1. Start both servers:
   ```bash
   # Backend
   cd backend && npm start
   
   # Frontend
   cd frontend && npm run dev
   ```

2. Navigate to data sources page
3. Upload a test document
4. Verify AI analysis results

## Example Document Format

For best results, structure your documents with clear sections:

```
Project: Fire Alarm System Installation
Location: Office Building, 123 Main St

Requirements:
- Smoke detectors in all rooms
- Fire alarm control panel
- Emergency lighting system

Vendor: ACME Fire & Security
Timeline: 4-6 weeks
Budget: $25,000 - $35,000

Technical Specifications:
- UL listed equipment
- NFPA 72 compliant
- 24/7 monitoring service

Materials Required:
- Smoke detectors (photoelectric)
- Control panel
- Emergency lights
- Wiring and conduit
```

## Troubleshooting

### Common Issues

#### 1. **File Upload Fails**
- Check file size (max 20MB)
- Verify file format (PDF, DOCX, TXT)
- Ensure upload directory exists

#### 2. **AI Analysis Fails**
- Verify OpenAI API key is configured
- Check API rate limits
- Ensure sufficient tokens available

#### 3. **No Recommendations Generated**
- Check document content quality
- Verify document contains relevant information
- Try with a more detailed document

#### 4. **Backend Connection Issues**
- Verify backend server is running on port 3001
- Check CORS configuration
- Ensure network connectivity

### Debug Mode
Enable detailed logging:
```bash
# Backend
NODE_ENV=development npm start

# Frontend
NEXT_PUBLIC_DEBUG=true npm run dev
```

## Performance Considerations

### Token Management
- Large documents are automatically chunked
- Token limits are enforced to prevent API errors
- Processing time scales with document size

### Rate Limiting
- OpenAI API has rate limits (30000 tokens/minute)
- System includes retry logic and error handling
- Consider upgrading OpenAI plan for high-volume usage

### Caching
- Analysis results are cached to improve performance
- Cache TTL is configurable (default: 1 hour)
- Cache can be cleared through admin interface

## Security

### File Handling
- Uploaded files are processed securely
- Files are automatically cleaned up after processing
- No sensitive data is stored permanently

### API Security
- OpenAI API key is stored securely
- All API calls are authenticated
- Rate limiting prevents abuse

## Future Enhancements

### Planned Features
- **Multi-language Support**: Analysis in different languages
- **Advanced Parsing**: Support for CAD files and technical drawings
- **Integration APIs**: Connect to vendor databases
- **Machine Learning**: Continuous improvement from user feedback
- **Batch Processing**: Process multiple documents simultaneously

### Customization
- **Domain-specific Models**: Specialized AI for different industries
- **Custom Prompts**: Configurable analysis criteria
- **Vendor Database**: Integration with vendor management systems

## Support

For technical support or feature requests:
1. Check the troubleshooting section above
2. Review the test suite for examples
3. Examine the source code for implementation details
4. Create an issue in the project repository

---

**Note**: This AI-powered data source integration significantly enhances the estimator's capabilities by providing intelligent, context-aware recommendations based on actual project documents. The system learns from each analysis to improve future recommendations. 