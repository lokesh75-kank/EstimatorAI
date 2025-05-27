import json
import boto3
import os
import logging
from boto3.dynamodb.conditions import Key

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

dynamodb = boto3.resource('dynamodb')
PROJECTS_TABLE = os.environ.get('PROJECTS_TABLE', 'Projects')

def get_secret(secret_name):
    region_name = os.environ.get('AWS_REGION', 'us-east-1')
    client = boto3.client('secretsmanager', region_name=region_name)
    get_secret_value_response = client.get_secret_value(SecretId=secret_name)
    secret = get_secret_value_response['SecretString']
    return json.loads(secret) if secret.strip().startswith('{') else secret

def lambda_handler(event, context):
    try:
        project_id = event.get('pathParameters', {}).get('projectId')
        if not project_id:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Missing projectId in path parameters'})
            }

        table = dynamodb.Table(PROJECTS_TABLE)
        print(f"Looking up projectId: {project_id} (type: {type(project_id)})")
        print(f"estimate_id: {project_id}, type: {type(project_id)}")
        response = table.get_item(Key={'estimateId': project_id})
        project = response.get('Item')

        if not project:
            return {
                'statusCode': 404,
                'body': json.dumps({'error': 'Project not found'})
            }

        return {
            'statusCode': 200,
            'body': json.dumps(project)
        }
    except Exception as e:
        logger.error(f"Error retrieving project: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': 'Internal server error'})
        } 