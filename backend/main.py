from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from postal.parser import parse_address
from rapidfuzz import process, fuzz
import re
import math
import pandas as pd
from typing import List, Optional, Dict, Any
from auth import get_current_user
from projects import router as projects_router
from file_imports import router as file_imports_router
import traceback

# Load US cities database
cities_df = pd.read_csv('uscities.csv')

# Group cities by state for fast lookup
cities_by_state = cities_df.groupby('state_id')['city'].apply(list).to_dict()

# Create a mapping of state names to state codes for libpostal compatibility
state_name_to_code = cities_df.set_index('state_name')['state_id'].to_dict()


# Also create reverse mapping for fallback
state_code_to_name = cities_df.set_index('state_id')['state_name'].to_dict()


app = FastAPI(title="Fishbowl Flex API")

# Add CORS middleware - MUST be added before other middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global exception handler to ensure CORS headers are always sent
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Handle all exceptions and ensure CORS headers are sent"""
    print(f"Unhandled exception: {str(exc)}")
    print(traceback.format_exc())
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal server error: {str(exc)}"},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Headers": "*",
        }
    )

# Include project routes
app.include_router(projects_router)
# Include file import routes
app.include_router(file_imports_router)

# Get all cities for fallback matching
ALL_CITIES = cities_df['city'].tolist()

# --- Helper functions ---
def clean_address_text(text: str) -> str:
    """Remove non-address noise and normalize tokens before parsing."""
    t = text.strip()

    # Strip common prefixes / noise
    t = re.sub(r'(?i)\battn:?|attention\b', '', t)

    # Remove phone numbers and extensions (x304, ext. 55)
    t = re.sub(r'\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b', '', t)
    t = re.sub(r'(?i)\b(?:x|ext\.?)\s*\d{1,5}\b', '', t)

    # Remove hours like 7am-8pm
    t = re.sub(r'(?i)\b\d{1,2}\s?(am|pm)\s?-\s?\d{1,2}\s?(am|pm)\b', '', t)

    # Normalize country tokens and common misspellings
    t = re.sub(r'(?i)\bU\.?\s*S\.?\s*A\.?\b', 'USA', t)
    t = re.sub(r'(?i)\bpheonix\b', 'Phoenix', t)

    # Drop stray punctuation (keep commas), collapse whitespace, tidy commas
    t = re.sub(r'[^\w\s,]', ' ', t)
    t = re.sub(r'\s*,\s*', ', ', t)
    t = re.sub(r'\s{2,}', ' ', t)

    return t.strip(' ,.-')

def parse_with_libpostal(text: str) -> dict:
    parsed_pairs = parse_address(text)
    result = {"Street": "", "City": "", "State": "", "Zip": "", "Country": ""}
    mapping = {
        "house_number": "Street",
        "road": "Street",
        "unit": "Street",
        "suburb": "City",
        "city": "City",
        "state": "State",
        "postcode": "Zip",
        "country": "Country"
    }

    # if Libpostal returns nothing, parsed_pairs will be empty list
    if parsed_pairs:
        for val, comp in parsed_pairs:  # Note: postal returns (value, component)
            if comp in mapping:
                key = mapping[comp]
                if result[key]:  # If there's already content, add a space
                    result[key] = f"{result[key]} {val}".strip()
                else:  # If empty, just set the value
                    result[key] = val.strip()

    # Check if this is an international address
    country = result.get("Country", "").upper()
    is_international = country and country not in ['USA', 'US', 'UNITED STATES', 'U.S.A.', 'U.S.', '']
    
    if is_international:
        if country == "CANADA":
            # For Canada: use libpostal parsing but skip US city matching
            # Keep the parsed components as-is (libpostal handles Canadian addresses well)
            # No additional processing needed - result already has parsed components
            pass
        else:
            # For other international addresses: keep everything in Street field
            result = {
                "Street": text.strip(),  # Keep original address
                "City": "",
                "State": "", 
                "Zip": "",
                "Country": result["Country"]  # Keep the detected country
            }
    else:
        # For US addresses: use existing enhanced parsing logic
        
        # ✅ fallback runs when result is still empty
        if not any(result.values()):
            m = re.search(
                r'(\d{1,5}\s+[A-Za-z0-9\s]+?)\s+([A-Za-z][A-Za-z\s]+?)\s+([A-Za-z]{2})[,\s]+(\d{5}(?:-\d{4})?)',
                text,
                flags=re.IGNORECASE,
            )
            if m:
                street, city, state, z = m.groups()
                result["Street"] = street.strip()
                result["City"] = city.strip().title()
                result["State"] = state.upper()
                result["Zip"] = z
                if re.search(r'\bUSA\b', text, flags=re.IGNORECASE):
                    result["Country"] = "USA"

        # Final normalization for casing/labels (US addresses only)
        if result["City"]:
            result["City"] = result["City"].title()
        if result["State"]:
            result["State"] = result["State"].upper()
        if result["Country"]:
            if re.search(r'(?i)\b(usa|u\.s\.a|united states|us)\b', result["Country"], flags=re.IGNORECASE):
                result["Country"] = "USA"
            else:
                result["Country"] = result["Country"].title()

    return result

def get_confidence_score(parsed):
    """Compute a 1–10 confidence score."""
    score = 0
    if parsed.get("Street"): score += 3
    if parsed.get("City"): score += 2
    if parsed.get("State"): score += 2
    if parsed.get("Zip"): score += 2
    if parsed.get("Country"): score += 1
    return min(score, 10)

def correct_city_name(city, state=None):
    """Enhanced city matching with state-specific lookup for better accuracy."""
    if not city:
        return city, 0
    
    # Normalize state code (handle both full names and abbreviations)
    state_code = None
    if state:
        state_upper = state.upper()
        # Check if it's already a state code
        if state_upper in cities_by_state:
            state_code = state_upper
        # Check if it's a state name that needs conversion
        elif state_upper in state_name_to_code:
            state_code = state_name_to_code[state_upper]
        # Try common state name variations
        elif state_upper in ['CALIFORNIA', 'CA']:
            state_code = 'CA'
        elif state_upper in ['TEXAS', 'TX']:
            state_code = 'TX'
        elif state_upper in ['NEW YORK', 'NY']:
            state_code = 'NY'
        # Add more common mappings as needed
    
    # If we have a valid state, search only within that state
    if state_code and state_code in cities_by_state:
        state_cities = cities_by_state[state_code]
        match = process.extractOne(city, state_cities, scorer=fuzz.partial_ratio)
        if match and match[1] > 60:  # Higher threshold for state-specific matching
            return match[0], match[1]
    
    # Fallback: search all cities if no state or no good match found
    match = process.extractOne(city, ALL_CITIES, scorer=fuzz.partial_ratio)
    if match and match[1] > 50:  # Lower threshold for fallback
        return match[0], match[1]
    
    return city, 0

# --- FastAPI Models ---
class AddressRequest(BaseModel):
    text: str

class AddressItem(BaseModel):
    row_id: int
    address: str
    original_row_data: Dict[str, Any]  # Preserve all original columns

class CSVParseRequest(BaseModel):
    import_type: str
    addresses: List[AddressItem]

class ParsedAddress(BaseModel):
    street: str
    city: str
    state: str
    zip: str
    country: str

class AddressResult(BaseModel):
    row_id: int
    success: bool
    original_address: str
    original_row_data: Dict[str, Any]  # Preserve all original columns
    parsed_address: Optional[ParsedAddress] = None
    error_message: Optional[str] = None

class CSVParseResponse(BaseModel):
    success: bool
    processed_count: int
    error_count: int
    results: List[AddressResult]

# Authentication endpoint
@app.get("/api/auth/me")
async def get_current_user_info(user: dict = Depends(get_current_user)):
    """Get current authenticated user information"""
    return {
        "user_id": user.get("user_id"),
        "email": user.get("email"),
        "authenticated": True
    }

@app.post("/parse-address")
def parse_address_api(req: AddressRequest):
    raw = req.text.strip()
    cleaned = clean_address_text(raw)
    parsed = parse_with_libpostal(cleaned)

    # Fuzzy-correct city if needed (pass state for state-specific matching)
    parsed["City"], city_conf = correct_city_name(parsed.get("City", ""), parsed.get("State", ""))

    # Compute confidence
    confidence = get_confidence_score(parsed)

    # Adjust for fuzzy match quality
    if city_conf < 60:
        confidence -= 2
    elif city_conf < 80:
        confidence -= 1
    confidence = max(1, min(confidence, 10))

    return {
        "raw": raw,
        "cleaned": cleaned,
        "parsed": parsed,
        "city_confidence": city_conf,
        "overall_confidence": confidence
    }

@app.post("/parse-addresses", response_model=CSVParseResponse)
def parse_addresses_csv(req: CSVParseRequest):
    """Parse multiple addresses from CSV data with error handling."""
    
    # Only process Customer and Vendor import types
    if req.import_type.lower() not in ['customer', 'vendor']:
        raise HTTPException(
            status_code=400, 
            detail="Address parsing only supported for 'customer' and 'vendor' import types"
        )
    
    results = []
    processed_count = 0
    error_count = 0
    
    for address_item in req.addresses:
        try:
            # Clean and parse the address
            cleaned = clean_address_text(address_item.address)
            parsed = parse_with_libpostal(cleaned)
            
            # Fuzzy-correct city if needed (pass state for state-specific matching)
            parsed["City"], city_conf = correct_city_name(parsed.get("City", ""), parsed.get("State", ""))
            
            # Create parsed address object
            parsed_address = ParsedAddress(
                street=parsed.get("Street", ""),
                city=parsed.get("City", ""),
                state=parsed.get("State", ""),
                zip=parsed.get("Zip", ""),
                country=parsed.get("Country", "")
            )
            
            # Check if parsing was successful (has at least street or city)
            if parsed_address.street or parsed_address.city:
                results.append(AddressResult(
                    row_id=address_item.row_id,
                    success=True,
                    original_address=address_item.address,
                    original_row_data=address_item.original_row_data,  # Preserve original data
                    parsed_address=parsed_address
                ))
                processed_count += 1
            else:
                # Parsing failed - return original address, leave City/State/Zip/Country empty
                results.append(AddressResult(
                    row_id=address_item.row_id,
                    success=False,
                    original_address=address_item.address,
                    original_row_data=address_item.original_row_data,  # Preserve original data
                    error_message="Address parsing failed - no valid components found"
                ))
                error_count += 1
                
        except Exception as e:
            # Any error during parsing - return original address, leave City/State/Zip/Country empty
            results.append(AddressResult(
                row_id=address_item.row_id,
                success=False,
                original_address=address_item.address,
                original_row_data=address_item.original_row_data,  # Preserve original data
                error_message=f"Parsing error: {str(e)}"
            ))
            error_count += 1
    
    return CSVParseResponse(
        success=True,
        processed_count=processed_count,
        error_count=error_count,
        results=results
    )