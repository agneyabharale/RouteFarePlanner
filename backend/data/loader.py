import json
from pathlib import Path
from backend.core.graph import build_graph


def load_all(nodes_path: Path, edges_path: Path, routes_path: Path):
    """
    Loads nodes, edges, routes, and builds the graph.

    Args:
        nodes_path:  Absolute Path to nodes.json  (comes from config.settings)
        edges_path:  Absolute Path to edges.json
        routes_path: Absolute Path to routes.json

    Returns:
        (nodes_dict, edges_list, routes_dict, graph_dict)

    Fix applied: config.py already constructs absolute Paths, so loader
    must open them directly. The previous version prepended parent.parent.parent
    which silently broke when an absolute path was passed.
    """
    # nodes
    with open(nodes_path, "r", encoding="utf-8") as f:
        nodes_raw  = json.load(f).get("nodes", [])
    nodes_dict = {n["id"]: n for n in nodes_raw}

    # edges
    with open(edges_path, "r", encoding="utf-8") as f:
        edges_list = json.load(f).get("edges", [])

    # routes (optional — soft fail if file missing)
    try:
        with open(routes_path, "r", encoding="utf-8") as f:
            routes_raw  = json.load(f).get("routes", [])
        routes_dict = {r["route_id"]: r for r in routes_raw}
    except FileNotFoundError:
        routes_dict = {}

    # build adjacency graph
    graph_dict = build_graph(edges_list)

    return nodes_dict, edges_list, routes_dict, graph_dict