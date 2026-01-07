"""
Clerk authentication utilities for FastAPI
"""
import os
from pathlib import Path
from dotenv import load_dotenv
import httpx
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import serialization
import base64
import json
from typing import Optional

# Get the directory where this file is located
BASE_DIR = Path(__file__).resolve().parent

# Load environment variables from .env file in the backend directory
load_dotenv(dotenv_path=BASE_DIR / ".env")

# Clerk configuration
CLERK_SECRET_KEY = os.getenv("CLERK_SECRET_KEY", "")
CLERK_PUBLISHABLE_KEY = os.getenv("CLERK_PUBLISHABLE_KEY", "")

# HTTP Bearer token security scheme
security = HTTPBearer()


async def get_clerk_jwks():
    """Fetch Clerk's JWKS (JSON Web Key Set) for token verification"""
    # Try to get JWKS URL from environment first
    jwks_url = os.getenv("CLERK_JWKS_URL")
    
    if not jwks_url:
        # Fallback: try to construct from CLERK_ISSUER
        issuer = os.getenv("CLERK_ISSUER")
        if issuer:
            jwks_url = f"{issuer}/.well-known/jwks.json"
        else:
            raise HTTPException(
                status_code=500,
                detail="CLERK_JWKS_URL or CLERK_ISSUER not configured. "
                       "Please add CLERK_JWKS_URL to your .env file. "
                       "Format: https://<your-instance>.clerk.accounts.dev/.well-known/jwks.json"
            )
    
    async with httpx.AsyncClient() as client:
        response = await client.get(jwks_url)
        if response.status_code != 200:
            raise HTTPException(
                status_code=500, detail=f"Failed to fetch Clerk JWKS from {jwks_url}"
            )
        return response.json()


async def verify_clerk_token(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    """
    Verify Clerk JWT token and return user information
    
    Args:
        credentials: HTTP Bearer token from request header
        
    Returns:
        dict: User information from token (user_id, email, etc.)
        
    Raises:
        HTTPException: If token is invalid or missing
    """
    token = credentials.credentials
    
    if not token:
        raise HTTPException(
            status_code=401, detail="Authorization token missing"
        )
    
    try:
        # Get JWKS for token verification
        jwks = await get_clerk_jwks()
        
        # Decode token header to get key ID
        unverified_header = jwt.get_unverified_header(token)
        kid = unverified_header.get("kid")
        
        if not kid:
            raise HTTPException(status_code=401, detail="Invalid token format")
        
        # Find the matching key from JWKS
        jwk = None
        for key in jwks.get("keys", []):
            if key.get("kid") == kid:
                jwk = key
                break
        
        if not jwk:
            raise HTTPException(status_code=401, detail="Token key not found")
        
        # Convert JWK to RSA public key
        # Extract modulus and exponent from JWK (base64url encoded)
        def base64url_decode(value: str) -> bytes:
            """Decode base64url encoded string"""
            # Add padding if needed
            padding = 4 - len(value) % 4
            if padding != 4:
                value += "=" * padding
            # Replace URL-safe characters
            value = value.replace("-", "+").replace("_", "/")
            return base64.b64decode(value)
        
        n_bytes = base64url_decode(jwk["n"])
        e_bytes = base64url_decode(jwk["e"])
        
        # Convert bytes to integers
        n = int.from_bytes(n_bytes, byteorder="big")
        e = int.from_bytes(e_bytes, byteorder="big")
        
        # Construct RSA public key
        public_key = rsa.RSAPublicNumbers(e, n).public_key(default_backend())
        
        # Serialize to PEM format for jose
        pem_key = public_key.public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo
        )
        
        # Verify and decode the token
        decoded_token = jwt.decode(
            token,
            pem_key,
            algorithms=["RS256"],
            options={"verify_signature": True, "verify_exp": True},
        )
        
        # Extract user information
        user_info = {
            "user_id": decoded_token.get("sub"),  # Clerk user ID
            "email": decoded_token.get("email"),
            "session_id": decoded_token.get("sid"),
        }
        
        return user_info
        
    except HTTPException:
        # Re-raise HTTPExceptions as-is (they already have proper status codes)
        raise
    except JWTError as e:
        # Log the error for debugging
        import traceback
        print(f"JWT Error: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")
    except Exception as e:
        # Log the full error for debugging
        import traceback
        print(f"Token verification error: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(
            status_code=500, detail=f"Token verification failed: {str(e)}"
        )


# Dependency to get current user
async def get_current_user(user_info: dict = Depends(verify_clerk_token)) -> dict:
    """
    Dependency to get current authenticated user
    
    Usage:
        @app.get("/protected")
        async def protected_route(user: dict = Depends(get_current_user)):
            user_id = user["user_id"]
            ...
    """
    return user_info

