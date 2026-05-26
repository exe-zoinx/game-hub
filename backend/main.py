"""Game Hub — FastAPI backend."""

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Game Hub", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="../frontend"), name="static")


from fastapi.responses import FileResponse
from pathlib import Path

FRONTEND = Path(__file__).resolve().parent.parent / "frontend"


@app.get("/api/health")
def health():
    return {"status": "ok", "version": "0.1.0"}


@app.get("/api/games")
def list_games():
    """Return available games."""
    return {
        "games": [
            {"id": "snake", "name": "Snake", "description": "Classic snake game — eat food, grow, don't crash", "status": "playable", "url": "/games/snake"},
            {"id": "tetris", "name": "Tetris", "description": "Block stacking puzzle — clear lines, set high scores", "status": "playable", "url": "/games/tetris"},
            {"id": "memory", "name": "Memory", "description": "Card matching game", "status": "planned"},
            {"id": "tictactoe", "name": "Tic-Tac-Toe", "description": "Classic 3-in-a-row", "status": "planned"},
        ]
    }


@app.get("/games/{game_id}")
def serve_game(game_id: str):
    """Serve a game HTML page."""
    game_file = FRONTEND / "games" / f"{game_id}.html"
    if not game_file.exists():
        return {"error": "Game not found"}, 404
    return FileResponse(str(game_file))
