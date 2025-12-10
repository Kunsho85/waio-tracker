from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.endpoints import analytics, reporting

app = FastAPI(title="WAIO Crawler Tracker API")

# CORS
origins = settings.BACKEND_CORS_ORIGINS

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["analytics"])
app.include_router(reporting.router, prefix="/api/v1/reports", tags=["reporting"])

@app.get("/")
async def root():
    return {"message": "Welcome to WAIO Crawler Analytics Platform API"}
