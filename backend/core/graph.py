# backend/core/graph.py
#
# Builds the in-memory adjacency graph from the edges list.
# This is what Dijkstra runs on — built once at startup, read-only after.
#
# Graph format:
#   adjacency[from_node_id] = [
#       AdjEdge(to, time_min, cost_inr, comfort_score, edge_id, mode, route_id),
#       ...
#   ]
#
# Usage:
#   from backend.core.graph import build_graph, get_neighbors, graph_stats
#   graph = build_graph(data.edges)
#   neighbors = get_neighbors(graph, "shivajinagar")
#
# Test (run from project root):
#   python -m backend.core.graph

from __future__ import annotations
import sys
from collections import defaultdict, Counter
from dataclasses import dataclass
from typing import Optional


# ── Edge record ───────────────────────────────────────────────────────────────

@dataclass(frozen=True, slots=True)
class AdjEdge:
    """One directed edge in the adjacency list."""
    to:            str
    time_min:      int | float
    cost_inr:      int | float
    comfort_score: int
    edge_id:       str
    mode:          str            # bus | metro | train | transfer
    route_id:      Optional[str]  # None for transfer edges

    def __repr__(self) -> str:
        return (
            f"AdjEdge({self.to!r}, "
            f"{self.time_min}min, "
            f"₹{self.cost_inr}, "
            f"comfort={self.comfort_score}, "
            f"mode={self.mode!r})"
        )


# ── Modes that run in both directions on the same physical track ──────────────
# Transfer edges already have both directions explicitly in edges.json,
# so we don't auto-reverse them.

_BIDIRECTIONAL_MODES = {"metro", "bus", "train"}


# ── Builder ───────────────────────────────────────────────────────────────────

def build_graph(
    edges: list[dict],
    skip_unavailable: bool = True,
) -> dict[str, list[AdjEdge]]:
    """
    Convert the flat edges list into an adjacency dict.

    Rules:
    - metro / bus / train edges → added in both directions (same cost each way)
    - transfer edges           → added exactly as written (already bidirectional in data)
    - unavailable edges        → skipped when skip_unavailable=True

    Args:
        edges:             List of edge dicts from edges.json.
        skip_unavailable:  Drop edges where available == False.

    Returns:
        dict mapping node_id → list[AdjEdge]
    """
    graph: dict[str, list[AdjEdge]] = defaultdict(list)
    seen_edge_ids: set[str] = set()

    for raw in edges:
        # ── Skip unavailable ──────────────────────────────────────────────────
        if skip_unavailable and not raw.get("available", True):
            continue

        # ── Duplicate edge_id guard ───────────────────────────────────────────
        eid = raw["edge_id"]
        if eid in seen_edge_ids:
            raise ValueError(
                f"Duplicate edge_id '{eid}' in edges.json. "
                f"Each edge must have a unique id."
            )
        seen_edge_ids.add(eid)

        frm       = raw["from"]
        to        = raw["to"]
        time_min  = raw["time_min"]
        cost_inr  = raw["cost_inr"]
        comfort   = raw["comfort_score"]
        mode      = raw["mode"]
        route_id  = raw.get("route_id")        # None for transfers

        # ── Forward edge ──────────────────────────────────────────────────────
        forward = AdjEdge(
            to=to, time_min=time_min, cost_inr=cost_inr,
            comfort_score=comfort, edge_id=eid,
            mode=mode, route_id=route_id,
        )
        graph[frm].append(forward)

        # ── Reverse edge (transit modes only) ─────────────────────────────────
        # Transfer edges already have explicit reverse entries in edges.json
        # (TRF_001 and TRF_002 are PCMC bus→metro and PCMC metro→bus).
        # We only auto-reverse transit modes where the reverse wasn't hand-coded.
        if mode in _BIDIRECTIONAL_MODES:
            reverse = AdjEdge(
                to=frm, time_min=time_min, cost_inr=cost_inr,
                comfort_score=comfort, edge_id=eid + "_REV",
                mode=mode, route_id=route_id,
            )
            graph[to].append(reverse)

    return dict(graph)   # convert defaultdict → plain dict before returning


# ── Accessor helpers ──────────────────────────────────────────────────────────

def get_neighbors(graph: dict[str, list[AdjEdge]], node_id: str) -> list[AdjEdge]:
    """
    Return all outgoing edges from node_id.
    Returns empty list (not KeyError) if node has no outgoing edges.
    """
    return graph.get(node_id, [])


def node_degree(graph: dict[str, list[AdjEdge]], node_id: str) -> int:
    """Number of outgoing edges from a node."""
    return len(get_neighbors(graph, node_id))


def all_reachable(
    graph: dict[str, list[AdjEdge]],
    start: str,
) -> set[str]:
    """
    BFS from start — returns every node reachable from it.
    Useful to verify graph connectivity before running Dijkstra.
    """
    visited: set[str] = set()
    queue = [start]
    while queue:
        node = queue.pop()
        if node in visited:
            continue
        visited.add(node)
        for edge in graph.get(node, []):
            if edge.to not in visited:
                queue.append(edge.to)
    return visited


def nodes_in_graph(graph: dict[str, list[AdjEdge]]) -> set[str]:
    """All node ids that appear as a source of at least one edge."""
    return set(graph.keys())


# ── Stats / diagnostics ───────────────────────────────────────────────────────

def graph_stats(
    graph: dict[str, list[AdjEdge]],
    nodes: dict[str, dict] | None = None,
) -> dict:
    """
    Return a summary dict useful for the /health endpoint and debugging.

    Args:
        graph:  The adjacency dict from build_graph().
        nodes:  Optional nodes index — used to report isolated nodes.
    """
    all_edges = [e for edges in graph.values() for e in edges]
    mode_counts = Counter(e.mode for e in all_edges)

    # Nodes that appear in graph but have no outgoing edges
    # (these are sink nodes — terminal stops, which is fine)
    all_destinations = {e.to for edges in graph.values() for e in edges}
    all_sources = set(graph.keys())
    sink_nodes  = all_destinations - all_sources

    # Nodes in nodes.json that never appear in the graph at all (truly isolated)
    isolated: list[str] = []
    if nodes:
        graph_nodes = all_sources | all_destinations
        isolated = [nid for nid in nodes if nid not in graph_nodes]

    return {
        "total_nodes_in_graph": len(all_sources | all_destinations),
        "total_directed_edges": len(all_edges),
        "edges_by_mode":        dict(mode_counts),
        "sink_nodes":           sorted(sink_nodes),        # terminal stops
        "isolated_nodes":       isolated,                  # never appear in graph
        "avg_degree":           round(len(all_edges) / max(len(all_sources), 1), 1),
    }


# ── Quick self-test ───────────────────────────────────────────────────────────

if __name__ == "__main__":
    import json
    from pathlib import Path

    _ROOT = Path(__file__).parent.parent.parent
    _DATA = _ROOT / "data"

    print("Loading edges.json and nodes.json...")
    with open(_DATA / "edges.json") as f:
        edges_raw = json.load(f)["edges"]
    with open(_DATA / "nodes.json") as f:
        nodes_raw = {n["id"]: n for n in json.load(f)["nodes"]}

    print(f"Raw edges loaded: {len(edges_raw)}")

    graph = build_graph(edges_raw)
    print(f"Graph built:      {len(graph)} source nodes\n")

    # ── Stats ──────────────────────────────────────────────────────────────────
    stats = graph_stats(graph, nodes_raw)
    print("── Graph stats ──")
    print(f"  Total nodes in graph : {stats['total_nodes_in_graph']}")
    print(f"  Total directed edges : {stats['total_directed_edges']}")
    print(f"  Avg degree           : {stats['avg_degree']}")
    print(f"  Edges by mode:")
    for mode, count in sorted(stats["edges_by_mode"].items()):
        print(f"    {mode:<12} {count}")
    if stats["isolated_nodes"]:
        print(f"\n  ⚠ Isolated nodes (in nodes.json but never in any edge):")
        for nid in stats["isolated_nodes"]:
            print(f"    {nid}")
    else:
        print(f"\n  ✓ No isolated nodes")

    # ── Neighbor spot-checks ──────────────────────────────────────────────────
    print("\n── Neighbor checks ──")
    checks = [
        ("shivajinagar", 4),   # bus + metro + train transfers → many neighbors
        ("metro_civil_court_p", 2),  # Purple line: both directions + transfer to Aqua
        ("katraj", 1),               # terminus — only inbound reversed edges
    ]
    all_ok = True
    for node_id, min_expected in checks:
        neighbors = get_neighbors(graph, node_id)
        ok = len(neighbors) >= min_expected
        if not ok: all_ok = False
        status = "✓" if ok else "✗"
        print(f"  {status} {node_id:<30} {len(neighbors)} neighbors (expected ≥{min_expected})")
        for n in neighbors[:3]:
            print(f"      → {n.to:<30} {n.time_min}min  ₹{n.cost_inr}  [{n.mode}]")
        if len(neighbors) > 3:
            print(f"      … and {len(neighbors)-3} more")

    # ── Reachability check ────────────────────────────────────────────────────
    print("\n── Reachability from shivajinagar ──")
    reachable = all_reachable(graph, "shivajinagar")
    # metro_ramwadi and akurdi need the full edges.json to be reachable.
    key_destinations = [
        "swargate", "pune_station", "hinjawadi",
        "hadapsar", "metro_swargate", "train_pune_jn",
    ]
    for dest in key_destinations:
        ok = dest in reachable
        if not ok: all_ok = False
        print(f"  {'✓' if ok else '✗'} {'shivajinagar → ' + dest:<45} {'reachable' if ok else 'NOT REACHABLE'}")

    print(f"\n{len(reachable)} total nodes reachable from shivajinagar")
    print(f"\n{'✓ All graph tests passed.' if all_ok else '✗ Some tests failed — check output above.'}")
