"""
KSEB VPP — FastAPI application entrypoint.

Run with:
    uvicorn app.api.main:app --reload

Or from backend/app directory:
    uvicorn api.main:app --reload
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .prosumer import router as prosumer_router
from .cluster import router as cluster_router
from .dispatch import router as dispatch_router

app = FastAPI(
    title="KSEB VPP Backend",
    description="Virtual Power Plant backend API for KSEB hackathon prototype",
    version="1.0.0",
)

# Allow all origins for hackathon (restrict in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(prosumer_router)
app.include_router(cluster_router)
app.include_router(dispatch_router)


@app.get("/health")
def health():
    """Health check endpoint."""
    return {"status": "ok", "service": "KSEB VPP Backend"}
