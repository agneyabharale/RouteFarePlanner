import sys
from pathlib import Path

# Add project root to path so 'backend' module is discoverable when running directly
_ROOT = Path(__file__).parent.parent.parent
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))

import heapq
from typing import Optional, Any, Callable
from backend.core.graph import AdjEdge

def weight_time(edge: AdjEdge) -> float:
    return float(edge.time_min)

def weight_cost(edge: AdjEdge) -> float:
    return float(edge.cost_inr)

def find_path(
    graph: dict[str, list[AdjEdge]],
    start: str,
    end: str,
    weight_func: Optional[Callable[[AdjEdge], float]] = None
) -> Optional[dict[str, Any]]:
    """
    Finds the shortest path between start and end nodes using Dijkstra's algorithm.
    
    Args:
        graph: Adjacency list from build_graph()
        start: Starting node ID
        end: Destination node ID
        weight_func: Function that takes an AdjEdge and returns a float weight. 
                     Defaults to weight_time if None.
                     
    Returns:
        Dict containing path details or None if no path exists.
    """
    if start not in graph and start != end:
        # Optimization: start node has no outgoing edges
        return None
        
    if weight_func is None:
        weight_func = weight_time

    distances: dict[str, float] = {start: 0.0}
    parents: dict[str, tuple[str, Optional[AdjEdge]]] = {start: (start, None)}
    pq = [(0.0, start)]
    
    while pq:
        current_dist, current_node = heapq.heappop(pq)
        
        if current_node == end:
            break
            
        if current_dist > distances.get(current_node, float('inf')):
            continue
            
        for edge in graph.get(current_node, []):
            weight = weight_func(edge)
            new_dist = current_dist + weight
            
            if new_dist < distances.get(edge.to, float('inf')):
                distances[edge.to] = new_dist
                parents[edge.to] = (current_node, edge)
                heapq.heappush(pq, (new_dist, edge.to))
                
    if end not in parents:
        return None
        
    # Reconstruct path
    path_edges = []
    curr = end
    while curr != start:
        prev, edge = parents[curr]
        if edge is not None:
            path_edges.append(edge)
        curr = prev
        
    path_edges.reverse()
    
    total_time = sum(e.time_min for e in path_edges)
    total_cost = sum(e.cost_inr for e in path_edges)
    
    return {
        "start": start,
        "end": end,
        "edges": path_edges,
        "total_time_min": total_time,
        "total_cost_inr": total_cost,
        "total_weight": distances[end]
    }

if __name__ == "__main__":
    import json
    from pathlib import Path
    from backend.core.graph import build_graph
    
    _ROOT = Path(__file__).parent.parent.parent
    _DATA = _ROOT / "data"
    
    try:
        with open(_DATA / "edges.json") as f:
            edges_raw = json.load(f)["edges"]
            
        graph = build_graph(edges_raw)
        
        print("Testing shivajinagar -> swargate (Optimize for Time)")
        res = find_path(graph, "shivajinagar", "swargate")
        if res:
            print(f"Time: {res['total_time_min']} min, Cost: ₹{res['total_cost_inr']}")
            for e in res["edges"]:
                print(f"  {e.mode}: {e.to} ({e.time_min}m)")
        else:
            print("Path not found!")
            
        print("\nTesting hinjawadi -> hadapsar (Optimize for Time)")
        res2 = find_path(graph, "hinjawadi", "hadapsar")
        if res2:
            print(f"Time: {res2['total_time_min']} min, Cost: ₹{res2['total_cost_inr']}")
            for e in res2["edges"]:
                print(f"  {e.mode}: {e.to} ({e.time_min}m)")
        else:
            print("Path not found!")
    except FileNotFoundError:
        print("edges.json not found, make sure you are running from the project root or the data directory exists.")
