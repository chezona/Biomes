// Session Game Initialization
// This file launches the 5-minute session game

import { initSessionUI } from './simple-ui.js';

// Check if we should launch session game (default) or original game
function initGame() {
    // Check URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    
    // Default to session game unless explicitly requesting original
    if (mode === 'original') {
        // Show original game, hide session container
        document.getElementById('session-game-container').style.display = 'none';
        // Original game will load via main.js
    } else {
        // Launch session game
        launchSessionGame();
    }
}

function launchSessionGame() {
    // Hide the loading spinner
    const loadingDiv = document.querySelector('.loading');
    if (loadingDiv) {
        loadingDiv.style.display = 'none';
    }
    
    // Show session game container
    const container = document.getElementById('session-game-container');
    if (container) {
        container.style.display = 'block';
        initSessionUI();
    } else {
        console.error('Session game container not found');
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGame);
} else {
    initGame();
}

export { initGame, launchSessionGame };

