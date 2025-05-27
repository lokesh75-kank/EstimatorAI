from setuptools import setup, find_packages

setup(
    name="estimator_agent",
    version="0.1.0",
    packages=find_packages(),
    install_requires=[
        "boto3>=1.26.0",
        "openai>=1.0.0",
        "fastapi>=0.68.0",
        "uvicorn>=0.15.0",
        "pydantic>=1.8.0",
        "python-dotenv>=0.19.0",
    ],
    extras_require={
        "dev": [
            "pytest>=7.0.0",
            "pytest-cov>=4.0.0",
            "black>=22.0.0",
            "isort>=5.0.0",
            "flake8>=4.0.0",
        ],
    },
    python_requires=">=3.9",
) 