"""
Database connection and session management
"""
import os
from pathlib import Path
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Get the directory where this file is located
BASE_DIR = Path(__file__).resolve().parent

# Load environment variables from .env file in the backend directory
load_dotenv(dotenv_path=BASE_DIR / ".env")

# Get database URL from environment variable
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    # During build/import, DATABASE_URL might not be set yet
    # This is OK - it will be set at runtime via Railway environment variables
    DATABASE_URL = os.getenv("DATABASE_URL", "")
    if not DATABASE_URL:
        # Only raise error if actually trying to create engine (runtime)
        # Don't raise during import/build
        pass

# Convert postgresql:// to postgresql+psycopg:// for psycopg3 (psycopg)
# SQLAlchemy needs the +psycopg dialect to use psycopg3 instead of psycopg2
if DATABASE_URL:
    if DATABASE_URL.startswith("postgresql://"):
        DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg://", 1)
    elif DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+psycopg://", 1)

# Create SQLAlchemy engine (only if DATABASE_URL is set)
# During build, this might not be set yet, which is OK
engine = None
if DATABASE_URL:
    engine = create_engine(DATABASE_URL)

# Create SessionLocal class (will be recreated at runtime if engine is None)
if engine:
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
else:
    # Dummy sessionmaker for import time
    SessionLocal = None

# Create Base class for models
Base = declarative_base()


# Dependency to get database session
def get_db():
    """
    Dependency function to get database session
    
    Usage:
        @app.get("/items")
        def get_items(db: Session = Depends(get_db)):
            ...
    """
    # Recreate engine if it wasn't available at import time
    global engine, SessionLocal, DATABASE_URL
    # Re-fetch DATABASE_URL in case it was set after import
    if not DATABASE_URL:
        DATABASE_URL = os.getenv("DATABASE_URL", "")
    
    if not engine and DATABASE_URL:
        if DATABASE_URL.startswith("postgresql://"):
            DATABASE_URL_fixed = DATABASE_URL.replace("postgresql://", "postgresql+psycopg://", 1)
        elif DATABASE_URL.startswith("postgres://"):
            DATABASE_URL_fixed = DATABASE_URL.replace("postgres://", "postgresql+psycopg://", 1)
        else:
            DATABASE_URL_fixed = DATABASE_URL
        engine = create_engine(DATABASE_URL_fixed)
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    if not SessionLocal:
        raise ValueError("Database not configured. DATABASE_URL environment variable is required.")
    
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

