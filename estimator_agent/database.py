from sqlalchemy import create_engine, Column, Integer, String, DateTime, JSON, ForeignKey, Text, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import os
from typing import Optional
import logging

logger = logging.getLogger(__name__)

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/estimator")

# Create SQLAlchemy engine
engine = create_engine(DATABASE_URL, pool_size=5, max_overflow=10)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class Project(Base):
    __tablename__ = "projects"

    id = Column(String, primary_key=True)
    project_name = Column(String, nullable=False)
    client_name = Column(String, nullable=False)
    client_email = Column(String)
    client_phone = Column(String)
    building_type = Column(String)
    building_size = Column(String)
    location = Column(JSON)
    requirements = Column(JSON)
    status = Column(String)
    estimate = Column(JSON, nullable=True)
    proposal = Column(JSON, nullable=True)
    metadata = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    messages = relationship("Message", back_populates="project", cascade="all, delete-orphan")
    files = relationship("File", back_populates="project", cascade="all, delete-orphan")
    history = relationship("ProjectHistory", back_populates="project", cascade="all, delete-orphan")

class Message(Base):
    __tablename__ = "messages"

    id = Column(String, primary_key=True)
    project_id = Column(String, ForeignKey("projects.id"))
    content = Column(Text, nullable=False)
    sender = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # Relationship
    project = relationship("Project", back_populates="messages")

class File(Base):
    __tablename__ = "files"

    id = Column(String, primary_key=True)
    project_id = Column(String, ForeignKey("projects.id"))
    filename = Column(String, nullable=False)
    content_type = Column(String, nullable=False)
    content = Column(Text, nullable=False)  # Base64 encoded content
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship
    project = relationship("Project", back_populates="files")

class ProjectHistory(Base):
    __tablename__ = "project_history"

    id = Column(String, primary_key=True)
    project_id = Column(String, ForeignKey("projects.id"))
    status = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    reason = Column(Text)
    
    # Relationship
    project = relationship("Project", back_populates="history")

class Estimate(Base):
    __tablename__ = "estimates"

    id = Column(String, primary_key=True)
    project_id = Column(String, ForeignKey("projects.id"))
    total_cost = Column(Integer, nullable=False)
    breakdown = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Proposal(Base):
    __tablename__ = "proposals"

    id = Column(String, primary_key=True)
    project_id = Column(String, ForeignKey("projects.id"))
    estimate_id = Column(String, ForeignKey("estimates.id"))
    content = Column(JSON, nullable=False)
    status = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# Database session management
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Database initialization
def init_db():
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Error creating database tables: {e}")
        raise

# Database backup function
def backup_database():
    try:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_file = f"backup_{timestamp}.sql"
        os.system(f"pg_dump {DATABASE_URL} > {backup_file}")
        logger.info(f"Database backup created: {backup_file}")
        return backup_file
    except Exception as e:
        logger.error(f"Error creating database backup: {e}")
        return None 