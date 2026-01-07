"""
File import management endpoints
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import and_, delete
from pydantic import BaseModel, model_validator
from typing import List, Optional
from uuid import UUID
from datetime import datetime

from database import get_db
from models import FileImport, ImportData, Project, User
from auth import get_current_user
from projects import get_or_create_user

router = APIRouter(prefix="/api/file-imports", tags=["file-imports"])


# Pydantic models for request/response
class FileImportCreate(BaseModel):
    project_id: str
    import_type: str
    filename: str
    data: dict  # { "names": [...], "part_numbers": [...], "vendor_names": [...] }


class FileImportResponse(BaseModel):
    id: str
    project_id: str
    import_type: str
    filename: str
    exported_at: datetime
    created_at: datetime

    class Config:
        from_attributes = True

    @model_validator(mode='before')
    @classmethod
    def convert_uuid_to_str(cls, data):
        """Convert UUID objects to strings before validation"""
        if isinstance(data, dict):
            if 'id' in data and isinstance(data['id'], UUID):
                data['id'] = str(data['id'])
            if 'project_id' in data and isinstance(data['project_id'], UUID):
                data['project_id'] = str(data['project_id'])
        elif hasattr(data, 'id') and hasattr(data, 'project_id'):
            return {
                'id': str(data.id),
                'project_id': str(data.project_id),
                'import_type': data.import_type,
                'filename': data.filename,
                'exported_at': data.exported_at,
                'created_at': data.created_at
            }
        return data


class ImportDataResponse(BaseModel):
    data_type: str
    values: List[str]


@router.post("", response_model=FileImportResponse, status_code=201)
async def create_file_import(
    file_import_data: FileImportCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Create a new file import record and store extracted data
    Replaces any existing file import of the same type for the project
    """
    # Get or create user
    email = current_user.get("email") or ""
    user = get_or_create_user(db, current_user["user_id"], email)

    # Verify project belongs to user
    project = db.query(Project).filter(
        and_(
            Project.id == UUID(file_import_data.project_id),
            Project.user_id == user.id
        )
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Delete existing file import of the same type for this project (keep latest)
    existing_import = db.query(FileImport).filter(
        and_(
            FileImport.project_id == UUID(file_import_data.project_id),
            FileImport.import_type == file_import_data.import_type
        )
    ).first()

    if existing_import:
        # Delete associated import data
        db.query(ImportData).filter(
            ImportData.file_import_id == existing_import.id
        ).delete()
        # Delete the file import
        db.delete(existing_import)
        db.commit()

    # Create new file import
    file_import = FileImport(
        project_id=UUID(file_import_data.project_id),
        import_type=file_import_data.import_type,
        filename=file_import_data.filename,
    )
    db.add(file_import)
    db.commit()
    db.refresh(file_import)

    # Store extracted data
    for data_type, values in file_import_data.data.items():
        if values and len(values) > 0:
            import_data = ImportData(
                file_import_id=file_import.id,
                data_type=data_type,
                values=values
            )
            db.add(import_data)

    db.commit()
    db.refresh(file_import)

    return file_import


@router.get("/{project_id}/{import_type}", response_model=List[ImportDataResponse])
async def get_import_data(
    project_id: UUID,
    import_type: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Get import data for cross-validation
    Returns data from other import types for the same project
    """
    # Get or create user
    email = current_user.get("email") or ""
    user = get_or_create_user(db, current_user["user_id"], email)

    # Verify project belongs to user
    project = db.query(Project).filter(
        and_(
            Project.id == project_id,
            Project.user_id == user.id
        )
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Get file imports for the project with the specified import type
    file_imports = db.query(FileImport).filter(
        and_(
            FileImport.project_id == project_id,
            FileImport.import_type == import_type
        )
    ).all()

    # Get all import data for these file imports
    result = []
    for file_import in file_imports:
        import_data_list = db.query(ImportData).filter(
            ImportData.file_import_id == file_import.id
        ).all()

        for import_data in import_data_list:
            result.append({
                "data_type": import_data.data_type,
                "values": import_data.values
            })

    return result

