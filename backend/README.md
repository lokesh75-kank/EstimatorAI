# AI Estimator Backend

This is the backend service for the AI Estimator system, handling project management, estimation generation, and AI analysis for fire alarm and security system proposals.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory with the following variables:
```
# Server Configuration
PORT=3001
NODE_ENV=development

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Agent API Configuration
AGENT_API_URL=http://localhost:8000
AGENT_API_KEY=your_agent_api_key_here

# File Upload Configuration
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10485760  # 10MB in bytes
```

3. Build the TypeScript code:
```bash
npm run build
```

4. Start the development server:
```bash
npm run dev
```

## Integration with Python Agent

This backend service integrates with a Python-based AI agent that handles the core estimation logic. The agent should be running on the URL specified in `AGENT_API_URL` (default: http://localhost:8000).

To start the Python agent:
1. Navigate to the `estimator_agent` directory
2. Install Python dependencies
3. Start the FastAPI server

## API Endpoints

### Projects

- `POST /api/projects` - Create a new project
- `GET /api/projects/:id` - Get project details
- `GET /api/projects` - List all projects
- `POST /api/projects/:id/files` - Upload project files

### Estimates

- `POST /api/estimates` - Create a new estimate
- `GET /api/estimates/:id` - Get estimate details
- `GET /api/estimates/project/:projectId` - List project estimates

### Analysis

- `POST /api/analysis` - Request AI analysis
- `GET /api/analysis/:id` - Get analysis results
- `GET /api/analysis/project/:projectId` - List project analyses

## Development

The project uses:
- TypeScript for type safety
- Express.js for the web server
- OpenAI API for AI analysis
- Zod for request validation
- Axios for HTTP requests to the Python agent

## Project Structure

```
src/
  ├── controllers/    # Request handlers
  ├── services/      # Business logic
  │   ├── agent.service.ts    # Python agent integration
  │   ├── project.service.ts  # Project management
  │   ├── estimate.service.ts # Estimate generation
  │   └── analysis.service.ts # AI analysis
  ├── routes/        # API routes
  └── index.ts       # Application entry point
```

## Environment Variables

- `PORT`: The port number for the server (default: 3001)
- `OPENAI_API_KEY`: Your OpenAI API key
- `NODE_ENV`: Environment mode (development/production)
- `AGENT_API_URL`: URL of the Python agent API
- `AGENT_API_KEY`: API key for the Python agent
- `UPLOAD_DIR`: Directory for file uploads
- `MAX_FILE_SIZE`: Maximum file size in bytes 