import os
from dotenv import load_dotenv
from dataclasses import dataclass
from typing import Optional, Dict, Any, List
from pydantic_settings import BaseSettings
from pydantic.networks import PostgresDsn, RedisDsn
from functools import lru_cache

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

# AWS SES Configuration
SES_CONFIG = {
    'incoming_bucket': os.getenv('SES_INCOMING_BUCKET', 'estimator-ai-emails'),
    'incoming_prefix': os.getenv('SES_INCOMING_PREFIX', 'incoming/'),
    'email_sender': os.getenv('SES_EMAIL_SENDER', 'noreply@yourdomain.com'),
    'notification_recipients': os.getenv('SES_NOTIFICATION_RECIPIENTS', '').split(','),
}

# DynamoDB tables
DYNAMODB_TABLES = {
    'estimates': os.getenv('DYNAMODB_ESTIMATES_TABLE', 'estimator-ai-estimates'),
    'proposals': os.getenv('DYNAMODB_PROPOSALS_TABLE', 'estimator-ai-proposals'),
    'clients': os.getenv('DYNAMODB_CLIENTS_TABLE', 'estimator-ai-clients'),
    'emails': os.getenv('DYNAMODB_EMAILS_TABLE', 'estimator-ai-emails'),
}

# OpenAI Configuration
OPENAI_CONFIG = {
    'api_key': os.getenv('OPENAI_API_KEY'),
    'model': os.getenv('OPENAI_MODEL', 'gpt-4o'),
    'temperature': float(os.getenv('OPENAI_TEMPERATURE', '0.7')),
    'max_tokens': int(os.getenv('OPENAI_MAX_TOKENS', '2000')),
}

# LangChain Configuration
LANGCHAIN_CONFIG = {
    'embeddings_model': os.getenv('LANGCHAIN_EMBEDDINGS_MODEL', 'text-embedding-ada-002'),
    'chunk_size': int(os.getenv('LANGCHAIN_CHUNK_SIZE', '1000')),
    'chunk_overlap': int(os.getenv('LANGCHAIN_CHUNK_OVERLAP', '200')),
}

# Vector Database Configuration
VECTOR_DB_CONFIG = {
    'provider': os.getenv('VECTOR_DB_PROVIDER', 'pinecone'),
    'api_key': os.getenv('VECTOR_DB_API_KEY'),
    'environment': os.getenv('VECTOR_DB_ENVIRONMENT', 'us-west1-gcp'),
    'index_name': os.getenv('VECTOR_DB_INDEX_NAME', 'estimator-ai'),
}

# AWS Services Configuration
AWS_SERVICES = {
    's3': True,  # For document storage
    'dynamodb': True,  # For data persistence
    'textract': True,  # For document analysis
    'comprehend': True,  # For text analysis
    'lambda': True,  # For serverless functions
    'ses': True,  # For email automation
}

# Feature Flags
FEATURES = {
    'document_analysis': True,  # Use AWS Textract for document analysis
    'ai_estimation': True,  # Use OpenAI for estimation
    'smart_recommendations': True,  # Use AI for recommendations
    'compliance_checking': True,  # Use AI for compliance verification
    'email_automation': True,  # Use AWS SES for email automation
    'multi_agent_workflow': True,  # Use multi-agent workflow
    'vector_search': True,  # Use vector search for knowledge base
}

class Settings(BaseSettings):
    api_key: str
    redis_url: str
    aws_access_key_id: str
    aws_secret_access_key: str
    aws_region: str = "us-east-1"
    aws_s3_bucket: str
    dynamodb_estimates_table: str
    dynamodb_proposals_table: str
    dynamodb_clients_table: str
    aws_ses_from_email: str
    openai_api_key: str
    openai_model: str = "gpt-4-turbo-preview"
    openai_temperature: float = 0.7
    openai_max_tokens: int = 2000
    environment: str = "development"
    debug: bool = False
    log_level: str = "INFO"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

@lru_cache()
def get_settings() -> Settings:
    return Settings()

settings = get_settings()

# Removed backup and log directory creation as they are not needed for SES/email testing 