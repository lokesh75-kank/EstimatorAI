#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}Starting setup for Estimator AI...${NC}"

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}Python 3 is not installed. Please install Python 3 first.${NC}"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js is not installed. Please install Node.js first.${NC}"
    exit 1
fi

# Create and activate virtual environment
echo -e "${BLUE}Setting up Python virtual environment...${NC}"
python3 -m venv venv
source venv/bin/activate

# Install Python dependencies
echo -e "${BLUE}Installing Python dependencies...${NC}"
pip install --upgrade pip
pip install --upgrade setuptools wheel
pip install -r requirements.txt
pip install -e .  # Install the estimator_agent package

# Check if Python installation was successful
if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to install Python dependencies. Please check the error messages above.${NC}"
    exit 1
fi

# Create necessary directories
echo -e "${BLUE}Creating necessary directories...${NC}"
mkdir -p logs backups

# Create backend .env file
echo -e "${BLUE}Creating backend .env file...${NC}"
cat > estimator_agent/.env << EOL
# API Settings
API_KEY=your_api_key_here
ALLOWED_ORIGINS=http://localhost:3000
ALLOWED_HOSTS=*

# Database Settings
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/estimator

# Redis Settings
REDIS_URL=redis://localhost:6379

# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_S3_BUCKET=estimator-ai-documents
SES_INCOMING_BUCKET=estimator-ai-emails
SES_INCOMING_PREFIX=incoming/
SES_EMAIL_SENDER=noreply@yourdomain.com
SES_NOTIFICATION_RECIPIENTS=admin@yourdomain.com

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4
OPENAI_TEMPERATURE=0.7
OPENAI_MAX_TOKENS=2000

# Vector Database Configuration
VECTOR_DB_PROVIDER=pinecone
VECTOR_DB_API_KEY=your_pinecone_api_key
VECTOR_DB_ENVIRONMENT=us-west1-gcp
VECTOR_DB_INDEX_NAME=estimator-ai

# Application Settings
APP_NAME=Fire & Security Systems Estimator
DEBUG=True
VERSION=1.0.0

# Rate Limiting
RATE_LIMIT_PER_MINUTE=60

# Logging Settings
LOG_LEVEL=INFO
LOG_FORMAT=%(asctime)s - %(name)s - %(levelname)s - %(message)s
LOG_FILE=api.log
LOG_MAX_BYTES=10485760
LOG_BACKUP_COUNT=5

# Backup Settings
BACKUP_DIR=backups
BACKUP_RETENTION_DAYS=30
EOL

# Create frontend .env file
echo -e "${BLUE}Creating frontend .env file...${NC}"
cat > .env.local << EOL
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here

# AWS Configuration
NEXT_PUBLIC_AWS_REGION=us-east-1
NEXT_PUBLIC_AWS_ACCESS_KEY_ID=your_aws_access_key
NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY=your_aws_secret_key

# OpenAI Configuration
NEXT_PUBLIC_OPENAI_MODEL=gpt-4
EOL

# Install Node.js dependencies
echo -e "${BLUE}Installing Node.js dependencies...${NC}"
npm install

# Fix npm vulnerabilities
echo -e "${BLUE}Fixing npm vulnerabilities...${NC}"
npm audit fix --force

# Build the Next.js application
echo -e "${BLUE}Building Next.js application...${NC}"
npm run build

# Check if build was successful
if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to build Next.js application. Please check the error messages above.${NC}"
    exit 1
fi

# Start PostgreSQL and Redis using Docker
echo -e "${BLUE}Starting PostgreSQL and Redis...${NC}"
docker-compose up -d postgres redis

# Wait for PostgreSQL to be ready
echo -e "${BLUE}Waiting for PostgreSQL to be ready...${NC}"
sleep 10

# Initialize database
echo -e "${BLUE}Initializing database...${NC}"
python -c "from estimator_agent.database import init_db; init_db()"

echo -e "${GREEN}Setup completed successfully!${NC}"
echo -e "${BLUE}To start the development servers:${NC}"
echo "1. Activate the virtual environment: source venv/bin/activate"
echo "2. Start the backend server: uvicorn backend.main:app --reload"
echo "3. In a new terminal, start the frontend: npm run dev"
echo -e "${RED}Important: Please update the .env files with your actual credentials before starting the servers.${NC}" 