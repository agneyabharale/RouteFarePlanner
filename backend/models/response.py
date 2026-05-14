from pydantic import BaseModel
from typing import Optional


# ── Building blocks ───────────────────────────────────────────────────────────

class StepDetail(BaseModel):
    """
    One leg of the journey — a single hop from one stop to the next.
    Returned as part of RouteResponse.legs[].
    """
    from_stop:     str           # human-readable name  e.g. "PCMC Bhavan"
    to_stop:       str           # human-readable name  e.g. "Dapodi"
    from_id:       str           # node ID              e.g. "pcmc_bhavan"
    to_id:         str           # node ID              e.g. "dapodi"
    mode:          str           # "bus" | "metro" | "train" | "transfer"
    route_id:      Optional[str] # "BUS_311D" — null for transfer legs
    route_name:    Optional[str] # "Pimpri Gaon → Pune Station" — null for transfer
    time_min:      int
    cost_inr:      int
    comfort_score: int           # 1–10


class RouteSummary(BaseModel):
    """
    Totals and highlights for the whole journey.
    Shown in the route card header.
    """
    total_time_min:  int
    total_cost_inr:  int
    avg_comfort:     float        # rounded to 1 decimal
    total_stops:     int          # number of nodes in path − 1
    transfers:       int          # number of mode changes
    modes_used:      list[str]    # ordered, deduplicated  e.g. ["bus", "metro"]
    distance_km:     Optional[float] = None   # populated if geo.py is available


class FareBreakdown(BaseModel):
    """
    Itemised fare for POST /fare.
    Cab rides have more detail than fixed-fare transit.
    """
    mode:             str
    base_fare_inr:    float
    distance_km:      Optional[float] = None
    duration_min:     Optional[float] = None
    surge_multiplier: Optional[float] = None   # cab only
    surge_amount_inr: Optional[float] = None   # cab only
    tax_inr:          Optional[float] = None   # cab only (GST 5%)
    total_inr:        float
    breakdown_note:   str    # human-readable e.g. "₹30 base + ₹48 (6km × ₹8/km)"


class StopResult(BaseModel):
    """One autocomplete result from GET /stops/search."""
    id:          str
    name:        str
    type:        str           # "bus_stop" | "metro_station" | "train_station" | "interchange"
    interchange: bool
    lat:         float
    lng:         float
    networks:    Optional[list[str]] = None   # only on interchange nodes


# ── Top-level response models ─────────────────────────────────────────────────

class RouteResponse(BaseModel):
    """
    POST /route response.

    success=False means no path was found — no legs, no summary.
    The 'message' field explains why.
    """
    success:     bool
    preference:  Optional[str]           = None   # "fastest" | "cheapest" | "comfiest"
    origin:      Optional[str]           = None   # display name of start node
    destination: Optional[str]           = None   # display name of end node
    path:        Optional[list[str]]     = None   # ordered display names, start → end
    legs:        Optional[list[StepDetail]] = None
    summary:     Optional[RouteSummary]  = None
    message:     Optional[str]           = None   # set when success=False


class FareResponse(BaseModel):
    """POST /fare response."""
    success:   bool
    fare:      Optional[FareBreakdown] = None
    message:   Optional[str]          = None


class StopSearchResponse(BaseModel):
    """GET /stops/search response."""
    results: list[StopResult]
    total:   int


class HealthResponse(BaseModel):
    """GET /health response."""
    status:       str           # "ok" | "degraded"
    graph_loaded: bool
    node_count:   int
    edge_count:   int
    version:      str = "1.0.0"