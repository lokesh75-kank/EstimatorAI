import boto3
import os
from dotenv import load_dotenv

def test_aws_configuration():
    # Load environment variables
    load_dotenv()
    
    # Get AWS region from environment variable
    aws_region = os.getenv('AWS_REGION', 'us-east-1')  # Default to us-east-1 if not specified
    
    # Test S3
    try:
        s3 = boto3.client('s3', region_name=aws_region)
        bucket_name = os.getenv('AWS_S3_BUCKET')
        response = s3.list_buckets()
        print("✅ Successfully connected to AWS S3")
        print(f"Available buckets: {[bucket['Name'] for bucket in response['Buckets']]}")
    except Exception as e:
        print(f"❌ S3 Error: {str(e)}")

    # Test DynamoDB
    try:
        dynamodb = boto3.resource('dynamodb', region_name=aws_region)
        tables = list(dynamodb.tables.all())
        print("\n✅ Successfully connected to AWS DynamoDB")
        print(f"Available tables: {[table.name for table in tables]}")
    except Exception as e:
        print(f"❌ DynamoDB Error: {str(e)}")

if __name__ == "__main__":
    test_aws_configuration() 