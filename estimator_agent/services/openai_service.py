import openai
from typing import Optional, Dict, Any
from ..config import OpenAIConfig

class OpenAIService:
    def __init__(self, config: OpenAIConfig):
        self.config = config
        openai.api_key = config.api_key

    def generate_estimate(self, project_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        try:
            response = openai.ChatCompletion.create(
                model=self.config.model,
                messages=[
                    {"role": "system", "content": "You are an expert construction estimator."},
                    {"role": "user", "content": f"Generate an estimate for this project: {project_data}"}
                ],
                temperature=self.config.temperature,
                max_tokens=self.config.max_tokens
            )
            
            # Parse the response content as JSON
            import json
            estimate_data = json.loads(response.choices[0].message.content)
            return estimate_data
        except Exception as e:
            print(f"Error generating estimate: {str(e)}")
            return None

    def generate_proposal(self, estimate_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        try:
            response = openai.ChatCompletion.create(
                model=self.config.model,
                messages=[
                    {"role": "system", "content": "You are an expert proposal writer."},
                    {"role": "user", "content": f"Generate a proposal based on this estimate: {estimate_data}"}
                ],
                temperature=self.config.temperature,
                max_tokens=self.config.max_tokens
            )
            
            # Parse the response content as JSON
            import json
            proposal_data = json.loads(response.choices[0].message.content)
            return proposal_data
        except Exception as e:
            print(f"Error generating proposal: {str(e)}")
            return None 