from fastapi import APIRouter, Request, Depends
from models.requests import StopSearchRequest
from models.response import StopSearchResponse, StopResult

router = APIRouter()

@router.get("/stops/search", response_model=StopSearchResponse)
def search_stops(request: Request, search_req: StopSearchRequest = Depends()):
    if not hasattr(request.app.state, "nodes"):
        return StopSearchResponse(results=[], total=0)
        
    nodes = request.app.state.nodes
    query = search_req.q.lower()
    
    results = []
    for node_id, node_data in nodes.items():
        name = node_data.get("name", "").lower()
        if query in node_id.lower() or query in name:
            results.append(StopResult(
                id=node_id,
                name=node_data.get("name", node_id),
                type=node_data.get("type", "bus_stop"),
                interchange=node_data.get("interchange", False),
                lat=node_data.get("lat", 0.0),
                lng=node_data.get("lon", 0.0), # Assuming 'lon' in data, 'lng' in response
                networks=node_data.get("networks")
            ))
            
    results = results[:search_req.limit]
    return StopSearchResponse(results=results, total=len(results))
