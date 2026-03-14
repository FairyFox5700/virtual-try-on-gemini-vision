from functools import lru_cache
from google import genai
from google.genai.types import (
    GenerateImagesConfig,
    Image,
    ProductImage,
    RecontextImageConfig,
    RecontextImageSource,
)
from config import settings


@lru_cache(maxsize=1)
def _client() -> genai.Client:
    return genai.Client(
        vertexai=True, project=settings.project_id, location=settings.location
    )


def generate_image(prompt: str) -> Image:
    """Generate a full-body model image from a text prompt using Imagen 4."""
    response = _client().models.generate_images(
        model=settings.image_generation_model,
        prompt=prompt,
        config=GenerateImagesConfig(
            number_of_images=1,
            image_size="1K",
            safety_filter_level="BLOCK_LOW_AND_ABOVE",
            person_generation="ALLOW_ADULT",
        ),
    )
    return response.generated_images[0].image


def virtual_try_on(person_image: Image, product_image: Image) -> Image:
    """Apply a clothing item onto a person using the Virtual Try-On model."""
    response = _client().models.recontext_image(
        model=settings.virtual_try_on_model,
        source=RecontextImageSource(
            person_image=person_image,
            product_images=[ProductImage(product_image=product_image)],
        ),
        config=RecontextImageConfig(
            base_steps=32,
            number_of_images=1,
            safety_filter_level="BLOCK_LOW_AND_ABOVE",
            person_generation="ALLOW_ADULT",
        ),
    )
    return response.generated_images[0].image
