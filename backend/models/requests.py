from pydantic import BaseModel, field_validator, model_validator
from typing import Literal, Optional


# ── Route request ─────────────────────────────────────────────────────────────

class RouteRequest(BaseModel):
    """
    POST /route

    start / end : node IDs from nodes.json  e.g. "pcmc_bhavan"
    preference  : which Dijkstra weight to minimise
    """
    start:      str
    end:        str
    preference: Literal["fastest", "cheapest", "comfiest"] = "fastest"

    @field_validator("start", "end")
    @classmethod
    def slugify(cls, v: str) -> str:
        """Lowercase and strip whitespace so 'PCMC Bhavan' still works."""
        return v.strip().lower()

    @model_validator(mode="after")
    def start_ne_end(self) -> "RouteRequest":
        if self.start == self.end:
            raise ValueError("start and end must be different nodes")
        return self


# ── Fare request ──────────────────────────────────────────────────────────────

class FareRequest(BaseModel):
    """
    POST /fare

    Accepts either:
      (a) node_ids — list of stop IDs from a Dijkstra result
      (b) distance_km + duration_min — for direct cab-fare estimation

    mode : which transport mode to price
    """
    mode: Literal["cab", "bus", "metro", "train"]

    # Option A — pass the stop list from a RouteResponse
    node_ids: Optional[list[str]] = None

    # Option B — pass raw distance / time (cab pricing, or frontend calculation)
    distance_km:  Optional[float] = None
    duration_min: Optional[float] = None

    # Cab-specific extras
    surge_multiplier: float = 1.0    # 1.0 = no surge, 1.5 = 50% surge
    vehicle_type: Literal["mini", "sedan", "suv", "auto"] = "sedan"

    @model_validator(mode="after")
    def validate_inputs(self) -> "FareRequest":
        has_nodes    = self.node_ids is not None and len(self.node_ids) >= 2
        has_distance = self.distance_km is not None
        if not has_nodes and not has_distance:
            raise ValueError(
                "Provide either node_ids (≥2 items) or distance_km"
            )
        if self.surge_multiplier < 1.0 or self.surge_multiplier > 3.0:
            raise ValueError("surge_multiplier must be between 1.0 and 3.0")
        if self.distance_km is not None and self.distance_km <= 0:
            raise ValueError("distance_km must be positive")
        return self


# ── Stop search request ───────────────────────────────────────────────────────

class StopSearchRequest(BaseModel):
    """
    GET /stops/search?q=...&limit=5

    Used for autocomplete in the frontend search box.
    Sent as query parameters, not a request body.
    """
    q:     str
    limit: int = 5

    @field_validator("q")
    @classmethod
    def min_length(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 2:
            raise ValueError("Search query must be at least 2 characters")
        return v

    @field_validator("limit")
    @classmethod
    def clamp_limit(cls, v: int) -> int:
        return max(1, min(v, 20))