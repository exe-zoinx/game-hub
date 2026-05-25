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


@app.get("/api/health")
def health():
    return {"status": "ok", "version": "0.1.0"}


@app.get("/api/games")
def list_games():
    """Return available games."""
    return {
        "games": [
            {"id": "snake", "name": "Snake", "description": "Classic snake game", "status": "planned"},
            {"id": "tetris", "name": "Tetris", "description": "Block stacking puzzle", "status": "planned"},
            {"id": "memory", "name": "Memory", "description": "Card matching game", "status": "planned"},
            {"id": "tictactoe", "name": "Tic-Tac-Toe", "description": "Classic 3-in-a-row", "status": "planned"},
        ]
    }
