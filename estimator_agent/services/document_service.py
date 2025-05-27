from typing import List, Dict, Any, Optional
import os
import tempfile
from langchain_community.document_loaders import (
    PyPDFLoader,
    Docx2txtLoader,
    TextLoader,
    CSVLoader
)
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import Pinecone
import pinecone
from ..models import ParsedDocument, DocumentType
from ..config import LANGCHAIN_CONFIG, VECTOR_DB_CONFIG
from datetime import datetime
import uuid

class DocumentService:
    def __init__(self, openai_api_key: str):
        self.openai_api_key = openai_api_key
        self.embeddings = OpenAIEmbeddings(openai_api_key=openai_api_key)
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=LANGCHAIN_CONFIG.get('chunk_size', 1000),
            chunk_overlap=LANGCHAIN_CONFIG.get('chunk_overlap', 200)
        )
        
        # Initialize Pinecone
        pinecone.init(
            api_key=VECTOR_DB_CONFIG.get('api_key', ''),
            environment=VECTOR_DB_CONFIG.get('environment', '')
        )
        
        # Create index if it doesn't exist
        index_name = VECTOR_DB_CONFIG.get('index_name', 'estimator-ai')
        if index_name not in pinecone.list_indexes():
            pinecone.create_index(
                name=index_name,
                dimension=1536,  # OpenAI embeddings dimension
                metric="cosine"
            )
            
        self.vector_store = Pinecone.from_existing_index(
            index_name=index_name,
            embedding=self.embeddings
        )
        
    def load_document(self, file_path: str, content_type: str) -> List[Any]:
        """
        Load a document using the appropriate loader based on content type
        
        Args:
            file_path: Path to the document file
            content_type: MIME type of the document
            
        Returns:
            List of document chunks
        """
        if content_type == "application/pdf":
            loader = PyPDFLoader(file_path)
        elif content_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            loader = Docx2txtLoader(file_path)
        elif content_type == "text/csv":
            loader = CSVLoader(file_path)
        else:
            # Default to text loader
            loader = TextLoader(file_path)
            
        return loader.load()
        
    def process_document(self, 
                        document_id: str,
                        content_type: str, 
                        filename: str, 
                        s3_key: str, 
                        document_type: DocumentType,
                        s3_client: Any,
                        s3_bucket: str,
                        project_id: Optional[str] = None) -> ParsedDocument:
        """
        Process a document from S3, parse it, and index it in the vector store
        
        Args:
            document_id: Unique identifier for the document
            content_type: MIME type of the document
            filename: Original filename
            s3_key: S3 key where the document is stored
            document_type: Type of document (Drawing, Specification, etc.)
            s3_client: Boto3 S3 client
            s3_bucket: S3 bucket name
            project_id: Optional project identifier
            
        Returns:
            ParsedDocument object with extracted information
        """
        # Download the file from S3
        with tempfile.NamedTemporaryFile(delete=False) as temp_file:
            s3_client.download_file(s3_bucket, s3_key, temp_file.name)
            temp_file_path = temp_file.name
            
        try:
            # Load the document
            document = self.load_document(temp_file_path, content_type)
            
            # Split the document into chunks
            chunks = self.text_splitter.split_documents(document)
            
            # Get the full text content
            text_content = "\n\n".join([chunk.page_content for chunk in chunks])
            
            # Extract entities using LLM
            extracted_entities = self.extract_entities(text_content, document_type)
            
            # Add to vector store with metadata
            metadata = {
                "document_id": document_id,
                "filename": filename,
                "content_type": content_type,
                "document_type": document_type.value,
                "s3_key": s3_key,
                "project_id": project_id if project_id else ""
            }
            
            ids = [f"{document_id}-chunk-{i}" for i in range(len(chunks))]
            texts = [chunk.page_content for chunk in chunks]
            metadatas = [metadata for _ in range(len(chunks))]
            
            self.vector_store.add_texts(texts=texts, metadatas=metadatas, ids=ids)
            
            # Create the parsed document record
            parsed_document = ParsedDocument(
                document_id=document_id,
                document_type=document_type,
                filename=filename,
                content_type=content_type,
                size=os.path.getsize(temp_file_path),
                s3_key=s3_key,
                text_content=text_content,
                extracted_entities=extracted_entities,
                created_date=datetime.now(),
                project_id=project_id
            )
            
            return parsed_document
            
        finally:
            # Clean up the temporary file
            os.unlink(temp_file_path)
            
    def extract_entities(self, text_content: str, document_type: DocumentType) -> Dict[str, Any]:
        """
        Extract entities from document text using LLM
        
        Args:
            text_content: Document text content
            document_type: Type of document
            
        Returns:
            Dictionary of extracted entities
        """
        from langchain.llms import OpenAI
        from langchain.chains import LLMChain
        from langchain.prompts import PromptTemplate
        
        # Create a prompt template based on document type
        if document_type == DocumentType.DRAWING:
            template = """
            Extract the following information from the drawing text:
            1. System types mentioned (Fire Alarm, Fire Suppression, Access Control, CCTV, Intrusion Detection)
            2. Building areas covered
            3. Equipment types and quantities
            4. Any specific requirements or notes
            
            Text: {text}
            
            Format your response as a JSON object with these keys: system_types, building_areas, equipment, requirements
            """
        elif document_type == DocumentType.SPECIFICATION:
            template = """
            Extract the following information from the specification text:
            1. System types specified (Fire Alarm, Fire Suppression, Access Control, CCTV, Intrusion Detection)
            2. Required manufacturers or models
            3. Performance requirements
            4. Testing and commissioning requirements
            5. Warranty requirements
            
            Text: {text}
            
            Format your response as a JSON object with these keys: system_types, manufacturers, performance, testing, warranty
            """
        elif document_type == DocumentType.SCOPE_OF_WORK:
            template = """
            Extract the following information from the scope of work:
            1. System types included (Fire Alarm, Fire Suppression, Access Control, CCTV, Intrusion Detection)
            2. Areas to be covered
            3. Special requirements
            4. Timeline or schedule information
            5. Customer responsibilities
            
            Text: {text}
            
            Format your response as a JSON object with these keys: system_types, areas, special_requirements, timeline, customer_responsibilities
            """
        else:
            template = """
            Extract the following information from the text:
            1. System types mentioned (Fire Alarm, Fire Suppression, Access Control, CCTV, Intrusion Detection)
            2. Any specific requirements or notes
            3. Important dates or deadlines
            4. Contact information
            
            Text: {text}
            
            Format your response as a JSON object with these keys: system_types, requirements, dates, contacts
            """
            
        prompt = PromptTemplate(template=template, input_variables=["text"])
        
        # Create an LLM chain
        llm = OpenAI(temperature=0, model_name="gpt-4o", openai_api_key=self.openai_api_key)
        chain = LLMChain(llm=llm, prompt=prompt)
        
        # Run the chain to extract entities
        # Use a truncated version of the text to stay within token limits
        truncated_text = text_content[:10000]  # Adjust as needed
        response = chain.run(truncated_text)
        
        # Parse the response as JSON
        import json
        try:
            return json.loads(response)
        except json.JSONDecodeError:
            return {"error": "Failed to parse LLM response as JSON", "raw_response": response}
            
    def search_documents(self, query: str, project_id: Optional[str] = None, limit: int = 5) -> List[Dict[str, Any]]:
        """
        Search for documents matching a query
        
        Args:
            query: Search query
            project_id: Optional project ID to filter results
            limit: Maximum number of results to return
            
        Returns:
            List of matching document chunks with relevance scores
        """
        filter_dict = {}
        if project_id:
            filter_dict["project_id"] = project_id
            
        results = self.vector_store.similarity_search_with_score(
            query=query,
            k=limit,
            filter=filter_dict if filter_dict else None
        )
        
        return [
            {
                "content": result[0].page_content,
                "metadata": result[0].metadata,
                "score": result[1]
            }
            for result in results
        ]
        
    def get_related_documents(self, document_id: str, limit: int = 5) -> List[Dict[str, Any]]:
        """
        Get documents related to a specific document
        
        Args:
            document_id: Document ID to find related documents for
            limit: Maximum number of results to return
            
        Returns:
            List of related document chunks with relevance scores
        """
        # First, get the document's text to use as query
        filter_dict = {"document_id": document_id}
        results = self.vector_store.similarity_search(
            query="",  # Empty query to get by filter
            k=1,
            filter=filter_dict
        )
        
        if not results:
            return []
            
        # Use the document's text as query to find similar documents
        query_text = results[0].page_content
        
        # Exclude the original document from results
        filter_dict = {"document_id": {"$ne": document_id}}
        
        results = self.vector_store.similarity_search_with_score(
            query=query_text,
            k=limit,
            filter=filter_dict
        )
        
        return [
            {
                "content": result[0].page_content,
                "metadata": result[0].metadata,
                "score": result[1]
            }
            for result in results
        ] 