import openai
import os
from dotenv import load_dotenv

def test_openai_configuration():
    # Load environment variables
    load_dotenv()
    
    # Set API key
    client = openai.OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
    
    try:
        # Test API connection with a simple completion
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": "Say 'Hello, AWS and OpenAI are configured correctly!'"}
            ],
            max_tokens=50
        )
        print("✅ Successfully connected to OpenAI API")
        print(f"Response: {response.choices[0].message.content}")
    except Exception as e:
        print(f"❌ OpenAI Error: {str(e)}")

if __name__ == "__main__":
    test_openai_configuration() 