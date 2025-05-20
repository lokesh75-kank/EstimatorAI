import boto3
import openai
from typing import Dict, List, Optional
from .config import AWS_CONFIG, S3_BUCKET, DYNAMODB_TABLES, OPENAI_CONFIG, AWS_SERVICES

class AWSService:
    def __init__(self):
        self.s3 = boto3.client('s3', **AWS_CONFIG) if AWS_SERVICES['s3'] else None
        self.dynamodb = boto3.resource('dynamodb', **AWS_CONFIG) if AWS_SERVICES['dynamodb'] else None
        self.textract = boto3.client('textract', **AWS_CONFIG) if AWS_SERVICES['textract'] else None
        self.comprehend = boto3.client('comprehend', **AWS_CONFIG) if AWS_SERVICES['comprehend'] else None

    def upload_document(self, file_data: bytes, filename: str, project_id: str) -> str:
        """Upload a document to S3 and return the URL."""
        if not self.s3:
            return None
        
        key = f"projects/{project_id}/documents/{filename}"
        self.s3.put_object(
            Bucket=S3_BUCKET,
            Key=key,
            Body=file_data
        )
        return f"s3://{S3_BUCKET}/{key}"

    def analyze_document(self, document_url: str) -> Dict:
        """Analyze document content using AWS Textract."""
        if not self.textract:
            return {}
        
        response = self.textract.start_document_analysis(
            DocumentLocation={
                'S3Object': {
                    'Bucket': S3_BUCKET,
                    'Name': document_url.split('/')[-1]
                }
            },
            FeatureTypes=['TABLES', 'FORMS']
        )
        return response

    def store_estimate(self, estimate_data: Dict) -> None:
        """Store estimate data in DynamoDB."""
        if not self.dynamodb:
            return
        
        table = self.dynamodb.Table(DYNAMODB_TABLES['estimates'])
        table.put_item(Item=estimate_data)

    def store_proposal(self, proposal_data: Dict) -> None:
        """Store proposal data in DynamoDB."""
        if not self.dynamodb:
            return
        
        table = self.dynamodb.Table(DYNAMODB_TABLES['proposals'])
        table.put_item(Item=proposal_data)

    def analyze_text(self, text: str) -> Dict:
        """Analyze text using AWS Comprehend."""
        if not self.comprehend:
            return {}
        
        response = self.comprehend.detect_entities(Text=text, LanguageCode='en')
        return response

class OpenAIService:
    def __init__(self):
        openai.api_key = OPENAI_CONFIG['api_key']
        self.model = OPENAI_CONFIG['model']
        self.temperature = OPENAI_CONFIG['temperature']
        self.max_tokens = OPENAI_CONFIG['max_tokens']

    def generate_estimate(self, project_data: Dict) -> Dict:
        """Generate project estimate using OpenAI."""
        prompt = self._create_estimate_prompt(project_data)
        
        response = openai.ChatCompletion.create(
            model=self.model,
            messages=[
                {"role": "system", "content": "You are an expert fire and security systems estimator."},
                {"role": "user", "content": prompt}
            ],
            temperature=self.temperature,
            max_tokens=self.max_tokens
        )
        
        return self._parse_estimate_response(response.choices[0].message.content)

    def generate_proposal(self, estimate_data: Dict) -> Dict:
        """Generate proposal using OpenAI."""
        prompt = self._create_proposal_prompt(estimate_data)
        
        response = openai.ChatCompletion.create(
            model=self.model,
            messages=[
                {"role": "system", "content": "You are an expert in creating professional proposals for fire and security systems."},
                {"role": "user", "content": prompt}
            ],
            temperature=self.temperature,
            max_tokens=self.max_tokens
        )
        
        return self._parse_proposal_response(response.choices[0].message.content)

    def analyze_compliance(self, project_data: Dict, location: str) -> List[str]:
        """Analyze project compliance using OpenAI."""
        prompt = f"""
        Analyze the following project for compliance with fire and security codes in {location}:
        Project Type: {project_data.get('project_type')}
        Building Type: {project_data.get('building_type')}
        Square Footage: {project_data.get('square_footage')}
        Number of Floors: {project_data.get('floors')}
        
        List all applicable codes and standards that must be followed.
        """
        
        response = openai.ChatCompletion.create(
            model=self.model,
            messages=[
                {"role": "system", "content": "You are an expert in fire and security codes and standards."},
                {"role": "user", "content": prompt}
            ],
            temperature=self.temperature,
            max_tokens=self.max_tokens
        )
        
        return self._parse_compliance_response(response.choices[0].message.content)

    def _create_estimate_prompt(self, project_data: Dict) -> str:
        """Create a prompt for estimate generation."""
        return f"""
        Generate a detailed cost estimate for the following project:
        
        Project Name: {project_data.get('project_name')}
        Client: {project_data.get('client_name')}
        Location: {project_data.get('location', {}).get('city')}, {project_data.get('location', {}).get('country')}
        Project Type: {project_data.get('specifications', {}).get('project_type')}
        Building Type: {project_data.get('specifications', {}).get('building_type')}
        Square Footage: {project_data.get('specifications', {}).get('square_footage')}
        Number of Floors: {project_data.get('specifications', {}).get('floors')}
        
        Please provide:
        1. Material costs breakdown
        2. Labor costs breakdown
        3. Equipment costs
        4. Subcontractor costs
        5. Contingency and tax calculations
        6. Value engineering suggestions
        7. Risk factors
        """

    def _create_proposal_prompt(self, estimate_data: Dict) -> str:
        """Create a prompt for proposal generation."""
        return f"""
        Generate a professional proposal based on the following estimate:
        
        Project Name: {estimate_data.get('project_name')}
        Client: {estimate_data.get('client_name')}
        Total Cost: ${estimate_data.get('cost_breakdown', {}).get('grand_total')}
        
        Please provide:
        1. Executive Summary
        2. Scope of Work
        3. Technical Specifications
        4. Compliance Matrix
        5. Terms and Conditions
        6. Payment Schedule
        7. Project Timeline
        """

    def _parse_estimate_response(self, response: str) -> Dict:
        """Parse the OpenAI response for estimate generation."""
        # TODO: Implement proper parsing logic
        return {}

    def _parse_proposal_response(self, response: str) -> Dict:
        """Parse the OpenAI response for proposal generation."""
        # TODO: Implement proper parsing logic
        return {}

    def _parse_compliance_response(self, response: str) -> List[str]:
        """Parse the OpenAI response for compliance analysis."""
        # TODO: Implement proper parsing logic
        return [] 