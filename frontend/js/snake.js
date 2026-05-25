// Snake — Classic Snake Game
class SnakeGame {
    constructor(canvasId, scoreEl) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.scoreEl = scoreEl;

        this.gridSize = 20;
        this.tileCount = this.canvas.width / this.gridSize;

        this.reset();
        this.bindKeys();
    }

    reset() {
        this.snake = [
            {x: 10, y: 10},
            {x: 9, y: 10},
            {x: 8, y: 10}
        ];
        this.direction = {x: 1, y: 0};
        this.nextDirection = {x: 1, y: 0};
        this.food = this.spawnFood();
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('snake-high') || '0');
        this.running = false;
        this.gameOver = false;
        this.won = false;
    }

    spawnFood() {
        const free = [];
        for (let x = 0; x < this.tileCount; x++) {
            for (let y = 0; y < this.tileCount; y++) {
                if (!this.snake.some(s => s.x === x && s.y === y)) {
                    free.push({x, y});
                }
            }
        }
        if (free.length === 0) return null;
        return free[Math.floor(Math.random() * free.length)];
    }

    bindKeys() {
        document.addEventListener('keydown', (e) => {
            if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) {
                e.preventDefault();
            }
            if (e.key === ' ') { this.toggle(); return; }
            // Prevent 180° reversal
            const dirs = {
                ArrowUp:    {x: 0, y: -1},
                ArrowDown:  {x: 0, y: 1},
                ArrowLeft:  {x: -1, y: 0},
                ArrowRight: {x: 1, y: 0}
            };
            const nd = dirs[e.key];
            if (nd && (nd.x !== -this.direction.x || nd.y !== -this.direction.y)) {
                this.nextDirection = nd;
            }
        });
    }

    toggle() {
        if (this.gameOver) { this.reset(); }
        this.running = !this.running;
        if (this.running) this.step();
    }

    step() {
        if (!this.running) return;
        this.direction = this.nextDirection;

        const head = {
            x: this.snake[0].x + this.direction.x,
            y: this.snake[0].y + this.direction.y
        };

        // Wall wrapping
        if (head.x < 0) head.x = this.tileCount - 1;
        if (head.x >= this.tileCount) head.x = 0;
        if (head.y < 0) head.y = this.tileCount - 1;
        if (head.y >= this.tileCount) head.y = 0;

        // Self collision
        if (this.snake.some(s => s.x === head.x && s.y === head.y)) {
            this.running = false;
            this.gameOver = true;
            this.draw();
            return;
        }

        this.snake.unshift(head);

        // Eat food
        if (this.food && head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.food = this.spawnFood();
            if (!this.food) {
                this.running = false;
                this.won = true;
            }
        } else {
            this.snake.pop();
        }

        // Update high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('snake-high', String(this.highScore));
        }

        this.draw();
        setTimeout(() => this.step(), 100);
    }

    draw() {
        const ctx = this.ctx;
        const gs = this.gridSize;

        // Background
        ctx.fillStyle = '#111';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Grid lines
        ctx.strokeStyle = '#1a1a2e';
        ctx.lineWidth = 0.5;
        for (let i = 0; i <= this.tileCount; i++) {
            ctx.beginPath(); ctx.moveTo(i*gs, 0); ctx.lineTo(i*gs, this.canvas.height); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(0, i*gs); ctx.lineTo(this.canvas.width, i*gs); ctx.stroke();
        }

        // Snake body
        this.snake.forEach((seg, i) => {
            const t = i / this.snake.length;
            const r = Math.round(60 + t * 60);
            const g = Math.round(180 + t * 40);
            const b = Math.round(100 - t * 30);
            ctx.fillStyle = `rgb(${r},${g},${b})`;
            ctx.fillRect(seg.x * gs + 1, seg.y * gs + 1, gs - 2, gs - 2);
            if (i === 0) {
                // Eyes
                ctx.fillStyle = '#fff';
                ctx.fillRect(seg.x * gs + 5, seg.y * gs + 5, 3, 3);
                ctx.fillRect(seg.x * gs + 12, seg.y * gs + 5, 3, 3);
            }
        });

        // Food
        if (this.food) {
            ctx.fillStyle = '#ff4466';
            ctx.beginPath();
            ctx.arc(this.food.x * gs + gs/2, this.food.y * gs + gs/2, gs/2 - 2, 0, Math.PI * 2);
            ctx.fill();
            // Shine
            ctx.fillStyle = 'rgba(255,255,255,0.3)';
            ctx.beginPath();
            ctx.arc(this.food.x * gs + gs/2 - 3, this.food.y * gs + gs/2 - 3, 3, 0, Math.PI * 2);
            ctx.fill();
        }

        this.scoreEl.textContent = `Score: ${this.score}  |  Best: ${this.highScore}`;

        if (this.gameOver) {
            ctx.fillStyle = 'rgba(0,0,0,0.7)';
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            ctx.fillStyle = '#ff4466';
            ctx.font = 'bold 36px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('GAME OVER', this.canvas.width/2, this.canvas.height/2 - 10);
            ctx.fillStyle = '#aaa';
            ctx.font = '18px sans-serif';
            ctx.fillText(`Score: ${this.score}  ·  Press SPACE to restart`, this.canvas.width/2, this.canvas.height/2 + 30);
        }

        if (this.won) {
            ctx.fillStyle = 'rgba(0,0,0,0.7)';
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            ctx.fillStyle = '#44ff88';
            ctx.font = 'bold 36px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('YOU WIN!', this.canvas.width/2, this.canvas.height/2 - 10);
            ctx.fillStyle = '#aaa';
            ctx.font = '18px sans-serif';
            ctx.fillText('Board cleared! Press SPACE to play again', this.canvas.width/2, this.canvas.height/2 + 30);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const game = new SnakeGame('snake-canvas', document.getElementById('snake-score'));
    // Draw initial state
    game.draw();
});
