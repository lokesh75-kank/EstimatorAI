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
s3 = boto3.client('s3')
dynamodb = boto3.resource('dynamodb')

# Get tables
projects_table = dynamodb.Table('Projects')

def get_secret(secret_name):
    region_name = os.environ.get('AWS_REGION', 'us-east-1')
    client = boto3.client('secretsmanager', region_name=region_name)
    get_secret_value_response = client.get_secret_value(SecretId=secret_name)
    secret = get_secret_value_response['SecretString']
    return json.loads(secret) if secret.strip().startswith('{') else secret

def process_upload(event, context):
    """Process a file upload request"""
    try:
        # Parse the incoming event
        body = json.loads(event['body'])
        project_id = body.get('projectId')
        file_name = body.get('fileName')
        file_type = body.get('fileType')
        
        if not project_id or not file_name or not file_type:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Missing required fields'})
            }
        
        # Generate a unique file ID
        file_id = str(uuid.uuid4())
        
        # Create presigned URL for S3 upload
        presigned_url = s3.generate_presigned_url(
            'put_object',
            Params={
                'Bucket': 'estimator-ai-documents',
                'Key': f'projects/{project_id}/{file_id}/{file_name}',
                'ContentType': file_type
            },
            ExpiresIn=3600  # URL expires in 1 hour
        )
        
        # Update project with file information
        projects_table.update_item(
            Key={'projectId': project_id},
            UpdateExpression='SET files = list_append(if_not_exists(files, :empty_list), :file)',
            ExpressionAttributeValues={
                ':file': [{
                    'fileId': file_id,
                    'fileName': file_name,
                    'fileType': file_type,
                    'uploadedAt': datetime.utcnow().isoformat(),
                    'status': 'PENDING'
                }],
                ':empty_list': []
            }
        )
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'Upload URL generated successfully',
                'uploadUrl': presigned_url,
                'fileId': file_id
            })
        }
        
    except Exception as e:
        logger.error(f"Error processing upload: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': 'Internal server error'})
        }

def lambda_handler(event, context):
    """Main Lambda handler"""
    return process_upload(event, context) 