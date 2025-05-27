# Development Setup Guide

## Prerequisites

- Python 3.9 or higher
- Node.js 16 or higher
- PostgreSQL
- AWS CLI configured
- Docker and Docker Compose (optional)

## Backend Setup

1. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Set up the database:
   ```bash
   # Create a PostgreSQL database
   createdb estimator_db
   
   # Run migrations
   python manage.py migrate
   ```

4. Start the backend server:
   ```bash
   uvicorn estimator_agent.api:app --reload --port 8001
   ```

## Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

## AWS Services Setup

1. Create required S3 buckets:
   ```bash
   aws s3 mb s3://estimator-ai-documents
   ```

2. Create DynamoDB tables:
   ```bash
   # Projects table
   aws dynamodb create-table \
     --table-name estimator-projects \
     --attribute-definitions \
       AttributeName=project_id,AttributeType=S \
     --key-schema \
       AttributeName=project_id,KeyType=HASH \
     --provisioned-throughput \
       ReadCapacityUnits=5,WriteCapacityUnits=5

   # BOM table
   aws dynamodb create-table \
     --table-name estimator-bom \
     --attribute-definitions \
       AttributeName=project_id,AttributeType=S \
     --key-schema \
       AttributeName=project_id,KeyType=HASH \
     --provisioned-throughput \
       ReadCapacityUnits=5,WriteCapacityUnits=5

   # Pricing table
   aws dynamodb create-table \
     --table-name estimator-pricing \
     --attribute-definitions \
       AttributeName=item_id,AttributeType=S \
     --key-schema \
       AttributeName=item_id,KeyType=HASH \
     --provisioned-throughput \
       ReadCapacityUnits=5,WriteCapacityUnits=5
   ```

3. Set up Lambda functions:
   ```bash
   # Create deployment packages
   cd lambda/file-processor
   zip -r ../file-processor.zip .
   
   # Create Lambda functions
   aws lambda create-function \
     --function-name estimator-file-processor \
     --runtime python3.9 \
     --handler app.lambda_handler \
     --zip-file fileb://file-processor.zip \
     --role arn:aws:iam::YOUR_ACCOUNT_ID:role/lambda-role
   ```

## Development Workflow

1. Create a new branch for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and commit them:
   ```bash
   git add .
   git commit -m "Description of your changes"
   ```

3. Push your changes and create a pull request:
   ```bash
   git push origin feature/your-feature-name
   ```

## Running Tests

### Backend Tests
```bash
pytest
```

### Frontend Tests
```bash
cd frontend
npm test
```

### End-to-End Tests
```bash
cd frontend
npm run test:e2e
```

## Code Style

- Backend: Follow PEP 8 guidelines
- Frontend: Use ESLint and Prettier for code formatting
- Run linters before committing:
  ```bash
  # Backend
  flake8
  
  # Frontend
  cd frontend
  npm run lint
  ```

## Debugging

- Backend: Use Python debugger (pdb) or IDE debugger
- Frontend: Use React Developer Tools and browser dev tools
- AWS Services: Use CloudWatch for logs and monitoring
- Check logs in the terminal or Docker logs if using containers

## Security Best Practices

1. Never commit sensitive data:
   - API keys
   - AWS credentials
   - Database credentials
   - Environment variables

2. Use AWS Secrets Manager for sensitive data:
   ```bash
   aws secretsmanager create-secret \
     --name /estimator/dev/openai-api-key \
     --secret-string "your_api_key_here"
   ```

3. Follow the principle of least privilege for AWS IAM roles

4. Enable CloudTrail for audit logging

5. Use AWS KMS for encryption at rest

## Compliance Requirements

1. Follow SOC2 compliance guidelines:
   - Data security
   - Access control
   - Audit logging
   - Incident response

2. Implement ISO 27001 controls:
   - Information security
   - Risk management
   - Asset management
   - Access control

3. Regular security audits and penetration testing

4. Data backup and recovery procedures

## Docker Setup (Optional)

1. Build and start the containers:
   ```bash
   docker-compose up --build
   ```

2. Access the applications:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:8000 