"""
Supabase client singleton for KSEB VPP backend.

Two clients are provided:
- `supabase`       — uses the anon key (respects RLS, safe for user-scoped ops)
- `supabase_admin` — uses the service-role key (bypasses RLS, server-side only)
"""
from supabase import create_client, Client
from .config import settings

settings.validate()

# Anon client — respects RLS
supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)

# Admin client — bypasses RLS (use for Edge Function equivalents only)
supabase_admin: Client = create_client(
    settings.SUPABASE_URL,
    settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_ANON_KEY,
)
