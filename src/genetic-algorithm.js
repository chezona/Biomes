// Genetic Algorithm - Evolutionary Fitness Scoring
import { calculateBiomeBonus } from './biomes-simple.js';

// Calculate evolutionary fitness based on multiple factors
export function calculateFitness(state) {
    // Base fitness components (0-100 scale)
    const survival = state.ecosystemHealth; // 0-100
    
    const reproduction = Math.min(100, (state.population / 1000) * 100); // Scale to 100
    
    const adaptation = Math.min(100, (state.techLevel / 200) * 100); // Scale to 100
    
    const resourceEfficiency = Math.min(100, Math.max(0, 50 + (state.resources / 10))); // Centered at 50
    
    // Biodiversity = species still alive / total species
    const aliveSpecies = state.species.filter(s => !s.extinct).length;
    const biodiversity = (aliveSpecies / state.species.length) * 100;
    
    return {
        survival,
        reproduction,
        adaptation,
        resourceEfficiency,
        biodiversity
    };
}

// Calculate weighted fitness score using adaptive genes
export function calculateWeightedFitness(fitness, genes) {
    const score = 
        (fitness.survival * genes.survival_weight) +
        (fitness.reproduction * genes.growth_weight) +
        (fitness.adaptation * genes.tech_weight) +
        (fitness.resourceEfficiency * genes.resource_weight) +
        (fitness.biodiversity * genes.diversity_weight);
    
    // Scale to reasonable range (0-10000)
    return score * 100;
}

// Adapt genes based on player choices
export function adaptGenes(state, choiceType) {
    const adaptRate = 0.05; // How much genes change per choice
    
    switch(choiceType) {
        case 'aggressive':
            // Aggressive choices evolve toward growth and resources
            state.genes.growth_weight += adaptRate;
            state.genes.resource_weight += adaptRate * 0.5;
            state.genes.survival_weight -= adaptRate * 0.5;
            state.genes.diversity_weight -= adaptRate * 0.5;
            break;
            
        case 'sustainable':
            // Sustainable choices evolve toward survival and biodiversity
            state.genes.survival_weight += adaptRate;
            state.genes.diversity_weight += adaptRate * 0.5;
            state.genes.growth_weight -= adaptRate * 0.5;
            break;
            
        case 'balanced':
            // Balanced choices evolve toward tech and efficiency
            state.genes.tech_weight += adaptRate;
            state.genes.resource_weight += adaptRate * 0.3;
            break;
    }
    
    // Normalize genes so they sum to 1.0
    normalizeGenes(state.genes);
}

// Normalize gene weights to sum to 1.0
function normalizeGenes(genes) {
    const total = genes.survival_weight + genes.growth_weight + genes.tech_weight + 
                  genes.resource_weight + genes.diversity_weight;
    
    if (total > 0) {
        genes.survival_weight /= total;
        genes.growth_weight /= total;
        genes.tech_weight /= total;
        genes.resource_weight /= total;
        genes.diversity_weight /= total;
    }
}

// Random mutation events (2-3 per game)
const mutationEvents = [
    {
        id: 'pollution_resistance',
        title: 'MUTATION: Pollution Resistance!',
        description: 'Your species develops resistance to environmental toxins',
        effect: (state) => {
            // Ecosystem degradation reduced by 10% for rest of game
            state.genes.survival_weight += 0.1;
            normalizeGenes(state.genes);
        }
    },
    {
        id: 'population_boom',
        title: 'MUTATION: Population Boom!',
        description: 'Genetic adaptation causes explosive population growth',
        effect: (state) => {
            // 2× population growth for 20 seconds
            const originalMult = state.growthMultiplier;
            state.growthMultiplier *= 2;
            setTimeout(() => {
                if (state.sessionActive) {
                    state.growthMultiplier = originalMult;
                }
            }, 20000);
        }
    },
    {
        id: 'innovation_surge',
        title: 'MUTATION: Innovation Surge!',
        description: 'Sudden leap in cognitive abilities',
        effect: (state) => {
            state.techLevel += 30;
            state.genes.tech_weight += 0.1;
            normalizeGenes(state.genes);
        }
    },
    {
        id: 'resource_efficiency',
        title: 'MUTATION: Resource Efficiency!',
        description: 'Your civilization learns to do more with less',
        effect: (state) => {
            state.resources += 40;
            state.genes.resource_weight += 0.1;
            normalizeGenes(state.genes);
        }
    },
    {
        id: 'symbiosis',
        title: 'MUTATION: Ecological Symbiosis!',
        description: 'Your species forms beneficial relationships with nature',
        effect: (state) => {
            state.ecosystemHealth += 15;
            state.genes.diversity_weight += 0.15;
            state.genes.survival_weight += 0.05;
            normalizeGenes(state.genes);
        }
    }
];

// Trigger a random mutation
export function triggerMutation(state) {
    const mutation = mutationEvents[Math.floor(Math.random() * mutationEvents.length)];
    mutation.effect(state);
    return mutation;
}

// Calculate final score using genetic algorithm
export function calculateFinalScore(state, biomeId) {
    const fitness = calculateFitness(state);
    const geneticScore = calculateWeightedFitness(fitness, state.genes);
    
    // Apply biome bonus
    const biomeBonus = calculateBiomeBonus(biomeId, state.ecosystemHealth, geneticScore);
    
    // Apply momentum multiplier
    const momentumBonus = state.momentumMultiplier;
    
    // Apply streak bonus
    const streakBonus = state.streakBonus;
    
    // Apply speed bonus
    const speedBonus = state.speedBonus;
    
    // Apply extinction penalty
    const extinctionMultiplier = 1 - state.extinctionPenalty;
    
    const finalScore = Math.floor(
        (geneticScore * biomeBonus * momentumBonus * extinctionMultiplier) + 
        streakBonus + 
        speedBonus
    );
    
    return {
        final: Math.max(0, finalScore),
        fitness,
        genetic: Math.floor(geneticScore),
        biomeBonus,
        momentumBonus,
        streakBonus,
        speedBonus,
        extinctionPenalty: state.extinctionPenalty
    };
}

// Get gene profile description for end screen
export function getGeneProfile(genes) {
    const profiles = [];
    
    if (genes.survival_weight > 0.35) profiles.push('Survivor');
    if (genes.growth_weight > 0.3) profiles.push('Expansionist');
    if (genes.tech_weight > 0.35) profiles.push('Innovator');
    if (genes.resource_weight > 0.15) profiles.push('Hoarder');
    if (genes.diversity_weight > 0.15) profiles.push('Conservationist');
    
    if (profiles.length === 0) return 'Balanced';
    return profiles.join(' + ');
}

export default {
    calculateFitness,
    calculateWeightedFitness,
    adaptGenes,
    triggerMutation,
    calculateFinalScore,
    getGeneProfile
};

