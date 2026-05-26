// Tetris — Game Hub
// Full implementation: SRS rotation, line clearing, scoring, next-piece preview

const COLS = 10, ROWS = 20, BLOCK = 28;
const COLORS = {
    I: '#00f0f0', O: '#f0f000', T: '#a000f0',
    S: '#00f000', Z: '#f00000', J: '#0000f0', L: '#f0a000'
};

// SRS rotation states [shape][rotation]
const SHAPES = {
    I: [
        [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],
        [[0,0,1,0],[0,0,1,0],[0,0,1,0],[0,0,1,0]],
        [[0,0,0,0],[0,0,0,0],[1,1,1,1],[0,0,0,0]],
        [[0,1,0,0],[0,1,0,0],[0,1,0,0],[0,1,0,0]]
    ],
    O: [
        [[1,1],[1,1]],
        [[1,1],[1,1]],
        [[1,1],[1,1]],
        [[1,1],[1,1]]
    ],
    T: [
        [[0,1,0],[1,1,1],[0,0,0]],
        [[0,1,0],[0,1,1],[0,1,0]],
        [[0,0,0],[1,1,1],[0,1,0]],
        [[0,1,0],[1,1,0],[0,1,0]]
    ],
    S: [
        [[0,1,1],[1,1,0],[0,0,0]],
        [[0,1,0],[0,1,1],[0,0,1]],
        [[0,0,0],[0,1,1],[1,1,0]],
        [[1,0,0],[1,1,0],[0,1,0]]
    ],
    Z: [
        [[1,1,0],[0,1,1],[0,0,0]],
        [[0,0,1],[0,1,1],[0,1,0]],
        [[0,0,0],[1,1,0],[0,1,1]],
        [[0,1,0],[1,1,0],[1,0,0]]
    ],
    J: [
        [[1,0,0],[1,1,1],[0,0,0]],
        [[0,1,1],[0,1,0],[0,1,0]],
        [[0,0,0],[1,1,1],[0,0,1]],
        [[0,1,0],[0,1,0],[1,1,0]]
    ],
    L: [
        [[0,0,1],[1,1,1],[0,0,0]],
        [[0,1,0],[0,1,0],[0,1,1]],
        [[0,0,0],[1,1,1],[1,0,0]],
        [[1,1,0],[0,1,0],[0,1,0]]
    ]
};

const PIECE_TYPES = ['I','O','T','S','Z','J','L'];

// SRS wall kick data
const WALL_KICKS = {
    'normal': {
        '0>1': [[0,0],[-1,0],[-1,1],[0,-2],[-1,-2]],
        '1>0': [[0,0],[1,0],[1,-1],[0,2],[1,2]],
        '1>2': [[0,0],[1,0],[1,-1],[0,2],[1,2]],
        '2>1': [[0,0],[-1,0],[-1,1],[0,-2],[-1,-2]],
        '2>3': [[0,0],[1,0],[1,1],[0,-2],[1,-2]],
        '3>2': [[0,0],[-1,0],[-1,-1],[0,2],[-1,2]],
        '3>0': [[0,0],[-1,0],[-1,-1],[0,2],[-1,2]],
        '0>3': [[0,0],[1,0],[1,1],[0,-2],[1,-2]]
    },
    'I': {
        '0>1': [[0,0],[-2,0],[1,0],[-2,-1],[1,2]],
        '1>0': [[0,0],[2,0],[-1,0],[2,1],[-1,-2]],
        '1>2': [[0,0],[-1,0],[2,0],[-1,2],[2,-1]],
        '2>1': [[0,0],[1,0],[-2,0],[1,-2],[-2,1]],
        '2>3': [[0,0],[2,0],[-1,0],[2,1],[-1,-2]],
        '3>2': [[0,0],[-2,0],[1,0],[-2,-1],[1,2]],
        '3>0': [[0,0],[1,0],[-2,0],[1,-2],[-2,1]],
        '0>3': [[0,0],[-1,0],[2,0],[-1,2],[2,-1]]
    }
};

class Tetris {
    constructor(canvasId, nextCanvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.nextCanvas = document.getElementById(nextCanvasId);
        this.nextCtx = this.nextCanvas.getContext('2d');

        this.scoreEl = document.getElementById('tetris-score');
        this.linesEl = document.getElementById('tetris-lines');
        this.levelEl = document.getElementById('tetris-level');

        this.grid = Array.from({length: ROWS}, () => Array(COLS).fill(0));
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.gameOver = false;
        this.paused = false;
        this.running = false;

        this.bag = [];
        this.current = null;
        this.next = null;

        this.dropInterval = 1000;
        this.lastDrop = 0;
        this.animFrame = null;

        this._initControls();
    }

    _bagFill() {
        const shuffled = [...PIECE_TYPES].sort(() => Math.random() - 0.5);
        this.bag.push(...shuffled);
    }

    _getNextType() {
        if (this.bag.length <= 7) this._bagFill();
        return this.bag.shift();
    }

    _spawn(type) {
        const shape = SHAPES[type][0];
        const size = shape.length;
        return {
            type,
            shape,
            rotation: 0,
            x: Math.floor((COLS - size) / 2),
            y: 0
        };
    }

    _nextPiece() {
        const t = this._getNextType();
        return this._spawn(t);
    }

    _collides(piece, dx = 0, dy = 0) {
        const shape = piece.shape;
        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[r].length; c++) {
                if (!shape[r][c]) continue;
                const nx = piece.x + c + dx;
                const ny = piece.y + r + dy;
                if (nx < 0 || nx >= COLS || ny >= ROWS) return true;
                if (ny < 0) continue;
                if (this.grid[ny][nx]) return true;
            }
        }
        return false;
    }

    _lock() {
        const shape = this.current.shape;
        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[r].length; c++) {
                if (!shape[r][c]) continue;
                const x = this.current.x + c;
                const y = this.current.y + r;
                if (y < 0) { this._endGame(); return; }
                this.grid[y][x] = this.current.type;
            }
        }
        this._clearLines();
        this._advance();
    }

    _clearLines() {
        let cleared = 0;
        for (let y = ROWS - 1; y >= 0; y--) {
            if (this.grid[y].every(c => c !== 0)) {
                this.grid.splice(y, 1);
                this.grid.unshift(Array(COLS).fill(0));
                cleared++;
                y++; // re-check same row
            }
        }
        if (cleared > 0) {
            const points = [0, 100, 300, 500, 800];
            this.score += (points[cleared] || 800) * this.level;
            this.lines += cleared;
            this.level = Math.floor(this.lines / 10) + 1;
            this.dropInterval = Math.max(100, 1000 - (this.level - 1) * 80);
            this._updateUI();
        }
    }

    _advance() {
        this.current = this.next;
        this.next = this._nextPiece();
        if (this._collides(this.current)) {
            this._endGame();
        }
        this._renderNext();
    }

    _endGame() {
        this.gameOver = true;
        this.running = false;
        if (this.animFrame) cancelAnimationFrame(this.animFrame);
        this.animFrame = null;
        this._checkHighScore();
    }

    _checkHighScore() {
        const best = parseInt(localStorage.getItem('tetris_best') || '0');
        if (this.score > best) {
            localStorage.setItem('tetris_best', String(this.score));
        }
    }

    _updateUI() {
        const best = parseInt(localStorage.getItem('tetris_best') || '0');
        this.scoreEl.textContent = `Score: ${this.score}  |  Best: ${best}`;
        this.linesEl.textContent = `Lines: ${this.lines}`;
        this.levelEl.textContent = `Level: ${this.level}`;
    }

    _renderNext() {
        const ctx = this.nextCtx;
        const W = this.nextCanvas.width, H = this.nextCanvas.height;
        ctx.clearRect(0, 0, W, H);
        if (!this.next) return;
        const shape = SHAPES[this.next.type][0];
        const offX = (W - shape[0].length * BLOCK) / 2;
        const offY = (H - shape.length * BLOCK) / 2;
        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[r].length; c++) {
                if (!shape[r][c]) continue;
                ctx.fillStyle = COLORS[this.next.type];
                ctx.fillRect(offX + c * BLOCK + 1, offY + r * BLOCK + 1, BLOCK - 2, BLOCK - 2);
            }
        }
    }

    _drawBlock(ctx, x, y, color, alpha = 1) {
        ctx.globalAlpha = alpha;
        ctx.fillStyle = color;
        ctx.fillRect(x * BLOCK + 1, y * BLOCK + 1, BLOCK - 2, BLOCK - 2);
        // Highlight
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.fillRect(x * BLOCK + 1, y * BLOCK + 1, BLOCK - 2, 3);
        ctx.globalAlpha = 1;
    }

    _draw() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Grid lines (subtle)
        ctx.strokeStyle = 'rgba(255,255,255,0.03)';
        ctx.lineWidth = 0.5;
        for (let x = 0; x <= COLS; x++) {
            ctx.beginPath(); ctx.moveTo(x * BLOCK, 0); ctx.lineTo(x * BLOCK, ROWS * BLOCK); ctx.stroke();
        }
        for (let y = 0; y <= ROWS; y++) {
            ctx.beginPath(); ctx.moveTo(0, y * BLOCK); ctx.lineTo(COLS * BLOCK, y * BLOCK); ctx.stroke();
        }

        // Locked pieces
        for (let y = 0; y < ROWS; y++) {
            for (let x = 0; x < COLS; x++) {
                if (this.grid[y][x]) {
                    this._drawBlock(ctx, x, y, COLORS[this.grid[y][x]]);
                }
            }
        }

        // Ghost piece (shadow)
        if (this.current && !this.gameOver) {
            let dy = 0;
            while (!this._collides(this.current, 0, dy + 1)) dy++;
            const shape = this.current.shape;
            for (let r = 0; r < shape.length; r++) {
                for (let c = 0; c < shape[r].length; c++) {
                    if (!shape[r][c]) continue;
                    this._drawBlock(ctx, this.current.x + c, this.current.y + r + dy, '#ffffff', 0.12);
                }
            }

            // Current piece
            for (let r = 0; r < shape.length; r++) {
                for (let c = 0; c < shape[r].length; c++) {
                    if (!shape[r][c]) continue;
                    this._drawBlock(ctx, this.current.x + c, this.current.y + r, COLORS[this.current.type]);
                }
            }
        }

        // Overlay
        if (this.gameOver) {
            ctx.fillStyle = 'rgba(0,0,0,0.6)';
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            ctx.fillStyle = '#f44';
            ctx.font = 'bold 32px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2);
        } else if (this.paused) {
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 28px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
        }

        this._updateUI();
    }

    _rotate(dir = 1) {
        if (!this.current || this.gameOver || this.paused) return;
        const type = this.current.type;
        if (type === 'O') return; // O doesn't rotate
        const oldRot = this.current.rotation;
        const newRot = (oldRot + dir + 4) % 4;
        const newShape = SHAPES[type][newRot];
        const kickTable = type === 'I' ? WALL_KICKS['I'] : WALL_KICKS['normal'];
        const key = `${oldRot}>${newRot}`;
        const kicks = kickTable[key] || [[0,0]];

        for (const [kx, ky] of kicks) {
            const test = { ...this.current, shape: newShape, rotation: newRot, x: this.current.x + kx, y: this.current.y - ky };
            if (!this._collides(test)) {
                this.current.shape = newShape;
                this.current.rotation = newRot;
                this.current.x += kx;
                this.current.y -= ky;
                return;
            }
        }
    }

    _move(dx, dy) {
        if (!this.current || this.gameOver || this.paused) return;
        if (!this._collides(this.current, dx, dy)) {
            this.current.x += dx;
            this.current.y += dy;
            return true;
        }
        if (dy === 1) { // moving down and collided → lock
            this._lock();
        }
        return false;
    }

    _hardDrop() {
        if (!this.current || this.gameOver || this.paused) return;
        let dropped = 0;
        while (!this._collides(this.current, 0, dropped + 1)) dropped++;
        this.score += dropped * 2;
        this.current.y += dropped;
        this._lock();
    }

    _tick(now) {
        if (!this.running || this.gameOver || this.paused) {
            this._draw();
            this.animFrame = requestAnimationFrame(t => this._tick(t));
            return;
        }
        if (now - this.lastDrop >= this.dropInterval) {
            this._move(0, 1);
            this.lastDrop = now;
        }
        this._draw();
        this.animFrame = requestAnimationFrame(t => this._tick(t));
    }

    start() {
        if (this.running && !this.paused) {
            this.paused = true;
            document.getElementById('tetris-start-btn').textContent = '▶ Resume';
            return;
        }
        if (this.paused) {
            this.paused = false;
            this.lastDrop = performance.now();
            document.getElementById('tetris-start-btn').textContent = '⏸ Pause';
            return;
        }
        // Fresh start
        this.grid = Array.from({length: ROWS}, () => Array(COLS).fill(0));
        this.score = 0; this.lines = 0; this.level = 1;
        this.dropInterval = 1000;
        this.gameOver = false; this.paused = false;
        this.bag = [];
        this.current = this._nextPiece();
        this.next = this._nextPiece();
        this.running = true;
        this.lastDrop = performance.now();
        document.getElementById('tetris-start-btn').textContent = '⏸ Pause';
        if (this.animFrame) cancelAnimationFrame(this.animFrame);
        this.animFrame = requestAnimationFrame(t => this._tick(t));
    }

    _initControls() {
        document.addEventListener('keydown', e => {
            if (!this.running) return;
            switch (e.key) {
                case 'ArrowLeft':  e.preventDefault(); this._move(-1, 0); break;
                case 'ArrowRight': e.preventDefault(); this._move(1, 0); break;
                case 'ArrowDown':  e.preventDefault(); this._move(0, 1); break;
                case 'ArrowUp':    e.preventDefault(); this._rotate(1); break;
                case 'z': case 'Z': e.preventDefault(); this._rotate(-1); break;
                case ' ':          e.preventDefault(); this._hardDrop(); break;
                case 'p': case 'P': e.preventDefault(); this.start(); break;
            }
        });
    }
}

// Init
document.addEventListener('DOMContentLoaded', () => {
    const game = new Tetris('tetris-canvas', 'tetris-next-canvas');
    window._tetris = game;
    document.getElementById('tetris-start-btn').addEventListener('click', () => game.start());
});
