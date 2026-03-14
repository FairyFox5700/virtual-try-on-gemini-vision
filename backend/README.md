# Virtual Try-On — Backend

FastAPI backend powering the virtual try-on experience via Google Vertex AI (Imagen 4, Virtual Try-On, Gemini).

## Structure

```
backend/
├── main.py            # FastAPI app, middleware, router registration
├── config.py          # Settings loaded from environment variables
├── pyproject.toml     # uv project & dependencies
├── .env.example       # Environment variable template
├── routers/
│   ├── try_on.py      # POST /api/try-on  — apply clothing onto a person
│   └── style.py       # POST /api/style   — generate 3 full styled looks
├── services/
│   ├── imagen.py      # Vertex AI Virtual Try-On & Imagen 4 calls
│   └── style.py       # Gemini Vision analysis + Imagen generation pipeline
└── utils/
    └── image.py       # Image loading / base64 helpers
```

## Setup

### 1. Install dependencies

uv sync

Edit `.env`:

| Variable | Description | Default |
|---|---|---|
| `GOOGLE_CLOUD_PROJECT` | GCP project ID | `virtual-try-on-490008` |
| `LOCATION` | Vertex AI region for Imagen & Try-On | `europe-west4` |
| `GEMINI_LOCATION` | Vertex AI region for Gemini | `us-central1` |
| `OUTPUT_DIR` | Directory to persist generated images | `output` |
| `CORS_ORIGINS` | Comma-separated allowed origins | `http://localhost:3000` |
| `VIRTUAL_TRY_ON_MODEL` | Virtual Try-On model ID | `virtual-try-on-preview-08-04` |
| `IMAGE_GENERATION` | Imagen model ID | `imagen-4.0-generate-001` |
| `GEMINI_MODEL` | Gemini model ID | `gemini-2.5-flash` |

### 3. Authenticate with Google Cloud

```bash
gcloud auth application-default login
```

### 4. Run

```bash
uv run uvicorn main:app --reload
```

API available at `http://localhost:8000`.  
Interactive docs at `http://localhost:8000/docs`.

## API Endpoints

### `POST /api/try-on`

Apply one or more clothing items onto a person photo sequentially.

| Field | Type | Description |
|---|---|---|
| `person_image` | `file` | Photo of the person |
| `clothing_image` | `file` | Clothing item to try on |

**Response:**
```json
{
  "image_base64": "<base64>"
}
```

---

### `POST /api/style`

Generate 3 styled full-outfit looks built around a single clothing item.

| Field | Type | Description |
|---|---|---|
| `clothing_image` | `file` | The clothing item to style |
| `gender` | `string` (optional) | `man` or `woman` — auto-detected if omitted |

---

### `GET /api/health`

Returns `{"status": "ok"}` — use for liveness checks.
