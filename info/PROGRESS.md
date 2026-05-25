# Progress Log

## Iteration 0 — Initial scaffold

- [x] Project structure (backend + frontend skeleton)
- [x] FastAPI backend with `/api/health` and `/api/games` endpoints
- [x] Frontend dashboard with game card grid
- [x] Git repo initialized

## Run 2 — 2026-05-25: Snake Game

- [x] Snake game (HTML5 Canvas, arrow keys, wall wrapping, scoring, local high score)
- [x] Game-specific CSS (`frontend/css/game.css`)
- [x] Backend `/games/{game_id}` route for serving game pages
- [x] Updated game list API — `snake` promoted to `playable` status
- [x] Dashboard shows playable badge (green) + navigates to games
- [x] Delegation research: AOrchestra 4-tuple pattern documented

### Next up
- [ ] Implement Tic-Tac-Toe game (vs AI, minimax algorithm)
- [ ] SQLite database setup (users, scores, sessions)
- [ ] User registration/login
- [ ] High score submission + leaderboard
- [ ] Game categories/tags
- [ ] Dark theme with per-game styling
