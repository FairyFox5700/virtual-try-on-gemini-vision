import os
from dataclasses import dataclass, field
from pathlib import Path

from dotenv import load_dotenv


load_dotenv(Path(__file__).resolve().parent / ".env")


@dataclass
class Settings:
    project_id: str = field(
        default_factory=lambda: os.getenv(
            "GOOGLE_CLOUD_PROJECT", "virtual-try-on-490008"
        )
    )

    location: str = field(
        default_factory=lambda: os.getenv("LOCATION", "europe-west4")
    )

    gemini_location: str = field(
        default_factory=lambda: os.getenv("GEMINI_LOCATION", "us-central1")
    )

    virtual_try_on_model: str = field(
        default_factory=lambda: os.getenv("VIRTUAL_TRY_ON_MODEL", "virtual-try-on-001")
    )
    image_generation_model: str = field(
        default_factory=lambda: os.getenv(
            "IMAGE_GENERATION_MODEL",
            os.getenv("IMAGE_GENERATION", "imagen-4.0-generate-001"),
        )
    )
    gemini_model: str = field(
        default_factory=lambda: os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    )

    output_dir: str = field(
        default_factory=lambda: os.getenv("OUTPUT_DIR", "output")
    )

    cors_origins: list[str] = field(
        default_factory=lambda: os.getenv(
            "CORS_ORIGINS",
            "http://localhost:3000,http://localhost:5173,http://localhost:8080,http://localhost:8000"
        ).split(",")
    )

    cors_origin_regex: str = r"https://.*\.lovable\.app"


settings = Settings()