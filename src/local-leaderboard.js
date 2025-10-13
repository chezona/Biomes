// Local Leaderboard using localStorage
// Simple implementation for MVP, can be replaced with backend later

const LEADERBOARD_KEY = 'biomes_evolution_leaderboard';
const MAX_SCORES = 100;

// Save a new score
export function saveScore(scoreData) {
    const scores = getAllScores();
    
    // Add new score
    scores.push({
        id: generateId(),
        name: scoreData.name || 'Anonymous',
        score: scoreData.score || 0,
        civilization: scoreData.civilization || 0,
        ecosystem: scoreData.ecosystem || 0,
        biome: scoreData.biome || 'temperate',
        playstyle: scoreData.playstyle || 'Balanced',
        timestamp: scoreData.timestamp || Date.now()
    });
    
    // Sort by score (descending)
    scores.sort((a, b) => b.score - a.score);
    
    // Keep only top scores
    const topScores = scores.slice(0, MAX_SCORES);
    
    // Save to localStorage
    try {
        localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(topScores));
        return true;
    } catch (e) {
        console.error('Failed to save score:', e);
        return false;
    }
}

// Get all scores
export function getAllScores() {
    try {
        const data = localStorage.getItem(LEADERBOARD_KEY);
        if (!data) return [];
        return JSON.parse(data);
    } catch (e) {
        console.error('Failed to load scores:', e);
        return [];
    }
}

// Get top N scores
export function getTopScores(n = 10) {
    const scores = getAllScores();
    return scores.slice(0, n);
}

// Get player's rank for a given score
export function getRank(score) {
    const scores = getAllScores();
    let rank = 1;
    for (const s of scores) {
        if (s.score > score) {
            rank++;
        } else {
            break;
        }
    }
    return rank;
}

// Get statistics
export function getStats() {
    const scores = getAllScores();
    
    if (scores.length === 0) {
        return {
            totalGames: 0,
            averageScore: 0,
            averageCivilization: 0,
            averageEcosystem: 0,
            highestScore: 0,
            mostPopularBiome: null,
            mostCommonPlaystyle: null
        };
    }
    
    const totalScore = scores.reduce((sum, s) => sum + s.score, 0);
    const totalCiv = scores.reduce((sum, s) => sum + s.civilization, 0);
    const totalEco = scores.reduce((sum, s) => sum + s.ecosystem, 0);
    
    // Count biomes
    const biomeCount = {};
    scores.forEach(s => {
        biomeCount[s.biome] = (biomeCount[s.biome] || 0) + 1;
    });
    const mostPopularBiome = Object.keys(biomeCount).reduce((a, b) => 
        biomeCount[a] > biomeCount[b] ? a : b, null
    );
    
    // Count playstyles
    const playstyleCount = {};
    scores.forEach(s => {
        playstyleCount[s.playstyle] = (playstyleCount[s.playstyle] || 0) + 1;
    });
    const mostCommonPlaystyle = Object.keys(playstyleCount).reduce((a, b) => 
        playstyleCount[a] > playstyleCount[b] ? a : b, null
    );
    
    return {
        totalGames: scores.length,
        averageScore: Math.round(totalScore / scores.length),
        averageCivilization: Math.round(totalCiv / scores.length),
        averageEcosystem: Math.round(totalEco / scores.length),
        highestScore: scores[0].score,
        mostPopularBiome: mostPopularBiome,
        mostCommonPlaystyle: mostCommonPlaystyle
    };
}

// Clear all scores (for testing)
export function clearScores() {
    try {
        localStorage.removeItem(LEADERBOARD_KEY);
        return true;
    } catch (e) {
        console.error('Failed to clear scores:', e);
        return false;
    }
}

// Generate unique ID for scores
function generateId() {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export default {
    saveScore,
    getAllScores,
    getTopScores,
    getRank,
    getStats,
    clearScores
};

