from fastapi import APIRouter, Request
from core.dijkstra import find_path, weight_time, weight_cost
from models.requests import RouteRequest
from models.response import RouteResponse, RouteSummary, StepDetail

router = APIRouter()

@router.post("/route", response_model=RouteResponse)
def calculate_route(request_data: RouteRequest, request: Request):
    if not hasattr(request.app.state, "graph"):
        return RouteResponse(success=False, message="Graph not loaded")
        
    graph = request.app.state.graph
    nodes = request.app.state.nodes
    
    # Determine weight function
    w_func = weight_time
    if request_data.preference == "cheapest":
        w_func = weight_cost
    
    path_result = find_path(
        graph=graph,
        start=request_data.start,
        end=request_data.end,
        weight_func=w_func
    )
    
    if not path_result:
        return RouteResponse(success=False, message="No route found between the specified locations")
        
    # Reconstruct path nodes
    path_nodes = [request_data.start] + [e.to for e in path_result["edges"]]
    
    legs = []
    modes_used = []
    transfers = 0
    prev_mode = None
    
    for i, edge in enumerate(path_result["edges"]):
        from_id = path_nodes[i]
        to_id = path_nodes[i+1]
        
        # Track modes and transfers
        if edge.mode != prev_mode and prev_mode is not None:
            transfers += 1
        if edge.mode not in modes_used:
            modes_used.append(edge.mode)
        prev_mode = edge.mode
        
        from_name = nodes.get(from_id, {}).get("name", from_id)
        to_name = nodes.get(to_id, {}).get("name", to_id)
        
        legs.append(StepDetail(
            from_stop=from_name,
            to_stop=to_name,
            from_id=from_id,
            to_id=to_id,
            mode=edge.mode,
            route_id=edge.route_id,
            route_name=None,
            time_min=int(edge.time_min),
            cost_inr=int(edge.cost_inr),
            comfort_score=int(edge.comfort_score)
        ))
        
    start_name = nodes.get(request_data.start, {}).get("name", request_data.start)
    end_name = nodes.get(request_data.end, {}).get("name", request_data.end)
    
    path_display = [nodes.get(n, {}).get("name", n) for n in path_nodes]
    
    summary = RouteSummary(
        total_time_min=int(path_result["total_time_min"]),
        total_cost_inr=int(path_result["total_cost_inr"]),
        avg_comfort=5.0, # Placeholder
        total_stops=len(path_result["edges"]),
        transfers=transfers,
        modes_used=modes_used
    )
    
    return RouteResponse(
        success=True,
        preference=request_data.preference,
        origin=start_name,
        destination=end_name,
        path=path_display,
        legs=legs,
        summary=summary
    )
