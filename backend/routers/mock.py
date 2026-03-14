import json
from pathlib import Path
from typing import Optional
from fastapi import APIRouter, File, Form, UploadFile
from fastapi.responses import JSONResponse

router = APIRouter()

_MOCK_DIR = Path(__file__).parent.parent / "mock"


@router.post("/try-on")
async def mock_try_on(
    person_image: UploadFile = File(..., description="Photo of the person"),
    clothing_image: UploadFile = File(..., description="Clothing item to try on"),
):
    """Return a pre-saved mock try-on response — no AI model calls."""
    with open(_MOCK_DIR / "try-on-response.json", "r", encoding="utf-8") as f:
        data = json.load(f)
    return JSONResponse(content=data)


@router.post("/style")
async def mock_style(
    clothing_image: UploadFile = File(..., description="Clothing item to analyse"),
    gender: Optional[str] = Form(None),
):
    """Return a pre-saved mock style analysis response — no AI model calls."""
    with open(_MOCK_DIR / "style-response.json", "r", encoding="utf-8") as f:
        data = json.load(f)
    return JSONResponse(content=data)
