"""
Project management endpoints
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import and_
from pydantic import BaseModel, model_validator
from typing import List, Optional
from uuid import UUID
from datetime import datetime

from database import get_db
from models import Project, User
from auth import get_current_user

router = APIRouter(prefix="/api/projects", tags=["projects"])


# Pydantic models for request/response
class ProjectCreate(BaseModel):
    name: str


class ProjectUpdate(BaseModel):
    name: str


class ProjectResponse(BaseModel):
    id: str
    name: str
    user_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
    
    @model_validator(mode='before')
    @classmethod
    def convert_uuid_to_str(cls, data):
        """Convert UUID objects to strings before validation"""
        if isinstance(data, dict):
            if 'id' in data and isinstance(data['id'], UUID):
                data['id'] = str(data['id'])
            if 'user_id' in data and isinstance(data['user_id'], UUID):
                data['user_id'] = str(data['user_id'])
        elif hasattr(data, 'id') and hasattr(data, 'user_id'):
            # Handle ORM objects
            return {
                'id': str(data.id),
                'name': data.name,
                'user_id': str(data.user_id),
                'created_at': data.created_at,
                'updated_at': data.updated_at
            }
        return data


def get_or_create_user(db: Session, clerk_user_id: str, email: str) -> User:
    """
    Get existing user or create new user in database
    """
    try:
        user = db.query(User).filter(User.clerk_user_id == clerk_user_id).first()
        
        if not user:
            # Handle None or empty email - use a placeholder if email is missing
            email_value = email if email and email.strip() else f"{clerk_user_id}@no-email.clerk"
            user = User(clerk_user_id=clerk_user_id, email=email_value)
            db.add(user)
            db.commit()
            db.refresh(user)
        
        return user
    except Exception as e:
        import traceback
        print(f"Error in get_or_create_user: {str(e)}")
        print(traceback.format_exc())
        db.rollback()
        raise


@router.get("", response_model=List[ProjectResponse])
async def get_projects(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Get all projects for the current user
    """
    try:
        # Get or create user in database
        # Handle None email from token - use empty string as fallback
        email = current_user.get("email") or ""
        user = get_or_create_user(db, current_user["user_id"], email)
        
        # Get all projects for this user
        projects = db.query(Project).filter(Project.user_id == user.id).all()
        
        return projects
    except Exception as e:
        import traceback
        print(f"Error in get_projects: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("", response_model=ProjectResponse, status_code=201)
async def create_project(
    project_data: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Create a new project for the current user
    """
    # Get or create user in database
    # Handle None email from token - use empty string as fallback
    email = current_user.get("email") or ""
    user = get_or_create_user(db, current_user["user_id"], email)
    
    # Create new project
    project = Project(name=project_data.name, user_id=user.id)
    db.add(project)
    db.commit()
    db.refresh(project)
    
    return project


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Get a specific project by ID (only if it belongs to the current user)
    """
    # Get or create user in database
    # Handle None email from token - use empty string as fallback
    email = current_user.get("email") or ""
    user = get_or_create_user(db, current_user["user_id"], email)
    
    # Get project and verify ownership
    project = db.query(Project).filter(
        and_(Project.id == project_id, Project.user_id == user.id)
    ).first()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    return project


@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: UUID,
    project_data: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Update a project (only if it belongs to the current user)
    """
    # Get or create user in database
    # Handle None email from token - use empty string as fallback
    email = current_user.get("email") or ""
    user = get_or_create_user(db, current_user["user_id"], email)
    
    # Get project and verify ownership
    project = db.query(Project).filter(
        and_(Project.id == project_id, Project.user_id == user.id)
    ).first()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Update project
    project.name = project_data.name
    project.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(project)
    
    return project


@router.delete("/{project_id}", status_code=204)
async def delete_project(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Delete a project (only if it belongs to the current user)
    """
    # Get or create user in database
    # Handle None email from token - use empty string as fallback
    email = current_user.get("email") or ""
    user = get_or_create_user(db, current_user["user_id"], email)
    
    # Get project and verify ownership
    project = db.query(Project).filter(
        and_(Project.id == project_id, Project.user_id == user.id)
    ).first()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Delete project
    db.delete(project)
    db.commit()
    
    return None

