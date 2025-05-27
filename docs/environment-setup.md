# Environment Setup Guide

## Required Environment Variables

### Backend Configuration
- `OPENAI_API_KEY`: Your OpenAI API key for AI-powered estimation
- `AWS_ACCESS_KEY_ID`: AWS access key for S3, DynamoDB, and other services
- `AWS_SECRET_ACCESS_KEY`: AWS secret key
- `AWS_REGION`: AWS region (default: us-east-1)
- `AWS_S3_BUCKET`: S3 bucket for file storage
- `DATABASE_URL`: PostgreSQL database connection URL
- `SECRET_KEY`: Secret key for session management and security
- `DEBUG`: Set to `True` for development, `False` for production

### Frontend Configuration
- `REACT_APP_API_URL`: Backend API URL (default: http://localhost:8001)
- `REACT_APP_ENV`: Environment name (development/production)
- `REACT_APP_AWS_REGION`: AWS region for frontend services
- `REACT_APP_S3_BUCKET`: S3 bucket name for file uploads

### Docker Configuration
- `DOCKER_COMPOSE_PROJECT_NAME`: Project name for Docker Compose

### AWS Services Configuration
- S3 Bucket: `estimator-ai-documents`
- DynamoDB Tables:
  - `estimator-projects`: Project metadata
  - `estimator-bom`: Bill of Materials data
  - `estimator-pricing`: Vendor pricing data
- Lambda Functions:
  - `estimator-file-processor`: Process uploaded files
  - `estimator-cost-calculator`: Calculate costs
  - `estimator-proposal-generator`: Generate proposals

## Setup Instructions

1. Create a `.env` file in the root directory with the following structure:
   ```
   # OpenAI Configuration
   OPENAI_API_KEY=your_openai_api_key_here
   
   # AWS Configuration
   AWS_ACCESS_KEY_ID=your_aws_access_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret_key
   AWS_REGION=us-east-1
   AWS_S3_BUCKET=estimator-ai-documents
   
   # Database Configuration
   DATABASE_URL=postgresql://user:password@localhost:5432/estimator_db
   SECRET_KEY=your_secret_key_here
   DEBUG=True
   
   # Frontend Configuration
   REACT_APP_API_URL=http://localhost:8001
   REACT_APP_ENV=development
   REACT_APP_AWS_REGION=us-east-1
   REACT_APP_S3_BUCKET=estimator-ai-documents
   ```

2. Set up AWS Services:
   ```bash
   # Create S3 bucket
   aws s3 mb s3://estimator-ai-documents
   
   # Create DynamoDB tables
   aws dynamodb create-table \
     --table-name estimator-projects \
     --attribute-definitions \
       AttributeName=project_id,AttributeType=S \
     --key-schema \
       AttributeName=project_id,KeyType=HASH \
     --provisioned-throughput \
       ReadCapacityUnits=5,WriteCapacityUnits=5
   
   # Create other tables similarly
   ```

3. Configure AWS Secrets Manager:
   ```bash
   # Store OpenAI API key
   aws secretsmanager create-secret \
     --name /estimator/openai-api-key \
     --secret-string "your_openai_api_key_here"
   
   # Store other secrets similarly
   ```

## Security Notes

- Never commit the `.env` file to version control
- Keep your API keys and secrets secure
- Use different values for development and production environments
- Regularly rotate secrets and API keys
- Enable AWS CloudTrail for audit logging
- Use AWS KMS for encryption at rest
- Implement proper IAM roles and policies

## Compliance Requirements

- SOC2 compliance for data security
- ISO 27001 compliance for information security
- Regular security audits
- Data encryption at rest and in transit
- Access logging and monitoring
- Regular backup procedures 