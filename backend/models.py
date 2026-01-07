"""
Database models using SQLAlchemy
"""
from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from database import Base


class User(Base):
    """
    User model - links to Clerk user_id
    """
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    clerk_user_id = Column(String, unique=True, nullable=False, index=True)
    email = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship to projects
    projects = relationship("Project", back_populates="user", cascade="all, delete-orphan")


class Project(Base):
    """
    Project model - belongs to a user
    """
    __tablename__ = "projects"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship to user
    user = relationship("User", back_populates="projects")
    # Relationships to file imports
    file_imports = relationship("FileImport", back_populates="project", cascade="all, delete-orphan")


class FileImport(Base):
    """
    File import model - tracks uploaded/exported files for a project
    """
    __tablename__ = "file_imports"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"), nullable=False, index=True)
    import_type = Column(String, nullable=False)  # 'customer', 'vendor', 'ppvp', etc.
    filename = Column(String, nullable=False)
    exported_at = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship to project
    project = relationship("Project", back_populates="file_imports")
    # Relationship to import data
    import_data = relationship("ImportData", back_populates="file_import", cascade="all, delete-orphan")


class ImportData(Base):
    """
    Import data model - stores extracted names/part numbers for cross-validation
    """
    __tablename__ = "import_data"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    file_import_id = Column(UUID(as_uuid=True), ForeignKey("file_imports.id"), nullable=False, index=True)
    data_type = Column(String, nullable=False)  # 'name', 'part_number', 'vendor_name'
    values = Column(ARRAY(String), nullable=False)  # Array of names/part numbers
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship to file import
    file_import = relationship("FileImport", back_populates="import_data")


