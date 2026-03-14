from fastapi import APIRouter, File, Form, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from typing import Optional
from services.style import analyze_and_style
from utils.image import load_image_from_bytes

router = APIRouter()


@router.post("")
async def run_style(
    clothing_image: UploadFile = File(..., description="The clothing item to style"),
    gender: Optional[str] = Form(
        None, description="'man' or 'woman'. Auto-detected by Gemini when omitted."
    ),
):
    """
    Generate 3 styled full-outfit looks built around a single clothing item.
    Uses Gemini Vision for analysis + Imagen 4 for generation + Virtual Try-On.
    """
    if not clothing_image.content_type or not clothing_image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="clothing_image must be an image file.")

    if gender and gender not in ("man", "woman"):
        raise HTTPException(status_code=400, detail="gender must be 'man' or 'woman'.")

    clothing_bytes = await clothing_image.read()
    clothing = load_image_from_bytes(clothing_bytes)
    result = analyze_and_style(clothing, clothing_bytes, gender)
    return JSONResponse(result)
