import os
from dataclasses import dataclass, field


@dataclass
class Settings:
    project_id: str = field(
        default_factory=lambda: os.getenv("GOOGLE_CLOUD_PROJECT", "virtual-try-on-490008")
    )
    location: str = field(
        default_factory=lambda: os.getenv("LOCATION", "europe-west4")
    )
    gemini_location: str = field(
        default_factory=lambda: os.getenv("GEMINI_LOCATION", "us-central1")
    )
    virtual_try_on_model: str = "virtual-try-on-preview-08-04"
    image_generation_model: str = "imagen-4.0-generate-001"
    gemini_model: str = "gemini-2.5-flash"
    output_dir: str = field(
        default_factory=lambda: os.getenv("OUTPUT_DIR", "output")
    )
    cors_origins: list = field(
        default_factory=lambda: os.getenv(
            "CORS_ORIGINS", "http://localhost:3000"
        ).split(",")
    )


settings = Settings()
