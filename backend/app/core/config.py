"""
Configuration loading for KSEB VPP backend.
Reads Supabase credentials from .env file.
"""
import os
# pyrefly: ignore [missing-import]
from dotenv import load_dotenv

# Load .env from the backend/app directory
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env"))


class Settings:
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY", "")
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    INCENTIVE_RATE_PER_KWH: float = float(os.getenv("INCENTIVE_RATE_PER_KWH", "10.0"))

    def validate(self):
        if not self.SUPABASE_URL:
            raise RuntimeError("SUPABASE_URL is not set in .env")
        if not self.SUPABASE_ANON_KEY:
            raise RuntimeError("SUPABASE_ANON_KEY is not set in .env")


settings = Settings()
