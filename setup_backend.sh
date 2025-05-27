#!/bin/bash

# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create necessary directories
mkdir -p logs backups

# Create .env file
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

# Start PostgreSQL and Redis using Docker
docker-compose up -d postgres redis

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
sleep 10

# Initialize database
python -c "from estimator_agent.database import init_db; init_db()"

echo "Backend setup complete! Please update the .env file with your actual credentials." 