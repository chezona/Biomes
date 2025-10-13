// Simple Biomes System for 5-minute game
// 6 biomes with clear characteristics and trade-offs

export const biomes = {
    tropical: {
        id: 'tropical',
        name: 'Tropical Forest',
        description: 'Lush rainforest teeming with life',
        tagline: 'Fast growth, fragile ecosystem',
        
        // Growth modifiers
        populationGrowthRate: 1.3,  // 30% faster population growth
        techGrowthRate: 1.2,         // 20% faster tech
        resourceGeneration: 1.4,     // 40% more resources
        
        // Ecosystem characteristics
        baseHealth: 100,
        fragility: 1.5,              // Takes 50% more damage from choices
        resilience: 0.7,             // 30% slower recovery
        
        // Visual theme
        colors: {
            primary: '#1a5f2a',      // Deep green
            secondary: '#2d8f3d',
            accent: '#4CAF50',
            gradient: 'linear-gradient(135deg, #1a5f2a 0%, #2d8f3d 50%, #4CAF50 100%)'
        },
        
        // Special mechanics
        bonuses: {
            highBiodiversity: true,   // Extra points if keep health high
            rapidCollapse: true       // Penalty multiplier if health drops low
        }
    },
    
    temperate: {
        id: 'temperate',
        name: 'Temperate Forest',
        description: 'Balanced woodland with four seasons',
        tagline: 'Balanced growth, stable ecosystem',
        
        populationGrowthRate: 1.0,
        techGrowthRate: 1.0,
        resourceGeneration: 1.0,
        
        baseHealth: 100,
        fragility: 1.0,
        resilience: 1.0,
        
        colors: {
            primary: '#2d5016',
            secondary: '#4a7c2c',
            accent: '#6ba542',
            gradient: 'linear-gradient(135deg, #2d5016 0%, #4a7c2c 50%, #6ba542 100%)'
        },
        
        bonuses: {
            allRounder: true          // Small bonus to everything
        }
    },
    
    grassland: {
        id: 'grassland',
        name: 'Grassland',
        description: 'Wide open plains with scattered trees',
        tagline: 'Moderate growth, resilient ecosystem',
        
        populationGrowthRate: 1.1,
        techGrowthRate: 0.9,
        resourceGeneration: 1.1,
        
        baseHealth: 100,
        fragility: 0.8,              // Takes 20% less damage
        resilience: 1.3,             // 30% faster recovery
        
        colors: {
            primary: '#6b7c23',
            secondary: '#8fa63f',
            accent: '#b8c75a',
            gradient: 'linear-gradient(135deg, #6b7c23 0%, #8fa63f 50%, #b8c75a 100%)'
        },
        
        bonuses: {
            resilient: true,          // Faster ecosystem recovery
            expansion: true           // Better at territorial expansion
        }
    },
    
    desert: {
        id: 'desert',
        name: 'Desert',
        description: 'Harsh arid landscape with hidden beauty',
        tagline: 'Slow growth, very resilient ecosystem',
        
        populationGrowthRate: 0.7,
        techGrowthRate: 0.8,
        resourceGeneration: 0.6,
        
        baseHealth: 100,
        fragility: 0.5,              // Takes 50% less damage (already harsh)
        resilience: 1.5,             // 50% faster recovery
        
        colors: {
            primary: '#8b6914',
            secondary: '#b8941f',
            accent: '#d4af37',
            gradient: 'linear-gradient(135deg, #8b6914 0%, #b8941f 50%, #d4af37 100%)'
        },
        
        bonuses: {
            hardyPopulation: true,    // Population less affected by low health
            waterMastery: true        // Better resource efficiency
        }
    },
    
    tundra: {
        id: 'tundra',
        name: 'Tundra',
        description: 'Frozen wilderness with brief summers',
        tagline: 'Slow growth, stable ecosystem',
        
        populationGrowthRate: 0.8,
        techGrowthRate: 1.1,         // Adversity breeds innovation
        resourceGeneration: 0.7,
        
        baseHealth: 100,
        fragility: 0.7,
        resilience: 1.2,
        
        colors: {
            primary: '#4a6b7c',
            secondary: '#6b8fa6',
            accent: '#8fb8d4',
            gradient: 'linear-gradient(135deg, #4a6b7c 0%, #6b8fa6 50%, #8fb8d4 100%)'
        },
        
        bonuses: {
            slowAndSteady: true,      // Bonus for maintaining stability
            techAdvantage: true       // Faster tech in harsh conditions
        }
    },
    
    oceanic: {
        id: 'oceanic',
        name: 'Ocean',
        description: 'Vast seas with island settlements',
        tagline: 'Unique mechanics, different playstyle',
        
        populationGrowthRate: 0.9,
        techGrowthRate: 1.15,
        resourceGeneration: 1.2,
        
        baseHealth: 100,
        fragility: 1.2,
        resilience: 0.9,
        
        colors: {
            primary: '#0d3d5c',
            secondary: '#1a5c8a',
            accent: '#2980b9',
            gradient: 'linear-gradient(135deg, #0d3d5c 0%, #1a5c8a 50%, #2980b9 100%)'
        },
        
        bonuses: {
            maritime: true,           // Different resource types
            pollution: true           // Extra vulnerable to pollution
        }
    }
};

// Helper functions for biome mechanics
export function getBiome(biomeId) {
    return biomes[biomeId] || biomes.temperate;
}

export function calculateBiomeModifier(biome, type, ecosystemHealth) {
    const biomeData = getBiome(biome);
    
    switch(type) {
        case 'population':
            let popMod = biomeData.populationGrowthRate;
            // Bonus for high ecosystem health
            if (ecosystemHealth > 70) {
                popMod *= 1.1;
            }
            // Penalty for low ecosystem health
            if (ecosystemHealth < 30) {
                popMod *= 0.7;
            }
            return popMod;
            
        case 'tech':
            return biomeData.techGrowthRate;
            
        case 'resources':
            let resMod = biomeData.resourceGeneration;
            // Resources heavily affected by ecosystem health
            resMod *= (ecosystemHealth / 100);
            return Math.max(resMod, 0.1); // Minimum 10%
            
        case 'damage':
            return biomeData.fragility;
            
        case 'recovery':
            return biomeData.resilience;
            
        default:
            return 1.0;
    }
}

export function getEcosystemHealthColor(health) {
    if (health >= 70) return '#4CAF50';      // Green
    if (health >= 40) return '#FFC107';      // Yellow
    if (health >= 20) return '#FF9800';      // Orange
    return '#F44336';                         // Red
}

export function getEcosystemHealthLabel(health) {
    if (health >= 70) return 'Healthy';
    if (health >= 40) return 'Warning';
    if (health >= 20) return 'Danger';
    return 'Critical';
}

// Get random biome for variety
export function getRandomBiome() {
    const biomeIds = Object.keys(biomes);
    return biomeIds[Math.floor(Math.random() * biomeIds.length)];
}

// Calculate final score multiplier based on biome bonuses
export function calculateBiomeBonus(biomeId, ecosystemHealth, civilizationScore) {
    const biome = getBiome(biomeId);
    let bonus = 1.0;
    
    if (biome.bonuses.highBiodiversity && ecosystemHealth > 80) {
        bonus *= 1.15; // 15% bonus for keeping tropical forest healthy
    }
    
    if (biome.bonuses.rapidCollapse && ecosystemHealth < 30) {
        bonus *= 0.8; // 20% penalty for tropical collapse
    }
    
    if (biome.bonuses.allRounder) {
        bonus *= 1.05; // Small all-around bonus for temperate
    }
    
    if (biome.bonuses.slowAndSteady && ecosystemHealth > 60) {
        bonus *= 1.1; // Bonus for tundra stability
    }
    
    if (biome.bonuses.hardyPopulation && ecosystemHealth < 40) {
        bonus *= 1.15; // Desert population is resilient
    }
    
    return bonus;
}

export default biomes;

