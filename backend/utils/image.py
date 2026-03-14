import typing
import io
import base64
from PIL import Image as PIL_Image
from google.genai.types import Image


def load_image_from_bytes(data: bytes) -> Image:
    """Convert uploaded file bytes into a genai Image object (PNG-encoded)."""
    buf = io.BytesIO()
    PIL_Image.open(io.BytesIO(data)).save(buf, format="PNG")
    return Image(image_bytes=buf.getvalue())


def load_image_from_path(path: str) -> Image:
    """Load a local image file into a genai Image object."""
    buf = io.BytesIO()
    PIL_Image.open(path).save(buf, format="PNG")
    return Image(image_bytes=buf.getvalue())


def image_to_base64(image: Image) -> str:
    """Encode a genai Image as a base64 PNG string for API responses."""
    return base64.b64encode(image_to_bytes(image)).decode("utf-8")


def image_to_bytes(image: Image) -> bytes:
    """Return raw PNG bytes for a genai Image."""
    pil = typing.cast(PIL_Image.Image, image._pil_image)
    if pil.mode != "RGB":
        pil = pil.convert("RGB")
    buf = io.BytesIO()
    pil.save(buf, format="PNG")
    return buf.getvalue()


def save_image(image: Image, path: str) -> None:
    """Persist a genai Image to disk."""
    import os

    pil = typing.cast(PIL_Image.Image, image._pil_image)
    if pil.mode != "RGB":
        pil = pil.convert("RGB")
    os.makedirs(os.path.dirname(path) or ".", exist_ok=True)
    pil.save(path)
