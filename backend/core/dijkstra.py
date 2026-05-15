import sys
from pathlib import Path

_ROOT = Path(__file__).parent.parent.parent
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))

import heapq
from typing import Optional, Any, Callable
from backend.core.graph import AdjEdge


# ── Weight functions ──────────────────────────────────────────────────────────
# Each takes one AdjEdge and returns a float.
# Lower = better. Dijkstra minimises this value.

def weight_time(edge: AdjEdge) -> float:
    """Minimise travel time. Used for 'fastest' preference."""
    return float(edge.time_min)


def weight_cost(edge: AdjEdge) -> float:
    """Minimise fare. Used for 'cheapest' preference."""
    return float(edge.cost_inr)


def weight_comfort(edge: AdjEdge) -> float:
    """
    Minimise discomfort. Used for 'comfiest' preference.

    comfort_score in data is 1-10 where 10 = most comfortable (metro AC).
    Dijkstra minimises, so we invert: discomfort = 10 - comfort_score.
    A metro edge (comfort=9) → discomfort=1 (preferred).
    A bus edge  (comfort=5) → discomfort=5 (penalised).
    Transfer edges (comfort=8) → discomfort=2 (cheap to cross).
    """
    return float(10 - edge.comfort_score)


# ── Core Dijkstra ─────────────────────────────────────────────────────────────

def find_path(
    graph: dict[str, list[AdjEdge]],
    start: str,
    end: str,
    weight_func: Optional[Callable[[AdjEdge], float]] = None,
) -> Optional[dict[str, Any]]:
    """
    Find the lowest-weight path from start to end using Dijkstra's algorithm.

    Args:
        graph:       Adjacency list from build_graph().
        start:       Source node ID.
        end:         Destination node ID.
        weight_func: Edge cost function. Defaults to weight_time.

    Returns:
        Dict with keys: start, end, edges, total_time_min, total_cost_inr,
        total_weight, avg_comfort  — or None if no path exists.
    """
    # Guard: start node must exist in graph (have outgoing edges)
    if start not in graph and start != end:
        return None

    if weight_func is None:
        weight_func = weight_time

    # distances[node] = best total weight found so far to reach node
    distances: dict[str, float] = {start: 0.0}

    # parents[node] = (previous_node, edge_used_to_get_here)
    # Used to reconstruct the path once we reach end
    parents: dict[str, tuple[str, Optional[AdjEdge]]] = {start: (start, None)}

    # Min-heap: (accumulated_weight, node_id)
    pq: list[tuple[float, str]] = [(0.0, start)]

    while pq:
        current_dist, current_node = heapq.heappop(pq)

        # We reached the destination — stop immediately
        if current_node == end:
            break

        # Stale entry in the heap (we already found a better path to this node)
        if current_dist > distances.get(current_node, float("inf")):
            continue

        # Relax all outgoing edges from current_node
        for edge in graph.get(current_node, []):
            edge_weight = weight_func(edge)
            new_dist    = current_dist + edge_weight

            if new_dist < distances.get(edge.to, float("inf")):
                distances[edge.to] = new_dist
                parents[edge.to]   = (current_node, edge)
                heapq.heappush(pq, (new_dist, edge.to))

    # end was never reached
    if end not in parents:
        return None

    # ── Reconstruct path by walking parents backwards ─────────────────────────
    path_edges: list[AdjEdge] = []
    curr = end
    while curr != start:
        prev, edge = parents[curr]
        if edge is not None:
            path_edges.append(edge)
        curr = prev
    path_edges.reverse()

    # ── Aggregate stats ───────────────────────────────────────────────────────
    total_time    = sum(e.time_min      for e in path_edges)
    total_cost    = sum(e.cost_inr      for e in path_edges)
    avg_comfort   = (
        round(sum(e.comfort_score for e in path_edges) / len(path_edges), 1)
        if path_edges else 0.0
    )

    return {
        "start":          start,
        "end":            end,
        "edges":          path_edges,
        "total_time_min": total_time,
        "total_cost_inr": total_cost,
        "total_weight":   distances[end],
        "avg_comfort":    avg_comfort,
    }


# ── Self-test ─────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import json
    from backend.core.graph import build_graph

    _DATA = _ROOT / "data"

    try:
        with open(_DATA / "edges.json") as f:
            edges_raw = json.load(f)["edges"]
        graph = build_graph(edges_raw)
    except FileNotFoundError:
        print("edges.json not found — run from project root.")
        sys.exit(1)

    tests = [
        ("shivajinagar", "swargate",  weight_time,    "fastest"),
        ("shivajinagar", "swargate",  weight_cost,    "cheapest"),
        ("shivajinagar", "swargate",  weight_comfort, "comfiest"),
        ("hinjawadi",    "swargate",  weight_time,    "fastest"),
    ]

    all_ok = True
    for start, end, wf, label in tests:
        res = find_path(graph, start, end, wf)
        if res:
            modes = " → ".join(e.mode for e in res["edges"])
            print(
                f"  ✓ [{label}] {start} → {end}: "
                f"{res['total_time_min']}min  "
                f"₹{res['total_cost_inr']}  "
                f"comfort={res['avg_comfort']}  "
                f"path: {modes}"
            )
        else:
            print(f"  ✗ [{label}] {start} → {end}: NO PATH FOUND")
            all_ok = False

    print(f"\n{'✓ All Dijkstra tests passed.' if all_ok else '✗ Some tests failed.'}")