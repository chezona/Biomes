// Simple UI for 5-Minute Session Game
import { biomes, getBiome, getEcosystemHealthColor, getEcosystemHealthLabel } from './biomes-simple.js';
import { 
    startSession, 
    selectBiome, 
    canSelectBiome,
    updateSession,
    getNextChoice,
    makeChoice,
    getSessionState,
    endSession,
    toggleSound
} from './session-game.js';
import { saveScore, getTopScores } from './local-leaderboard.js';
import { submitScore as submitScoreAPI, getLeaderboard as getLeaderboardAPI } from './api-client.js';
import { getSpeciesDisplay, getExtinctionNarrative } from './species-tracker.js';

let currentChoice = null;
let animationFrameId = null;
let lastFrameTime = 0;

// Initialize UI
export function initSessionUI() {
    showStartScreen();
}

// Show start screen
export async function showStartScreen() {
    const container = document.getElementById('session-game-container');
    if (!container) {
        console.error('Session game container not found');
        return;
    }
    
    // Try to get scores from backend, fall back to local storage
    let topScores = await getLeaderboardAPI(10);
    if (!topScores) {
        topScores = getTopScores(10);
    }
    
    container.innerHTML = `
        <div class="session-start-screen">
            <h1 class="session-title">Biomes Evolution</h1>
            <p class="session-subtitle">Balance civilization growth with ecosystem health</p>
            <p class="session-goal">Goal: Maximize your score in 5 minutes</p>
            
            <div class="session-name-input">
                <input type="text" id="player-name-input" placeholder="Enter your name" maxlength="20" />
                <button id="start-session-btn" class="session-btn-primary">Start Evolution</button>
            </div>
            
            <div class="session-leaderboard-preview">
                <h3>Top 10 Scores</h3>
                ${topScores.length === 0 ? 
                    '<p class="no-scores">No scores yet. Be the first!</p>' :
                    `<table class="scores-table">
                        <thead>
                            <tr>
                                <th>Rank</th>
                                <th>Name</th>
                                <th>Score</th>
                                <th>Biome</th>
                                <th>Style</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${topScores.map((score, i) => `
                                <tr>
                                    <td>${i + 1}</td>
                                    <td>${escapeHtml(score.name)}</td>
                                    <td>${score.score.toLocaleString()}</td>
                                    <td>${getBiome(score.biome).name}</td>
                                    <td>${score.playstyle}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>`
                }
            </div>
        </div>
    `;
    
    // Add event listeners
    document.getElementById('start-session-btn').addEventListener('click', () => {
        const nameInput = document.getElementById('player-name-input');
        const playerName = nameInput.value.trim() || 'Anonymous';
        startEvolutionPhase(playerName);
    });
    
    document.getElementById('player-name-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            document.getElementById('start-session-btn').click();
        }
    });
}

// Evolution phase - timeline progression
function startEvolutionPhase(playerName) {
    startSession(playerName);
    
    const container = document.getElementById('session-game-container');
    container.innerHTML = `
        <div class="session-evolution-screen">
            <div class="session-timer">Time: <span id="timer-display">5:00</span></div>
            
            <div class="evolution-timeline">
                <h2 id="evolution-stage-name">Primordial Ooze</h2>
                <p id="evolution-stage-desc">Organic molecules form in the ancient ocean</p>
                
                <div class="evolution-progress-container">
                    <div class="evolution-progress-bar">
                        <div id="evolution-progress-fill" class="evolution-progress-fill"></div>
                    </div>
                    <div id="evolution-stage-indicator" class="evolution-stage-indicator">Stage 1 of 7</div>
                </div>
                
                <div class="evolution-stages-dots">
                    ${[0,1,2,3,4,5,6].map(i => `<div class="stage-dot" id="stage-dot-${i}"></div>`).join('')}
                </div>
            </div>
            
            <div id="biome-selection" class="biome-selection" style="display: none;">
                <h3>Choose Your Environment</h3>
                <p class="biome-intro">Your species is ready to thrive. Select the biome where your civilization will emerge.</p>
                <div class="biome-grid">
                    ${Object.values(biomes).map(biome => `
                        <div class="biome-card" data-biome="${biome.id}" style="background: ${biome.colors.gradient};">
                            <h4>${biome.name}</h4>
                            <p class="biome-tagline">${biome.tagline}</p>
                            <button class="select-biome-btn" data-biome="${biome.id}">Begin Here</button>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <button id="sound-toggle" class="sound-toggle-btn">🔊 Sound ON</button>
        </div>
    `;
    
    // Event listeners for biome selection
    document.querySelectorAll('.select-biome-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const biomeId = e.target.dataset.biome;
            selectBiome(biomeId);
            startCivilizationPhase();
        });
    });
    
    // Sound toggle
    document.getElementById('sound-toggle').addEventListener('click', (e) => {
        const enabled = toggleSound();
        e.target.textContent = enabled ? '🔊 Sound ON' : '🔇 Sound OFF';
    });
    
    // Start game loop
    startGameLoop();
}

// Update evolution UI
function updateEvolutionUI() {
    const state = getSessionState();
    
    if (!state.evolutionStages) return;
    
    const currentStage = state.evolutionStages[state.evolutionStage];
    if (!currentStage) return;
    
    // Update stage name and description
    const nameEl = document.getElementById('evolution-stage-name');
    const descEl = document.getElementById('evolution-stage-desc');
    if (nameEl) nameEl.textContent = currentStage.name;
    if (descEl) descEl.textContent = currentStage.desc;
    
    // Update progress bar
    const progressFill = document.getElementById('evolution-progress-fill');
    if (progressFill) {
        progressFill.style.width = `${Math.min(state.evolutionProgress, 100)}%`;
    }
    
    // Update stage indicator
    const indicator = document.getElementById('evolution-stage-indicator');
    if (indicator) {
        indicator.textContent = `Stage ${state.evolutionStage + 1} of ${state.evolutionStages.length}`;
    }
    
    // Update stage dots
    for (let i = 0; i < state.evolutionStages.length; i++) {
        const dot = document.getElementById(`stage-dot-${i}`);
        if (dot) {
            if (i < state.evolutionStage) {
                dot.className = 'stage-dot completed';
            } else if (i === state.evolutionStage) {
                dot.className = 'stage-dot active';
            } else {
                dot.className = 'stage-dot';
            }
        }
    }
    
    // Show biome selection when ready
    if (canSelectBiome() && state.phase === 'evolution') {
        document.getElementById('biome-selection').style.display = 'block';
    }
}

// Civilization phase - main game
function startCivilizationPhase() {
    const state = getSessionState();
    const biome = getBiome(state.selectedBiome);
    
    const container = document.getElementById('session-game-container');
    container.innerHTML = `
        <div class="session-game-screen" style="background: ${biome.colors.gradient};">
            <div class="game-header">
                <div class="session-timer">Time: <span id="timer-display">0:00</span></div>
                <div class="biome-indicator">${biome.name}</div>
                <div id="final-minute-indicator" class="final-minute-indicator" style="display: none;">⏰ FINAL MINUTE!</div>
            </div>
            
            <!-- Species Tracker Sidebar -->
            <div class="species-tracker" id="species-tracker">
                <h4>Species Status</h4>
                <div id="species-list"></div>
            </div>
            
            <!-- Tipping Point Warning -->
            <div id="tipping-point-warning" class="tipping-point-warning" style="display: none;">
                ⚠️ APPROACHING TIPPING POINT!
            </div>
            
            <!-- Death Spiral Warning -->
            <div id="death-spiral-warning" class="death-spiral-warning" style="display: none;">
                🔴 DEATH SPIRAL ACTIVE!
            </div>
            
            <!-- Streak & Momentum Indicator -->
            <div id="streak-indicator" class="streak-indicator" style="display: none;"></div>
            
            <!-- Notification Popup -->
            <div id="notification-popup" class="notification-popup" style="display: none;"></div>
            
            <div class="ecosystem-health-bar-container">
                <div class="health-label">
                    <span>Ecosystem Health</span>
                    <span id="health-percentage">100%</span>
                    <span id="health-status" class="health-status">Healthy</span>
                </div>
                <div class="health-bar-bg">
                    <div id="health-bar-fill" class="health-bar-fill" style="width: 100%; background: #4CAF50;"></div>
                </div>
            </div>
            
            <div class="civilization-stats">
                <div class="stat-card">
                    <div class="stat-label">Population</div>
                    <div class="stat-value" id="population-value">10</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Technology</div>
                    <div class="stat-value" id="tech-value">0</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Resources</div>
                    <div class="stat-value" id="resources-value">0</div>
                </div>
                <div class="stat-card stat-card-score">
                    <div class="stat-label">Current Score</div>
                    <div class="stat-value" id="current-score">0</div>
                </div>
            </div>
            
            <div id="choice-modal" class="choice-modal" style="display: none;">
                <div class="choice-card">
                    <div id="choice-timer-bar" class="choice-timer-bar"></div>
                    <div id="choice-timer-text" class="choice-timer-text">10s</div>
                    <h3 id="choice-title">Choice Title</h3>
                    <p id="choice-description">Choice description</p>
                    <div id="choice-options" class="choice-options">
                    </div>
                </div>
            </div>
            
            <div id="collapse-warning" class="collapse-warning" style="display: none;">
                ECOSYSTEM CRITICAL!
            </div>
        </div>
    `;
}

// Update civilization UI
function updateCivilizationUI() {
    const state = getSessionState();
    
    // Update stats
    document.getElementById('population-value').textContent = Math.floor(state.population).toLocaleString();
    document.getElementById('tech-value').textContent = Math.floor(state.techLevel).toLocaleString();
    document.getElementById('resources-value').textContent = Math.floor(state.resources).toLocaleString();
    
    // Update ecosystem health
    const healthPercent = Math.round(state.ecosystemHealth);
    const healthColor = getEcosystemHealthColor(state.ecosystemHealth);
    const healthLabel = getEcosystemHealthLabel(state.ecosystemHealth);
    
    document.getElementById('health-percentage').textContent = `${healthPercent}%`;
    document.getElementById('health-status').textContent = healthLabel;
    const healthBar = document.getElementById('health-bar-fill');
    healthBar.style.width = `${healthPercent}%`;
    healthBar.style.background = healthColor;
    
    // Update species tracker
    updateSpeciesTracker(state);
    
    // Show tipping point warning
    const tippingWarning = document.getElementById('tipping-point-warning');
    if (state.tippingPointWarning && !state.deathSpiralActive) {
        tippingWarning.style.display = 'block';
    } else {
        tippingWarning.style.display = 'none';
    }
    
    // Show death spiral warning
    const deathWarning = document.getElementById('death-spiral-warning');
    if (state.deathSpiralActive) {
        deathWarning.style.display = 'block';
    } else {
        deathWarning.style.display = 'none';
    }
    
    // Show final minute indicator
    const finalMinute = document.getElementById('final-minute-indicator');
    if (state.finalMinute) {
        finalMinute.style.display = 'block';
    } else {
        finalMinute.style.display = 'none';
    }
    
    // Show collapse warning if critical
    const warning = document.getElementById('collapse-warning');
    if (state.ecosystemHealth < 20) {
        warning.style.display = 'block';
    } else {
        warning.style.display = 'none';
    }
    
    // Update streak/momentum indicator
    updateStreakIndicator(state);
    
    // Calculate and display current score
    const civScore = Math.floor(state.population * 10 + state.techLevel * 100 + state.resources * 5);
    const currentScore = Math.floor(civScore * (state.ecosystemHealth / 100));
    document.getElementById('current-score').textContent = currentScore.toLocaleString();
    
    // Update choice timer if choice is active
    if (currentChoice && state.currentChoiceStartTime > 0) {
        updateChoiceTimer(state);
    }
    
    // Check for new choice
    if (!currentChoice) {
        const nextChoice = getNextChoice();
        if (nextChoice) {
            showChoice(nextChoice);
        }
    }
}

// Update species tracker display
function updateSpeciesTracker(state) {
    const speciesList = document.getElementById('species-list');
    if (!speciesList) return;
    
    const speciesDisplay = getSpeciesDisplay(state);
    speciesList.innerHTML = speciesDisplay.map(species => `
        <div class="species-item ${species.extinct ? 'extinct' : 'alive'}">
            <span class="species-icon">${species.icon}</span>
            <span class="species-name">${species.name}</span>
            <span class="species-status">${species.status}</span>
        </div>
    `).join('');
}

// Update streak/momentum indicator
function updateStreakIndicator(state) {
    const indicator = document.getElementById('streak-indicator');
    if (!indicator) return;
    
    let text = '';
    if (state.momentumMultiplier > 1) {
        text = `🔥 ${state.momentumMultiplier}× MOMENTUM!`;
        indicator.style.display = 'block';
    } else if (state.fastChoicesCount >= 2) {
        text = `⚡ ${state.fastChoicesCount} FAST CHOICES`;
        indicator.style.display = 'block';
    } else {
        indicator.style.display = 'none';
    }
    indicator.textContent = text;
}

// Update choice timer
function updateChoiceTimer(state) {
    const elapsed = (Date.now() - state.currentChoiceStartTime) / 1000;
    const remaining = Math.max(0, state.choiceTimeLimit - elapsed);
    
    const timerText = document.getElementById('choice-timer-text');
    const timerBar = document.getElementById('choice-timer-bar');
    
    if (timerText && timerBar) {
        timerText.textContent = `${Math.ceil(remaining)}s`;
        
        // Update timer bar width
        const percent = (remaining / state.choiceTimeLimit) * 100;
        timerBar.style.width = `${percent}%`;
        
        // Change color based on time
        if (remaining < 3) {
            timerBar.style.background = '#f44336'; // Red
        } else if (remaining < 5) {
            timerBar.style.background = '#ff9800'; // Orange
        } else {
            timerBar.style.background = '#4CAF50'; // Green
        }
        
        // Auto-timeout if time runs out (handled by game logic)
    }
}

// Show choice modal
function showChoice(choice) {
    currentChoice = choice;
    
    const modal = document.getElementById('choice-modal');
    document.getElementById('choice-title').textContent = choice.title;
    document.getElementById('choice-description').textContent = choice.description;
    
    const optionsContainer = document.getElementById('choice-options');
    optionsContainer.innerHTML = choice.options.map((option, index) => `
        <button class="choice-option-btn" data-choice-id="${choice.id}" data-option-index="${index}">
            <div class="option-label">${option.label}</div>
            <div class="option-effect">${option.effect}</div>
        </button>
    `).join('');
    
    // Add event listeners
    document.querySelectorAll('.choice-option-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const choiceId = e.currentTarget.dataset.choiceId;
            const optionIndex = parseInt(e.currentTarget.dataset.optionIndex);
            makeChoice(choiceId, optionIndex);
            hideChoice();
        });
    });
    
    modal.style.display = 'flex';
}

// Hide choice modal
function hideChoice() {
    currentChoice = null;
    const modal = document.getElementById('choice-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Show end screen
async function showEndScreen(results) {
    const container = document.getElementById('session-game-container');
    const biome = getBiome(results.biome);
    
    // Save score to both backend and local storage
    const scoreData = {
        name: getSessionState().playerName,
        score: results.final,
        civilization: results.civilization,
        ecosystem: results.ecosystem,
        population: results.population,
        techLevel: results.techLevel,
        resources: results.resources,
        biome: results.biome,
        playstyle: results.playstyle,
        timestamp: Date.now()
    };
    
    // Save locally
    saveScore(scoreData);
    
    // Try to save to backend
    const backendResult = await submitScoreAPI(scoreData);
    if (backendResult) {
        console.log(`Score submitted! Global rank: ${backendResult.rank}`);
    }
    
    // Get species narrative
    const state = getSessionState();
    const extinctionNarrative = getExtinctionNarrative(state);
    const extinctSpecies = state.species.filter(s => s.extinct);
    const aliveSpecies = state.species.filter(s => !s.extinct);
    
    container.innerHTML = `
        <div class="session-end-screen" style="background: ${biome.colors.gradient};">
            <h1 class="end-title">${results.collapse ? 'ECOSYSTEM COLLAPSED!' : 'Session Complete'}</h1>
            
            <div class="score-breakdown">
                <div class="final-score-display">
                    <div class="final-score-label">Final Score</div>
                    <div class="final-score-value">${results.final.toLocaleString()}</div>
                </div>
                
                <!-- Genetic Profile Badge -->
                <div class="gene-profile-badge">
                    <div class="badge-label">Gene Profile</div>
                    <div class="badge-value">${results.playstyle}</div>
                </div>
                
                <!-- Species Survival Section -->
                <div class="species-survival-section">
                    <h3 class="${extinctionNarrative.type}">${extinctionNarrative.title}</h3>
                    <p class="narrative-message">${extinctionNarrative.message}</p>
                    
                    <div class="species-grid">
                        <div class="species-column">
                            <h4>Survived (${aliveSpecies.length})</h4>
                            ${aliveSpecies.map(s => `
                                <div class="species-item alive">
                                    <span class="species-icon">${s.icon}</span>
                                    <span class="species-name">${s.name}</span>
                                </div>
                            `).join('')}
                        </div>
                        ${extinctSpecies.length > 0 ? `
                            <div class="species-column">
                                <h4>Extinct (${extinctSpecies.length})</h4>
                                ${extinctSpecies.map(s => `
                                    <div class="species-item extinct">
                                        <span class="species-icon">${s.icon}</span>
                                        <span class="species-name">${s.name}</span>
                                    </div>
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>
                </div>
                
                <!-- Detailed Scoring Breakdown -->
                <div class="score-details">
                    <h3>Score Breakdown</h3>
                    <div class="score-detail">
                        <span class="detail-label">Base Genetic Score</span>
                        <span class="detail-value">${results.civilization?.toLocaleString() || '0'}</span>
                    </div>
                    <div class="score-detail">
                        <span class="detail-label">Biome Multiplier</span>
                        <span class="detail-value">${results.biomeBonus?.toFixed(2) || '1.00'}×</span>
                    </div>
                    <div class="score-detail">
                        <span class="detail-label">Momentum Multiplier</span>
                        <span class="detail-value">${results.momentumBonus?.toFixed(2) || '1.00'}×</span>
                    </div>
                    <div class="score-detail">
                        <span class="detail-label">Streak Bonus</span>
                        <span class="detail-value">+${results.streakBonus?.toLocaleString() || '0'}</span>
                    </div>
                    <div class="score-detail">
                        <span class="detail-label">Speed Bonus</span>
                        <span class="detail-value">+${results.speedBonus?.toLocaleString() || '0'}</span>
                    </div>
                    ${results.extinctionPenalty > 0 ? `
                        <div class="score-detail penalty">
                            <span class="detail-label">Extinction Penalty</span>
                            <span class="detail-value">-${(results.extinctionPenalty * 100).toFixed(0)}%</span>
                        </div>
                    ` : ''}
                </div>
                
                <!-- Final Stats -->
                <div class="final-stats">
                    <h3>Civilization Stats</h3>
                    <div class="score-detail">
                        <span class="detail-label">Population</span>
                        <span class="detail-value">${results.population.toLocaleString()}</span>
                    </div>
                    <div class="score-detail">
                        <span class="detail-label">Technology</span>
                        <span class="detail-value">${results.techLevel.toLocaleString()}</span>
                    </div>
                    <div class="score-detail">
                        <span class="detail-label">Resources</span>
                        <span class="detail-value">${results.resources.toLocaleString()}</span>
                    </div>
                    <div class="score-detail">
                        <span class="detail-label">Ecosystem Health</span>
                        <span class="detail-value">${results.ecosystem}%</span>
                    </div>
                    <div class="score-detail">
                        <span class="detail-label">Biome</span>
                        <span class="detail-value">${biome.name}</span>
                    </div>
                </div>
            </div>
            
            <div class="end-actions">
                <button id="play-again-btn" class="session-btn-primary">Play Again</button>
                <button id="view-leaderboard-btn" class="session-btn-secondary">View Leaderboard</button>
            </div>
        </div>
    `;
    
    document.getElementById('play-again-btn').addEventListener('click', () => {
        showStartScreen();
    });
    
    document.getElementById('view-leaderboard-btn').addEventListener('click', () => {
        showStartScreen(); // For now, just go to start screen which shows leaderboard
    });
}

// Game loop
function startGameLoop() {
    function gameLoop(timestamp) {
        const deltaTime = timestamp - lastFrameTime;
        lastFrameTime = timestamp;
        
        const state = getSessionState();
        
        // Update timer display
        const minutes = Math.floor(state.timeRemaining / 60);
        const seconds = Math.floor(state.timeRemaining % 60);
        const timerDisplay = document.getElementById('timer-display');
        if (timerDisplay) {
            timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
        
        // Update game state
        updateSession(deltaTime);
        
        // Update UI based on phase
        if (state.phase === 'evolution') {
            updateEvolutionUI();
        } else if (state.phase === 'civilization') {
            updateCivilizationUI();
        } else if (state.phase === 'ended') {
            // Session ended, show results
            const results = {
                civilization: state.civilizationScore,
                ecosystem: Math.round(state.ecosystemHealth),
                final: state.finalScore,
                playstyle: state.playstyle,
                biome: state.selectedBiome,
                population: Math.floor(state.population),
                techLevel: Math.floor(state.techLevel),
                resources: Math.floor(state.resources),
                collapse: state.ecosystemHealth <= 0
            };
            showEndScreen(results);
            cancelAnimationFrame(animationFrameId);
            return;
        }
        
        animationFrameId = requestAnimationFrame(gameLoop);
    }
    
    lastFrameTime = performance.now();
    animationFrameId = requestAnimationFrame(gameLoop);
}

// Helper function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

export default {
    initSessionUI,
    showStartScreen
};

