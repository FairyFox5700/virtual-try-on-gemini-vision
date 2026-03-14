import json
import io
from concurrent.futures import ThreadPoolExecutor, as_completed
from functools import lru_cache
from PIL import Image as PIL_Image
from google import genai
from google.genai import types as genai_types
from google.genai.types import Image
from config import settings
from services.imagen import generate_image, virtual_try_on
from utils.image import image_to_base64


_STYLE_SCHEMA = {
    "type": "object",
    "properties": {
        "gender": {"type": "string", "enum": ["man", "woman"]},
        "item_description": {"type": "string"},
        "styles": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "name": {"type": "string"},
                    "description": {"type": "string"},
                    "outfit_prompt": {"type": "string"},
                },
                "required": ["name", "description", "outfit_prompt"],
            },
        },
    },
    "required": ["gender", "item_description", "styles"],
}


@lru_cache(maxsize=1)
def _gemini_client() -> genai.Client:
    return genai.Client(
        vertexai=True,
        project=settings.project_id,
        location=settings.gemini_location,
    )


def analyze_and_style(
    clothing_image: Image,
    image_bytes: bytes,
    gender: str | None = None,
) -> dict:
    """
    Use Gemini Vision to analyse a clothing item, generate 3 outfit styles,
    render each with Imagen 4, and apply Virtual Try-On.

    Returns a dict with keys: gender, item_description, styles (list of looks).
    """
    # Convert supplied bytes to PNG for Gemini
    buf = io.BytesIO()
    PIL_Image.open(io.BytesIO(image_bytes)).save(buf, format="PNG")
    png_bytes = buf.getvalue()

    analysis_prompt = (
        "You are a professional fashion stylist. Analyse this clothing item. "
        + (f"The clothing is for a {gender}. " if gender else "Detect whether it is for a man or a woman. ")
        + "Return exactly 3 distinct full-outfit style suggestions that feature this exact item. "
        "For each style include: a short style name, a one-sentence description, and an outfit_prompt "
        f"suitable for Imagen image generation — a full-body fashion photo of "
        + (f"a {gender}" if gender else "the detected gender (man or woman)")
        + " wearing this exact item plus complementary clothing and accessories, "
        "professional photography, white studio background, full body visible from head to toe."
    )

    img_part = genai_types.Part.from_bytes(data=png_bytes, mime_type="image/png")
    gemini_response = _gemini_client().models.generate_content(
        model=settings.gemini_model,
        contents=[img_part, analysis_prompt],
        config=genai_types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=_STYLE_SCHEMA,
        ),
    )

    analysis = json.loads(gemini_response.text)
    detected_gender = gender or analysis.get("gender", "woman")
    item_desc = analysis.get("item_description", "clothing item")
    styles = analysis.get("styles", [])[:3]

    looks = []
    def _generate_look(style: dict, index: int) -> tuple[int, dict]:
        outfit_prompt = f"full body portrait of a {detected_gender}, {style['outfit_prompt']}"
        model_image = generate_image(outfit_prompt)
        tryon_result = virtual_try_on(model_image, clothing_image)
        return index, {
            "name": style["name"],
            "description": style.get("description", ""),
            "model_image_base64": image_to_base64(model_image),
            "tryon_image_base64": image_to_base64(tryon_result),
        }

    with ThreadPoolExecutor(max_workers=3) as executor:
        futures = {executor.submit(_generate_look, style, i): i for i, style in enumerate(styles)}
        results = {}
        for future in as_completed(futures):
            index, look = future.result()
            results[index] = look
    looks = [results[i] for i in sorted(results)]

    return {
        "gender": detected_gender,
        "item_description": item_desc,
        "styles": looks,
    }
