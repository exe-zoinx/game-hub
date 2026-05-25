# Game Hub

A web application for managing and playing multiple browser games.

## Vision

Game Hub is a self-evolving project — built incrementally by an AI agent that
continuously learns and optimizes its delegation patterns. Each iteration adds
features, refines architecture, and improves the agent's ability to coordinate
complex multi-file, multi-service builds.

## Features (in progress)

- Game dashboard/launcher
- Multiple browser games (Snake, Tetris, Memory, Tic-Tac-Toe, more)
- User profiles & high scores
- Game categories & search
- Stats & achievements
- Leaderboards

## Stack

- **Backend**: Python (FastAPI)
- **Frontend**: Vanilla HTML/CSS/JS (lightweight, zero framework)
- **Database**: SQLite (via SQLAlchemy)
- **Auth**: Session-based (simple, no OAuth overhead)

## Project Structure

```
game-hub/
├── backend/       # FastAPI server
├── frontend/      # Web UI
├── games/         # Game definitions & assets
└── info/          # Agent learnings & delegation research
```
