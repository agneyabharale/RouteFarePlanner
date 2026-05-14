from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from data.loader import load_all
from routers import health, route, fare, stops


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Runs once at startup — loads all JSON data into app.state.
    Everything after 'yield' runs on shutdown (nothing to clean up here).
    """
    nodes, edges, routes, graph = load_all(
        nodes_path  = settings.NODES_PATH,
        edges_path  = settings.EDGES_PATH,
        routes_path = settings.ROUTES_PATH,
    )
    app.state.nodes  = nodes   # dict[id → node dict]
    app.state.edges  = edges   # raw list — used by health check
    app.state.routes = routes  # dict[route_id → route dict]
    app.state.graph  = graph   # adjacency list — used by Dijkstra

    print(f"Graph loaded: {len(nodes)} nodes, {len(edges)} edges")
    yield


app = FastAPI(
    title    = settings.API_TITLE,
    version  = settings.API_VERSION,
    lifespan = lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins     = settings.CORS_ORIGINS,
    allow_methods     = ["*"],
    allow_headers     = ["*"],
    allow_credentials = True,
)

app.include_router(health.router)
app.include_router(route.router)
app.include_router(fare.router)
app.include_router(stops.router)

if __name__ == "__main__":
    # This allows you to run 'python main.py' directly
    uvicorn.run(
        "main:app", 
        host="0.0.0.0", 
        port=8000, 
        reload=True  # Set to False in production
    )