"""
Starter Fullstack — FastAPI Backend
"""

import logging
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.example.router import router as example_router
from app.health.router import router as health_router

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncIterator[None]:
    """Application startup/shutdown lifecycle."""
    logger.info("Application starting up")
    yield
    logger.info("Application shutting down")


app = FastAPI(
    title="Starter Fullstack API",
    version="1.0.0",
    description="Full-stack starter template API",
    lifespan=lifespan,
)

_cors_origins = [o.strip() for o in settings.cors_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(example_router)
