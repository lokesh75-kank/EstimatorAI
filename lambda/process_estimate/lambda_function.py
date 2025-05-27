import json
import boto3
import os
from datetime import datetime
import uuid
import logging

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Initialize AWS clients
dynamodb = boto3.resource('dynamodb')
s3 = boto3.client('s3')
secretsmanager = boto3.client('secretsmanager')

# Get tables
projects_table = dynamodb.Table('Projects')
estimates_table = dynamodb.Table('Estimates')

# Get OpenAI API key from Secrets Manager
OPENAI_API_KEY_SECRET_NAME = 'estimator-ai/openai-key'
openai_api_key = get_secret(OPENAI_API_KEY_SECRET_NAME)

def get_secret(secret_name):
    """Retrieve a secret from AWS Secrets Manager"""
    try:
        response = secretsmanager.get_secret_value(SecretId=secret_name)
        return json.loads(response['SecretString'])
    except Exception as e:
        logger.error(f"Error retrieving secret {secret_name}: {str(e)}")
        raise

def process_estimate(event, context):
    """Process a new estimate request"""
    try:
        # Parse the incoming event
        body = json.loads(event['body'])
        project_id = body.get('projectId')
        estimate_data = body.get('estimateData')
        
        if not project_id or not estimate_data:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Missing required fields'})
            }
        
        # Generate a unique estimate ID
        estimate_id = str(uuid.uuid4())
        
        # Create estimate record
        estimate_item = {
            'estimateId': estimate_id,
            'projectId': project_id,
            'estimateData': estimate_data,
            'status': 'PENDING',
            'createdAt': datetime.utcnow().isoformat(),
            'updatedAt': datetime.utcnow().isoformat()
        }
        
        # Save to DynamoDB
        estimates_table.put_item(Item=estimate_item)
        
        # Update project with latest estimate
        projects_table.update_item(
            Key={'projectId': project_id},
            UpdateExpression='SET latestEstimateId = :eid, updatedAt = :now',
            ExpressionAttributeValues={
                ':eid': estimate_id,
                ':now': datetime.utcnow().isoformat()
            }
        )
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'Estimate processed successfully',
                'estimateId': estimate_id
            })
        }
        
    except Exception as e:
        logger.error(f"Error processing estimate: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': 'Internal server error'})
        }

def lambda_handler(event, context):
    """Main Lambda handler"""
    return process_estimate(event, context) 