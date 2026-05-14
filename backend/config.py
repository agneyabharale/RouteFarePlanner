from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


# Project root = two levels above this file  (backend/config.py → ROUTEFAREPLANNER/)
_ROOT = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    """
    All runtime configuration lives here.

    Values are read from environment variables first.
    If not set, the defaults below are used.
    Set them in backend/.env for local dev — never commit that file.
    """

    model_config = SettingsConfigDict(
        env_file=Path(__file__).parent / ".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # ── Data file paths ───────────────────────────────────────────────────────
    # Override with absolute paths in production if data/ moves outside the repo.
    NODES_PATH:  Path = _ROOT / "data" / "nodes.json"
    EDGES_PATH:  Path = _ROOT / "data" / "edges.json"
    ROUTES_PATH: Path = _ROOT / "data" / "routes.json"

    # ── API settings ──────────────────────────────────────────────────────────
    API_VERSION: str  = "1.0.0"
    API_TITLE:   str  = "RouteFarePlanner API"

    # ── CORS ──────────────────────────────────────────────────────────────────
    # In production, replace "*" with your actual frontend domain.
    CORS_ORIGINS: list[str] = ["*"]

    # ── External API keys (optional) ─────────────────────────────────────────
    # Leave blank if you're using Nominatim (free, no key needed).
    GOOGLE_MAPS_KEY: str = ""

    # ── Dijkstra tuning ───────────────────────────────────────────────────────
    # Extra minutes added each time the transport mode changes.
    # Discourages routes with too many transfers.
    TRANSFER_PENALTY_MIN: int = 5

    # ── Cab fare rate cards (Pune, 2024) ──────────────────────────────────────
    # Base fare = flat charge just for booking.
    # Per-km rate applied after the first 2 km.
    # Per-min rate applied for waiting / slow traffic.
    CAB_MINI_BASE:    float = 30.0
    CAB_MINI_PER_KM:  float = 8.0
    CAB_MINI_PER_MIN: float = 1.0

    CAB_SEDAN_BASE:    float = 50.0
    CAB_SEDAN_PER_KM:  float = 12.0
    CAB_SEDAN_PER_MIN: float = 1.5

    CAB_SUV_BASE:    float = 80.0
    CAB_SUV_PER_KM:  float = 16.0
    CAB_SUV_PER_MIN: float = 2.0

    CAB_AUTO_BASE:    float = 25.0
    CAB_AUTO_PER_KM:  float = 6.0
    CAB_AUTO_PER_MIN: float = 0.5

    # GST on cab rides (5%)
    CAB_GST_RATE: float = 0.05

    # ── Geocoding ─────────────────────────────────────────────────────────────
    # Nominatim requires a User-Agent header.
    NOMINATIM_USER_AGENT: str = "RouteFarePlanner/1.0"
    # Max requests per second to Nominatim (free tier limit = 1)
    NOMINATIM_RATE_LIMIT: float = 1.0


# Single shared instance — import this everywhere.
settings = Settings()