import json
from pathlib import Path
from core.graph import build_graph

def load_all(nodes_path: str, edges_path: str, routes_path: str):
    """
    Loads nodes, edges, routes, and builds the graph.
    Returns: (nodes_dict, edges_list, routes_dict, graph_dict)
    """
    root_dir = Path(__file__).parent.parent.parent
    
    nodes_file = root_dir / nodes_path
    edges_file = root_dir / edges_path
    routes_file = root_dir / routes_path
    
    with open(nodes_file, "r", encoding="utf-8") as f:
        nodes_raw = json.load(f).get("nodes", [])
        nodes_dict = {n["id"]: n for n in nodes_raw}
        
    with open(edges_file, "r", encoding="utf-8") as f:
        edges_list = json.load(f).get("edges", [])
        
    try:
        with open(routes_file, "r", encoding="utf-8") as f:
            routes_raw = json.load(f).get("routes", [])
            routes_dict = {r["route_id"]: r for r in routes_raw}
    except FileNotFoundError:
        routes_dict = {}
        
    graph_dict = build_graph(edges_list)
    
    return nodes_dict, edges_list, routes_dict, graph_dict
