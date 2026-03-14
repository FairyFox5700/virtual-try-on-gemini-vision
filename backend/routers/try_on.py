from fastapi import APIRouter, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from services.imagen import virtual_try_on
from utils.image import load_image_from_bytes, image_to_base64

router = APIRouter()


@router.post("")
async def run_try_on(
    person_image: UploadFile = File(..., description="Photo of the person"),
    clothing_image: UploadFile = File(..., description="Clothing item to try on"),
):
    """
    Apply a clothing item onto a person photo.
    """
    if not person_image.content_type or not person_image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="person_image must be an image file.")
    if not clothing_image.content_type or not clothing_image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="clothing_image must be an image file.")

    person_bytes = await person_image.read()
    clothing_bytes = await clothing_image.read()

    person = load_image_from_bytes(person_bytes)
    clothing = load_image_from_bytes(clothing_bytes)
    result = virtual_try_on(person, clothing)

    b64 = image_to_base64(result)

    return JSONResponse({
        "image_base64": b64,
        "image_url": f"data:image/png;base64,{b64}",
    })
