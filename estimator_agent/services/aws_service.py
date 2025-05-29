import boto3
from typing import Optional
# from ..config import AWSConfig  # Removed, as AWSConfig does not exist

class AWSService:
    def __init__(self, config: dict):
        self.config = config
        self.client = boto3.client(
            's3',
            region_name=config.get('region_name'),
            aws_access_key_id=config.get('aws_access_key_id'),
            aws_secret_access_key=config.get('aws_secret_access_key')
        )

    def upload_file(self, file_path: str, bucket_name: str, object_name: str) -> bool:
        try:
            self.client.upload_file(file_path, bucket_name, object_name)
            return True
        except Exception as e:
            print(f"Error uploading file: {str(e)}")
            return False

    def generate_presigned_url(self, bucket_name: str, object_name: str, expiration: int = 3600) -> Optional[str]:
        try:
            url = self.client.generate_presigned_url(
                'get_object',
                Params={
                    'Bucket': bucket_name,
                    'Key': object_name
                },
                ExpiresIn=expiration
            )
            return url
        except Exception as e:
            print(f"Error generating presigned URL: {str(e)}")
            return None 