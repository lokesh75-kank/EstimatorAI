import json
import boto3
import os
import logging
from boto3.dynamodb.conditions import Key
from decimal import Decimal

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

dynamodb = boto3.resource('dynamodb')
ESTIMATES_TABLE = os.environ.get('ESTIMATES_TABLE', 'Estimates')

def get_secret(secret_name):
    region_name = os.environ.get('AWS_REGION', 'us-east-1')
    client = boto3.client('secretsmanager', region_name=region_name)
    get_secret_value_response = client.get_secret_value(SecretId=secret_name)
    secret = get_secret_value_response['SecretString']
    return json.loads(secret) if secret.strip().startswith('{') else secret

def lambda_handler(event, context):
    try:
        path_params = event.get('pathParameters', {})
        project_id = path_params.get('projectId')
        estimate_id = path_params.get('estimateId')
        if not project_id or not estimate_id:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Missing projectId or estimateId in path parameters'})
            }

        print(f"path_params: {path_params}")
        print(f"ESTIMATES_TABLE: {ESTIMATES_TABLE}")
        print(f"estimate_id: {estimate_id}, type: {type(estimate_id)}")

        table = dynamodb.Table(ESTIMATES_TABLE)
        response = table.get_item(Key={'estimateId': estimate_id})
        estimate = response.get('Item')

        if not estimate:
            return {
                'statusCode': 404,
                'body': json.dumps({'error': 'Estimate not found'})
            }

        # Recursively convert Decimal to float
        def convert_decimals(obj):
            if isinstance(obj, list):
                return [convert_decimals(i) for i in obj]
            elif isinstance(obj, dict):
                return {k: convert_decimals(v) for k, v in obj.items()}
            elif isinstance(obj, Decimal):
                return float(obj)
            else:
                return obj

        serializable_response = convert_decimals(estimate)

        return {
            'statusCode': 200,
            'body': json.dumps(serializable_response)
        }
    except Exception as e:
        logger.error(f"Error retrieving estimate: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': 'Internal server error'})
        } 