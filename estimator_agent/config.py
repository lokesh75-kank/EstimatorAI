import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# AWS Configuration
AWS_CONFIG = {
    'region_name': os.getenv('AWS_REGION', 'us-east-1'),
    'aws_access_key_id': os.getenv('AWS_ACCESS_KEY_ID'),
    'aws_secret_access_key': os.getenv('AWS_SECRET_ACCESS_KEY'),
}

# S3 bucket for storing project documents and drawings
S3_BUCKET = os.getenv('AWS_S3_BUCKET', 'estimator-ai-documents')

# DynamoDB tables
DYNAMODB_TABLES = {
    'estimates': os.getenv('DYNAMODB_ESTIMATES_TABLE', 'estimator-ai-estimates'),
    'proposals': os.getenv('DYNAMODB_PROPOSALS_TABLE', 'estimator-ai-proposals'),
    'clients': os.getenv('DYNAMODB_CLIENTS_TABLE', 'estimator-ai-clients'),
}

# OpenAI Configuration
OPENAI_CONFIG = {
    'api_key': os.getenv('OPENAI_API_KEY'),
    'model': os.getenv('OPENAI_MODEL', 'gpt-4-turbo-preview'),
    'temperature': float(os.getenv('OPENAI_TEMPERATURE', '0.7')),
    'max_tokens': int(os.getenv('OPENAI_MAX_TOKENS', '2000')),
}

# AWS Services Configuration
AWS_SERVICES = {
    's3': True,  # For document storage
    'dynamodb': True,  # For data persistence
    'textract': True,  # For document analysis
    'comprehend': True,  # For text analysis
    'lambda': True,  # For serverless functions
}

# Feature Flags
FEATURES = {
    'document_analysis': True,  # Use AWS Textract for document analysis
    'ai_estimation': True,  # Use OpenAI for estimation
    'smart_recommendations': True,  # Use AI for recommendations
    'compliance_checking': True,  # Use AI for compliance verification
} 