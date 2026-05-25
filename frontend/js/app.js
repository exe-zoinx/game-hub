// Game Hub — Frontend App

async function loadGames() {
    const grid = document.getElementById('game-grid');
    try {
        const res = await fetch('/api/games');
        const data = await res.json();
        grid.innerHTML = '';
        data.games.forEach(game => {
            const card = document.createElement('div');
            card.className = 'game-card';
            if (game.status === 'playable') card.classList.add('playable');
            card.innerHTML = `
                <h3>${gameIcon(game.id)} ${game.name}</h3>
                <p>${game.description}</p>
                <span class="badge ${game.status}">${game.status}</span>
            `;
            card.addEventListener('click', () => launchGame(game));
            grid.appendChild(card);
        });
    } catch (err) {
        grid.innerHTML = `<p style="color:#f55">Failed to load games: ${err.message}</p>`;
    }
}

function gameIcon(id) {
    const icons = { snake: '🐍', tetris: '🧱', memory: '🃏', tictactoe: '❌', breakout: '🏓', minesweeper: '💣' };
    return icons[id] || '🎮';
}

function launchGame(game) {
    if (game.status === 'playable' && game.url) {
        window.location.href = game.url;
    } else {
        alert(`"${game.name}" — coming soon!`);
    }
}

document.addEventListener('DOMContentLoaded', loadGames);
