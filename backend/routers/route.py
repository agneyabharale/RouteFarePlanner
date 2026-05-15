from fastapi import APIRouter, Request
from backend.core.dijkstra import find_path, weight_time, weight_cost, weight_comfort
from backend.models.requests import RouteRequest
from backend.models.response import RouteResponse, RouteSummary, StepDetail

router = APIRouter()


@router.post("/route", response_model=RouteResponse)
def calculate_route(request_data: RouteRequest, request: Request):
    if not hasattr(request.app.state, "graph"):
        return RouteResponse(success=False, message="Graph not loaded")

    graph = request.app.state.graph
    nodes = request.app.state.nodes
    routes = request.app.state.routes

    # Fix 1: map all three preference values to weight functions
    weight_map = {
        "fastest":  weight_time,
        "cheapest": weight_cost,
        "comfiest": weight_comfort,
    }
    w_func = weight_map.get(request_data.preference, weight_time)

    def resolve_node(query: str, nodes_dict: dict) -> str:
        query = query.strip()
        if query in nodes_dict:
            return query
        q_low = query.lower()
        for nid, ndata in nodes_dict.items():
            if ndata.get("name", "").lower() == q_low:
                return nid
        return query

    start_id = resolve_node(request_data.start, nodes)
    end_id   = resolve_node(request_data.end, nodes)

    path_result = find_path(
        graph=graph,
        start=start_id,
        end=end_id,
        weight_func=w_func,
    )

    if not path_result:
        return RouteResponse(
            success=False,
            message=f"No route found from '{request_data.start}' to '{request_data.end}'"
        )

    # Reconstruct ordered list of node IDs: [start, n1, n2, ..., end]
    path_nodes = [request_data.start] + [e.to for e in path_result["edges"]]

    legs       = []
    modes_used = []
    transfers  = 0
    prev_mode  = None

    for i, edge in enumerate(path_result["edges"]):
        from_id = path_nodes[i]
        to_id   = path_nodes[i + 1]

        # Count mode changes (skip transfer→transit changes, only count real mode swaps)
        if prev_mode is not None and edge.mode != prev_mode:
            # Only count as a transfer if neither leg is a 'transfer' edge
            if edge.mode != "transfer" and prev_mode != "transfer":
                transfers += 1

        if edge.mode not in modes_used:
            modes_used.append(edge.mode)
        prev_mode = edge.mode

        from_name = nodes.get(from_id, {}).get("name", from_id)
        to_name   = nodes.get(to_id,   {}).get("name", to_id)

        # Enrich route_name from routes dict if available
        route_name = None
        if edge.route_id and edge.route_id in routes:
            route_name = routes[edge.route_id].get("name")

        legs.append(StepDetail(
            from_stop     = from_name,
            to_stop       = to_name,
            from_id       = from_id,
            to_id         = to_id,
            mode          = edge.mode,
            route_id      = edge.route_id,
            route_name    = route_name,
            time_min      = int(edge.time_min),
            cost_inr      = int(edge.cost_inr),
            comfort_score = int(edge.comfort_score),
        ))

    start_name   = nodes.get(request_data.start, {}).get("name", request_data.start)
    end_name     = nodes.get(request_data.end,   {}).get("name", request_data.end)
    path_display = [nodes.get(n, {}).get("name", n) for n in path_nodes]

    summary = RouteSummary(
        total_time_min = int(path_result["total_time_min"]),
        total_cost_inr = int(path_result["total_cost_inr"]),
        avg_comfort    = path_result["avg_comfort"],   # Fix 2: use real value from dijkstra
        total_stops    = len(path_result["edges"]),
        transfers      = transfers,
        modes_used     = modes_used,
    )

    return RouteResponse(
        success     = True,
        preference  = request_data.preference,
        origin      = start_name,
        destination = end_name,
        path        = path_display,
        legs        = legs,
        summary     = summary,
    )