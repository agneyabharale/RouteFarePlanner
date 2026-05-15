from fastapi import APIRouter, Request
from backend.models.response import HealthResponse

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
def health_check(request: Request):
    """Returns server status and graph load confirmation."""
    graph_loaded = (
        hasattr(request.app.state, "graph")
        and request.app.state.graph is not None
    )

    node_count = len(request.app.state.nodes) if hasattr(request.app.state, "nodes") else 0
    edge_count = len(request.app.state.edges) if hasattr(request.app.state, "edges") else 0

    return HealthResponse(
        status       = "ok" if graph_loaded else "degraded",
        graph_loaded = graph_loaded,
        node_count   = node_count,
        edge_count   = edge_count,
        version      = "1.0.0",
    )