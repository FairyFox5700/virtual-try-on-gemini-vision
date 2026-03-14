from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from config import settings
from routers import try_on, style, mock

app = FastAPI(
    title="Virtual Try-On API",
    description="AI-powered virtual try-on using Google Imagen 4 and Vertex AI Virtual Try-On.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(try_on.router, prefix="/api/try-on", tags=["Try-On"])
app.include_router(style.router, prefix="/api/style", tags=["Style"])
app.include_router(mock.router, prefix="/api/mock", tags=["Mock"])


@app.get("/api/health", tags=["Health"])
async def health():
    return {"status": "ok"}


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(status_code=500, content={"detail": str(exc)})
