// API Client for Backend Leaderboard
// Falls back to localStorage if backend is unavailable

import { API_URL } from './api-config.js';

const API_BASE_URL = `${API_URL}/api`;

let backendAvailable = false;

// Check if backend is available
async function checkBackend() {
    try {
        const response = await fetch(`${API_BASE_URL}/health`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        backendAvailable = response.ok;
        return backendAvailable;
    } catch (error) {
        backendAvailable = false;
        return false;
    }
}

// Submit score to backend
export async function submitScore(scoreData) {
    if (!backendAvailable) {
        await checkBackend();
    }
    
    if (!backendAvailable) {
        console.log('Backend unavailable, using localStorage');
        return null;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/score`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: scoreData.name,
                score: scoreData.score,
                civilization: scoreData.civilization,
                ecosystem: scoreData.ecosystem,
                population: scoreData.population || 0,
                techLevel: scoreData.techLevel || 0,
                resources: scoreData.resources || 0,
                biome: scoreData.biome,
                playstyle: scoreData.playstyle
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to submit score');
        }
        
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error submitting score:', error);
        return null;
    }
}

// Get leaderboard from backend
export async function getLeaderboard(limit = 100) {
    if (!backendAvailable) {
        await checkBackend();
    }
    
    if (!backendAvailable) {
        return null;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/leaderboard?limit=${limit}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch leaderboard');
        }
        
        const data = await response.json();
        return data.scores;
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        return null;
    }
}

// Get daily leaderboard
export async function getDailyLeaderboard(limit = 50) {
    if (!backendAvailable) {
        await checkBackend();
    }
    
    if (!backendAvailable) {
        return null;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/leaderboard/daily?limit=${limit}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch daily leaderboard');
        }
        
        const data = await response.json();
        return data.scores;
    } catch (error) {
        console.error('Error fetching daily leaderboard:', error);
        return null;
    }
}

// Get statistics
export async function getStats() {
    if (!backendAvailable) {
        await checkBackend();
    }
    
    if (!backendAvailable) {
        return null;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/stats`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch stats');
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching stats:', error);
        return null;
    }
}

// Get rank for a score
export async function getRank(score) {
    if (!backendAvailable) {
        await checkBackend();
    }
    
    if (!backendAvailable) {
        return null;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/rank/${score}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch rank');
        }
        
        const data = await response.json();
        return data.rank;
    } catch (error) {
        console.error('Error fetching rank:', error);
        return null;
    }
}

// Check if backend is available
export async function isBackendAvailable() {
    return await checkBackend();
}

export default {
    submitScore,
    getLeaderboard,
    getDailyLeaderboard,
    getStats,
    getRank,
    isBackendAvailable
};

