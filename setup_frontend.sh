#!/bin/bash

# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create .env file
cat > .env << EOL
# API Configuration
REACT_APP_API_URL=http://localhost:8001

# AWS Configuration
REACT_APP_AWS_REGION=us-east-1
REACT_APP_AWS_ACCESS_KEY_ID=your_aws_access_key
REACT_APP_AWS_SECRET_ACCESS_KEY=your_aws_secret_key

# OpenAI Configuration
REACT_APP_OPENAI_API_KEY=your_openai_api_key
REACT_APP_OPENAI_MODEL=gpt-4
EOL

echo "Frontend setup complete! Please update the .env file with your actual credentials." 