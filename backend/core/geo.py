# backend/core/geo.py
#
# Pure geometry utilities — no FastAPI, no JSON, no graph logic.
# All functions take plain floats and dicts, return plain floats and dicts.
#
# Usage:
#   from backend.core.geo import haversine_km, nearest_node, walking_time_min
#
# Test (run from project root):
#   python -m backend.core.geo

from __future__ import annotations
import math
from typing import Optional


# ── Constants ─────────────────────────────────────────────────────────────────

_EARTH_RADIUS_KM  = 6371.0
_WALKING_SPEED_KMH = 5.0    # avg pedestrian speed
_MAX_SNAP_KM       = 2.0    # refuse nearest-node snap if farther than this


# ── Core distance formula ─────────────────────────────────────────────────────

def haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """
    Great-circle distance between two (lat, lng) points in kilometres.
    Accurate to within ~0.5% for city-scale distances.

    >>> round(haversine_km(18.5308, 73.8474, 18.5013, 73.8618), 1)
    3.5
    """
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlam = math.radians(lng2 - lng1)

    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlam / 2) ** 2
    return _EARTH_RADIUS_KM * 2 * math.asin(math.sqrt(a))


def haversine_m(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Same as haversine_km but returns metres."""
    return haversine_km(lat1, lng1, lat2, lng2) * 1000


# ── Travel time estimates ─────────────────────────────────────────────────────

def walking_time_min(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Estimated walking time in minutes between two coordinates."""
    dist_km = haversine_km(lat1, lng1, lat2, lng2)
    return (dist_km / _WALKING_SPEED_KMH) * 60


def road_distance_km(straight_km: float, road_factor: float = 1.3) -> float:
    """
    Approximate road distance from straight-line distance.
    City road factor is typically 1.2–1.4; 1.3 is a safe default for Pune.
    """
    return straight_km * road_factor


def cab_duration_min(distance_km: float, speed_kmh: float = 25.0) -> float:
    """
    Estimated cab/auto travel time in minutes.
    Default speed 25 km/h accounts for Pune city traffic.
    """
    return (distance_km / speed_kmh) * 60


# ── Nearest node lookup ───────────────────────────────────────────────────────

def nearest_node(
    lat: float,
    lng: float,
    nodes: dict[str, dict],
    mode_filter: Optional[list[str]] = None,
    max_dist_km: float = _MAX_SNAP_KM,
) -> Optional[str]:
    """
    Find the closest graph node to a (lat, lng) coordinate.

    Args:
        lat, lng:     Query coordinates.
        nodes:        The nodes index from GraphData (id → node dict).
        mode_filter:  If provided, only consider nodes that serve these modes.
                      e.g. ["bus", "metro"] skips train-only nodes.
                      Interchange nodes are always included regardless.
        max_dist_km:  Return None if the closest node is farther than this.

    Returns:
        node_id string, or None if nothing found within max_dist_km.

    >>> # Shivajinagar metro should be very close to its own coords
    >>> nodes = {"metro_shivajinagar": {"lat": 18.5308, "lng": 73.8474, "type": "metro_station", "interchange": False}}
    >>> nearest_node(18.531, 73.847, nodes)
    'metro_shivajinagar'
    """
    best_id:   Optional[str]   = None
    best_dist: float           = float("inf")

    for node_id, node in nodes.items():
        # Mode filter — always include interchange nodes
        if mode_filter and not node.get("interchange", False):
            node_type = node.get("type", "")
            networks  = node.get("networks", [])
            line      = node.get("line", "")

            # Build a set of modes this node serves
            served: set[str] = set()
            if "bus"   in node_type or "bus"   in networks: served.add("bus")
            if "metro" in node_type or "metro" in networks or "metro" in (line or ""): served.add("metro")
            if "train" in node_type or "train" in networks or "local" in (line or ""): served.add("train")

            if not served.intersection(mode_filter):
                continue

        dist = haversine_km(lat, lng, node["lat"], node["lng"])
        if dist < best_dist:
            best_dist = dist
            best_id   = node_id

    if best_dist > max_dist_km:
        return None   # too far from any known stop

    return best_id


def nearest_nodes_ranked(
    lat: float,
    lng: float,
    nodes: dict[str, dict],
    top_n: int = 5,
    mode_filter: Optional[list[str]] = None,
) -> list[dict]:
    """
    Return the top_n closest nodes with their distances, sorted nearest-first.
    Useful for showing the user "nearby stops" in the UI.

    Returns list of dicts:
        [{"node_id": ..., "name": ..., "dist_km": ..., "walk_min": ...}, ...]
    """
    results = []
    for node_id, node in nodes.items():
        if mode_filter and not node.get("interchange", False):
            node_type = node.get("type", "")
            networks  = node.get("networks", [])
            line      = node.get("line", "")
            served: set[str] = set()
            if "bus"   in node_type or "bus"   in networks: served.add("bus")
            if "metro" in node_type or "metro" in networks or "metro" in (line or ""): served.add("metro")
            if "train" in node_type or "train" in networks or "local" in (line or ""): served.add("train")
            if not served.intersection(mode_filter):
                continue

        dist = haversine_km(lat, lng, node["lat"], node["lng"])
        results.append({
            "node_id":  node_id,
            "name":     node.get("name", node_id),
            "type":     node.get("type", "unknown"),
            "dist_km":  round(dist, 3),
            "walk_min": round(walking_time_min(lat, lng, node["lat"], node["lng"]), 1),
            "lat":      node["lat"],
            "lng":      node["lng"],
        })

    results.sort(key=lambda x: x["dist_km"])
    return results[:top_n]


# ── Bounding box ──────────────────────────────────────────────────────────────

def bounding_box(nodes: dict[str, dict]) -> dict:
    """
    Compute the lat/lng bounding box of all nodes.
    Used to set the initial Leaflet map view.

    Returns:
        {"min_lat": ..., "max_lat": ..., "min_lng": ..., "max_lng": ..., "center": [...]}
    """
    lats = [n["lat"] for n in nodes.values()]
    lngs = [n["lng"] for n in nodes.values()]
    return {
        "min_lat": min(lats),
        "max_lat": max(lats),
        "min_lng": min(lngs),
        "max_lng": max(lngs),
        "center":  [
            round((min(lats) + max(lats)) / 2, 6),
            round((min(lngs) + max(lngs)) / 2, 6),
        ],
    }


# ── Quick self-test ───────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("── haversine_km tests ──")

    pairs = [
        ("Shivajinagar → Swargate",     18.5308, 73.8474, 18.5013, 73.8618, 3.5),
        ("Hinjawadi → Shivajinagar",    18.5912, 73.7378, 18.5308, 73.8474, 13.4),
        ("PCMC → Swargate (full line)", 18.6298, 73.7997, 18.5013, 73.8618, 16.0),
        ("Vanaz → Ramwadi (Aqua)",      18.4980, 73.8071, 18.5564, 73.9101, 13.5),
    ]

    all_pass = True
    for label, lat1, lng1, lat2, lng2, expected in pairs:
        dist = haversine_km(lat1, lng1, lat2, lng2)
        # Allow ±15% tolerance — straight-line vs rail distance
        ok = abs(dist - expected) / expected < 0.15
        status = "✓" if ok else "✗"
        if not ok: all_pass = False
        print(f"  {status} {label}: {dist:.2f} km (expected ~{expected} km)")

    print(f"\n── walking_time_min ──")
    wt = walking_time_min(18.5308, 73.8474, 18.5285, 73.8742)
    print(f"  Shivajinagar → Pune Station: {wt:.1f} min walk")

    print(f"\n── road_distance_km ──")
    straight = haversine_km(18.5912, 73.7378, 18.5308, 73.8474)
    road = road_distance_km(straight)
    print(f"  Hinjawadi → Shivajinagar: {straight:.1f} km straight → {road:.1f} km road")

    print(f"\n── cab_duration_min ──")
    dur = cab_duration_min(road)
    print(f"  At 25 km/h avg: {dur:.0f} min")

    print(f"\n── nearest_node ──")
    sample_nodes = {
        "shivajinagar": {"lat": 18.5308, "lng": 73.8474, "type": "interchange",     "interchange": True,  "name": "Shivaji Nagar"},
        "pune_station":  {"lat": 18.5285, "lng": 73.8742, "type": "interchange",     "interchange": True,  "name": "Pune Station"},
        "metro_deccan":  {"lat": 18.5176, "lng": 73.8414, "type": "metro_station",   "interchange": False, "name": "Deccan Metro", "line": "aqua"},
        "swargate":      {"lat": 18.5013, "lng": 73.8618, "type": "interchange",     "interchange": True,  "name": "Swargate"},
    }
    # Query near Shivajinagar
    found = nearest_node(18.531, 73.848, sample_nodes)
    print(f"  Query (18.531, 73.848) → '{found}' (expected: shivajinagar)")

    # Query with mode filter — should skip metro-only node
    found_bus = nearest_node(18.518, 73.842, sample_nodes, mode_filter=["bus"])
    print(f"  Query near Deccan (bus only) → '{found_bus}' (interchange nodes always included)")

    print(f"\n── nearest_nodes_ranked ──")
    ranked = nearest_nodes_ranked(18.5308, 73.8474, sample_nodes, top_n=3)
    for r in ranked:
        print(f"  {r['name']:<30} {r['dist_km']:.3f} km  {r['walk_min']} min walk")

    print(f"\n── bounding_box ──")
    bb = bounding_box(sample_nodes)
    print(f"  center: {bb['center']}")
    print(f"  lat range: {bb['min_lat']} – {bb['max_lat']}")
    print(f"  lng range: {bb['min_lng']} – {bb['max_lng']}")

    print(f"\n{'✓ All geo tests passed.' if all_pass else '✗ Some tests failed — check values above.'}")
