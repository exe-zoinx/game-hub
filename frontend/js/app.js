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
            card.innerHTML = `
                <h3>${game.name}</h3>
                <p>${game.description}</p>
                <span class="badge">${game.status}</span>
            `;
            card.addEventListener('click', () => launchGame(game.id));
            grid.appendChild(card);
        });
    } catch (err) {
        grid.innerHTML = `<p style="color:#f55">Failed to load games: ${err.message}</p>`;
    }
}

function launchGame(gameId) {
    alert(`Game "${gameId}" — coming soon!`);
}

document.addEventListener('DOMContentLoaded', loadGames);
