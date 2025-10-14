// 5-Minute Session Game Logic
import { getBiome, calculateBiomeModifier, calculateBiomeBonus } from './biomes-simple.js';
import { checkExtinctions, checkMassExtinction, applyExtinctionPenalties } from './species-tracker.js';
import { crisisEvents, getRandomCrises, shouldTriggerCrisis } from './crisis-events.js';
import { adaptGenes, triggerMutation, calculateFinalScore, getGeneProfile } from './genetic-algorithm.js';

// Game state
export const sessionState = {
    // Session info
    sessionActive: false,
    sessionStartTime: 0,
    sessionDuration: 180, // 3 minutes in seconds
    timeRemaining: 180,
    phase: 'start', // 'start', 'evolution', 'civilization', 'ended'
    
    // Player info
    playerName: '',
    selectedBiome: null,
    
    // Evolution phase - timeline progression
    evolutionStage: 0, // 0-6 stages
    evolutionProgress: 0, // 0-100 for current stage
    evolutionStages: [
        { name: 'Primordial Ooze', duration: 3, desc: 'Organic molecules form in the ancient ocean' },
        { name: 'RNA World', duration: 3, desc: 'Self-replicating RNA emerges' },
        { name: 'First Cells', duration: 3, desc: 'Membrane-bound life appears' },
        { name: 'Photosynthesis', duration: 3, desc: 'Organisms harness the sun\'s energy' },
        { name: 'Multicellular Life', duration: 3, desc: 'Complex organisms evolve' },
        { name: 'Land Colonization', duration: 3, desc: 'Life spreads to land' },
        { name: 'Modern Era', duration: 3, desc: 'Choose your environment' }
    ],
    
    // Civilization phase
    population: 10,
    techLevel: 0,
    resources: 0,
    ecosystemHealth: 100,
    
    // Choices
    choicesPresented: [],
    choiceTimer: 0,
    nextChoiceTime: 5, // First choice after 5 seconds (rapid-fire!)
    currentChoiceStartTime: 0,
    choiceTimeLimit: 10, // 10 seconds to make a choice
    speedBonus: 0, // Bonus points for fast decisions
    
    // Scoring
    civilizationScore: 0,
    finalScore: 0,
    playstyle: '',
    
    // Growth tracking
    lastUpdateTime: 0,
    growthMultiplier: 1.0,
    
    // Genetic Algorithm - Adaptive Genes
    genes: {
        survival_weight: 0.3,
        growth_weight: 0.2,
        tech_weight: 0.3,
        resource_weight: 0.1,
        diversity_weight: 0.1
    },
    
    // Species Tracking (8 iconic species)
    species: [
        { id: 'pollinators', name: 'Pollinators', icon: '🐝', extinct: false, threshold: 40, penalty: 0.15 },
        { id: 'predators', name: 'Apex Predators', icon: '🐺', extinct: false, threshold: 35, penalty: 0.10 },
        { id: 'forests', name: 'Old Growth Forests', icon: '🌳', extinct: false, threshold: 50, penalty: 0.20 },
        { id: 'marine', name: 'Marine Life', icon: '🐋', extinct: false, threshold: 30, penalty: 0.12 },
        { id: 'birds', name: 'Birds of Prey', icon: '🦅', extinct: false, threshold: 45, penalty: 0.08 },
        { id: 'megafauna', name: 'Megafauna', icon: '🐻', extinct: false, threshold: 25, penalty: 0.15 },
        { id: 'butterflies', name: 'Butterflies', icon: '🦋', extinct: false, threshold: 55, penalty: 0.10 },
        { id: 'fish', name: 'Freshwater Fish', icon: '🐠', extinct: false, threshold: 20, penalty: 0.08 }
    ],
    extinctionPenalty: 0, // Cumulative penalty from extinctions
    
    // Tipping Points
    tippingPointWarning: false,
    deathSpiralActive: false,
    
    // Streak & Momentum
    lastChoiceType: [], // Track last 3 choices: 'aggressive', 'sustainable', 'balanced'
    streakBonus: 0,
    momentumMultiplier: 1.0,
    fastChoicesCount: 0, // Count of choices made in < 4 seconds
    
    // Milestones
    techMilestonesReached: [],
    
    // Final minute flag
    finalMinute: false
};

// The 15 core choices with clear trade-offs
export const gameChoices = [
    {
        id: 'food_production',
        title: 'Your population needs more food',
        description: 'How will you feed your growing civilization?',
        options: [
            {
                label: 'Clear forests for farms',
                effect: '+25 pop, -10 tech, -15% eco',
                choiceType: 'aggressive',
                apply: (state) => {
                    state.population += 25;
                    state.techLevel -= 10; // Destroying nature reduces knowledge
                    state.ecosystemHealth -= 15 * calculateBiomeModifier(state.selectedBiome, 'damage', state.ecosystemHealth);
                }
            },
            {
                label: 'Sustainable farming',
                effect: '+12 pop, +5 tech, -3% eco',
                choiceType: 'balanced',
                apply: (state) => {
                    state.population += 12;
                    state.techLevel += 5;
                    state.ecosystemHealth -= 3 * calculateBiomeModifier(state.selectedBiome, 'damage', state.ecosystemHealth);
                }
            },
            {
                label: 'Foraging only',
                effect: '+3 pop, -5 resources, +2% eco',
                choiceType: 'sustainable',
                apply: (state) => {
                    state.population += 3;
                    state.resources -= 5; // Foraging doesn't accumulate resources
                    state.ecosystemHealth += 2 * calculateBiomeModifier(state.selectedBiome, 'recovery', state.ecosystemHealth);
                }
            }
        ]
    },
    
    {
        id: 'energy_source',
        title: 'Your civilization discovers energy',
        description: 'Which path will you choose?',
        options: [
            {
                label: 'Burn fossil fuels',
                effect: '+20 tech, +30 pop, -30 resources, -12% eco',
                choiceType: 'aggressive',
                apply: (state) => {
                    state.techLevel += 20;
                    state.population += 30;
                    state.resources -= 30; // Consuming resources rapidly
                    state.ecosystemHealth -= 12 * calculateBiomeModifier(state.selectedBiome, 'damage', state.ecosystemHealth);
                }
            },
            {
                label: 'Renewable energy',
                effect: '+15 tech, +10 pop, +10 resources, -2% eco',
                choiceType: 'balanced',
                apply: (state) => {
                    state.techLevel += 15;
                    state.population += 10;
                    state.resources += 10; // Sustainable resources
                    state.ecosystemHealth -= 2 * calculateBiomeModifier(state.selectedBiome, 'damage', state.ecosystemHealth);
                }
            },
            {
                label: 'Minimal energy use',
                effect: '+3 tech, -10 pop, +5 resources, +3% eco',
                choiceType: 'sustainable',
                apply: (state) => {
                    state.techLevel += 3;
                    state.population -= 10; // Can't support as many people
                    state.resources += 5;
                    state.ecosystemHealth += 3 * calculateBiomeModifier(state.selectedBiome, 'recovery', state.ecosystemHealth);
                }
            }
        ]
    },
    
    {
        id: 'population_policy',
        title: 'Population growth is accelerating',
        description: 'How will you manage it?',
        options: [
            {
                label: 'Encourage growth',
                effect: '+35 population, -10% ecosystem',
                choiceType: 'aggressive',
                apply: (state) => {
                    state.population += 35;
                    state.ecosystemHealth -= 10 * calculateBiomeModifier(state.selectedBiome, 'damage', state.ecosystemHealth);
                }
            },
            {
                label: 'Natural growth',
                effect: '+15 population, -2% ecosystem',
                choiceType: 'balanced',
                apply: (state) => {
                    state.population += 15;
                    state.ecosystemHealth -= 2 * calculateBiomeModifier(state.selectedBiome, 'damage', state.ecosystemHealth);
                }
            },
            {
                label: 'Limit growth',
                effect: '+5 population, +5% ecosystem, +5 tech',
                choiceType: 'sustainable',
                apply: (state) => {
                    state.population += 5;
                    state.ecosystemHealth += 5 * calculateBiomeModifier(state.selectedBiome, 'recovery', state.ecosystemHealth);
                    state.techLevel += 5;
                }
            }
        ]
    },
    
    {
        id: 'rival_species',
        title: 'A rival species competes for resources',
        description: 'How will you respond?',
        options: [
            {
                label: 'Eliminate them',
                effect: '+30 resources, +15 population, -18% ecosystem',
                choiceType: 'aggressive',
                apply: (state) => {
                    state.resources += 30;
                    state.population += 15;
                    state.ecosystemHealth -= 18 * calculateBiomeModifier(state.selectedBiome, 'damage', state.ecosystemHealth);
                }
            },
            {
                label: 'Coexist peacefully',
                effect: '+10 resources, +8 population, +8% ecosystem',
                choiceType: 'sustainable',
                apply: (state) => {
                    state.resources += 10;
                    state.population += 8;
                    state.ecosystemHealth += 8 * calculateBiomeModifier(state.selectedBiome, 'recovery', state.ecosystemHealth);
                }
            }
        ]
    },
    
    {
        id: 'forest_use',
        title: 'Your civilization needs lumber',
        description: 'How will you harvest the forest?',
        options: [
            {
                label: 'Clear-cut logging',
                effect: '+40 resources, +20 population, -20% ecosystem',
                choiceType: 'aggressive',
                apply: (state) => {
                    state.resources += 40;
                    state.population += 20;
                    state.ecosystemHealth -= 20 * calculateBiomeModifier(state.selectedBiome, 'damage', state.ecosystemHealth);
                }
            },
            {
                label: 'Selective harvesting',
                effect: '+20 resources, +10 population, -5% ecosystem',
                choiceType: 'balanced',
                apply: (state) => {
                    state.resources += 20;
                    state.population += 10;
                    state.ecosystemHealth -= 5 * calculateBiomeModifier(state.selectedBiome, 'damage', state.ecosystemHealth);
                }
            },
            {
                label: 'Preserve the forest',
                effect: '+5 resources, +3 population, +10% ecosystem',
                choiceType: 'sustainable',
                apply: (state) => {
                    state.resources += 5;
                    state.population += 3;
                    state.ecosystemHealth += 10 * calculateBiomeModifier(state.selectedBiome, 'recovery', state.ecosystemHealth);
                }
            }
        ]
    },
    
    {
        id: 'tech_path',
        title: 'A technological breakthrough beckons',
        description: 'At what cost will you pursue it?',
        options: [
            {
                label: 'Rapid development',
                effect: '+25 tech, +15 population, -14% ecosystem',
                choiceType: 'aggressive',
                apply: (state) => {
                    state.techLevel += 25;
                    state.population += 15;
                    state.ecosystemHealth -= 14 * calculateBiomeModifier(state.selectedBiome, 'damage', state.ecosystemHealth);
                }
            },
            {
                label: 'Sustainable innovation',
                effect: '+15 tech, +12 population, -3% ecosystem',
                choiceType: 'balanced',
                apply: (state) => {
                    state.techLevel += 15;
                    state.population += 12;
                    state.ecosystemHealth -= 3 * calculateBiomeModifier(state.selectedBiome, 'damage', state.ecosystemHealth);
                }
            }
        ]
    },
    
    {
        id: 'waste_management',
        title: 'Waste is accumulating in your settlements',
        description: 'How will you handle it?',
        options: [
            {
                label: 'Dump in nature',
                effect: '+10 tech, +20 population, -16% ecosystem',
                choiceType: 'aggressive',
                apply: (state) => {
                    state.techLevel += 10;
                    state.population += 20;
                    state.ecosystemHealth -= 16 * calculateBiomeModifier(state.selectedBiome, 'damage', state.ecosystemHealth);
                }
            },
            {
                label: 'Recycle and compost',
                effect: '+8 tech, +10 population, +4% ecosystem',
                choiceType: 'balanced',
                apply: (state) => {
                    state.techLevel += 8;
                    state.population += 10;
                    state.ecosystemHealth += 4 * calculateBiomeModifier(state.selectedBiome, 'recovery', state.ecosystemHealth);
                }
            },
            {
                label: 'Reduce consumption',
                effect: '+3 tech, +3 population, +8% ecosystem',
                choiceType: 'sustainable',
                apply: (state) => {
                    state.techLevel += 3;
                    state.population += 3;
                    state.ecosystemHealth += 8 * calculateBiomeModifier(state.selectedBiome, 'recovery', state.ecosystemHealth);
                }
            }
        ]
    },
    
    {
        id: 'expansion',
        title: 'Your territory could expand',
        description: 'How aggressively will you grow?',
        options: [
            {
                label: 'Aggressive expansion',
                effect: '+40 population, +15 resources, -18% ecosystem',
                choiceType: 'aggressive',
                apply: (state) => {
                    state.population += 40;
                    state.resources += 15;
                    state.ecosystemHealth -= 18 * calculateBiomeModifier(state.selectedBiome, 'damage', state.ecosystemHealth);
                }
            },
            {
                label: 'Moderate growth',
                effect: '+20 population, +10 resources, -6% ecosystem',
                choiceType: 'balanced',
                apply: (state) => {
                    state.population += 20;
                    state.resources += 10;
                    state.ecosystemHealth -= 6 * calculateBiomeModifier(state.selectedBiome, 'damage', state.ecosystemHealth);
                }
            },
            {
                label: 'Minimal footprint',
                effect: '+8 population, +5 resources, +5% ecosystem',
                choiceType: 'sustainable',
                apply: (state) => {
                    state.population += 8;
                    state.resources += 5;
                    state.ecosystemHealth += 5 * calculateBiomeModifier(state.selectedBiome, 'recovery', state.ecosystemHealth);
                }
            }
        ]
    },
    
    {
        id: 'resource_discovery',
        title: 'Valuable minerals discovered underground',
        description: 'How will you extract them?',
        options: [
            {
                label: 'Intensive mining',
                effect: '+50 resources, +10 tech, -15% ecosystem',
                choiceType: 'aggressive',
                apply: (state) => {
                    state.resources += 50;
                    state.techLevel += 10;
                    state.ecosystemHealth -= 15 * calculateBiomeModifier(state.selectedBiome, 'damage', state.ecosystemHealth);
                }
            },
            {
                label: 'Careful extraction',
                effect: '+25 resources, +8 tech, -5% ecosystem',
                choiceType: 'balanced',
                apply: (state) => {
                    state.resources += 25;
                    state.techLevel += 8;
                    state.ecosystemHealth -= 5 * calculateBiomeModifier(state.selectedBiome, 'damage', state.ecosystemHealth);
                }
            },
            {
                label: 'Leave it untouched',
                effect: '+0 resources, +2 tech, +7% ecosystem',
                choiceType: 'sustainable',
                apply: (state) => {
                    state.techLevel += 2;
                    state.ecosystemHealth += 7 * calculateBiomeModifier(state.selectedBiome, 'recovery', state.ecosystemHealth);
                }
            }
        ]
    },
    
    {
        id: 'climate_event',
        title: 'Climate patterns are shifting',
        description: 'How will your civilization adapt?',
        options: [
            {
                label: 'Force adaptation quickly',
                effect: '+15 tech, +15 population, -10% ecosystem',
                choiceType: 'aggressive',
                apply: (state) => {
                    state.techLevel += 15;
                    state.population += 15;
                    state.ecosystemHealth -= 10 * calculateBiomeModifier(state.selectedBiome, 'damage', state.ecosystemHealth);
                }
            },
            {
                label: 'Gradual sustainable adaptation',
                effect: '+10 tech, +10 population, +3% ecosystem',
                choiceType: 'sustainable',
                apply: (state) => {
                    state.techLevel += 10;
                    state.population += 10;
                    state.ecosystemHealth += 3 * calculateBiomeModifier(state.selectedBiome, 'recovery', state.ecosystemHealth);
                }
            }
        ]
    },
    
    {
        id: 'pollinator_crisis',
        title: 'Pollinator populations are declining',
        description: 'This threatens your food supply',
        options: [
            {
                label: 'Chemical pesticides',
                effect: '+20 population, -12% ecosystem',
                choiceType: 'aggressive',
                apply: (state) => {
                    state.population += 20;
                    state.ecosystemHealth -= 12 * calculateBiomeModifier(state.selectedBiome, 'damage', state.ecosystemHealth);
                }
            },
            {
                label: 'Natural pest control',
                effect: '+12 population, +6% ecosystem',
                choiceType: 'balanced',
                apply: (state) => {
                    state.population += 12;
                    state.ecosystemHealth += 6 * calculateBiomeModifier(state.selectedBiome, 'recovery', state.ecosystemHealth);
                }
            },
            {
                label: 'Accept crop losses',
                effect: '+3 population, +10% ecosystem',
                choiceType: 'sustainable',
                apply: (state) => {
                    state.population += 3;
                    state.ecosystemHealth += 10 * calculateBiomeModifier(state.selectedBiome, 'recovery', state.ecosystemHealth);
                }
            }
        ]
    },
    
    {
        id: 'water_use',
        title: 'Water resources are limited',
        description: 'How will you manage them?',
        options: [
            {
                label: 'Drain aquifers',
                effect: '+30 population, -14% ecosystem',
                choiceType: 'aggressive',
                apply: (state) => {
                    state.population += 30;
                    state.ecosystemHealth -= 14 * calculateBiomeModifier(state.selectedBiome, 'damage', state.ecosystemHealth);
                }
            },
            {
                label: 'Balanced usage',
                effect: '+18 population, -4% ecosystem',
                choiceType: 'balanced',
                apply: (state) => {
                    state.population += 18;
                    state.ecosystemHealth -= 4 * calculateBiomeModifier(state.selectedBiome, 'damage', state.ecosystemHealth);
                }
            },
            {
                label: 'Strict conservation',
                effect: '+8 population, +6% ecosystem',
                choiceType: 'sustainable',
                apply: (state) => {
                    state.population += 8;
                    state.ecosystemHealth += 6 * calculateBiomeModifier(state.selectedBiome, 'recovery', state.ecosystemHealth);
                }
            }
        ]
    },
    
    {
        id: 'predator_problem',
        title: 'Large predators threaten settlements',
        description: 'How will you deal with them?',
        options: [
            {
                label: 'Eradicate them',
                effect: '+25 population, -16% ecosystem',
                choiceType: 'aggressive',
                apply: (state) => {
                    state.population += 25;
                    state.ecosystemHealth -= 16 * calculateBiomeModifier(state.selectedBiome, 'damage', state.ecosystemHealth);
                }
            },
            {
                label: 'Control populations',
                effect: '+15 population, -5% ecosystem',
                choiceType: 'balanced',
                apply: (state) => {
                    state.population += 15;
                    state.ecosystemHealth -= 5 * calculateBiomeModifier(state.selectedBiome, 'damage', state.ecosystemHealth);
                }
            },
            {
                label: 'Coexist carefully',
                effect: '+5 population, +8% ecosystem',
                choiceType: 'sustainable',
                apply: (state) => {
                    state.population += 5;
                    state.ecosystemHealth += 8 * calculateBiomeModifier(state.selectedBiome, 'recovery', state.ecosystemHealth);
                }
            }
        ]
    },
    
    {
        id: 'rare_resource',
        title: 'A rare resource could boost your civilization',
        description: 'But extracting it risks the ecosystem',
        options: [
            {
                label: 'Mine intensively',
                effect: '+60 resources, +20 tech, -20% ecosystem',
                choiceType: 'aggressive',
                apply: (state) => {
                    state.resources += 60;
                    state.techLevel += 20;
                    state.ecosystemHealth -= 20 * calculateBiomeModifier(state.selectedBiome, 'damage', state.ecosystemHealth);
                }
            },
            {
                label: 'Mine carefully',
                effect: '+30 resources, +12 tech, -8% ecosystem',
                choiceType: 'balanced',
                apply: (state) => {
                    state.resources += 30;
                    state.techLevel += 12;
                    state.ecosystemHealth -= 8 * calculateBiomeModifier(state.selectedBiome, 'damage', state.ecosystemHealth);
                }
            },
            {
                label: 'Leave it alone',
                effect: '+0 resources, +5 tech, +12% ecosystem',
                choiceType: 'sustainable',
                apply: (state) => {
                    state.techLevel += 5;
                    state.ecosystemHealth += 12 * calculateBiomeModifier(state.selectedBiome, 'recovery', state.ecosystemHealth);
                }
            }
        ]
    },
    
    {
        id: 'final_push',
        title: 'The final moment approaches',
        description: 'One last decision for your civilization',
        options: [
            {
                label: 'Push for maximum growth',
                effect: '+50 population, +30 tech, -25% ecosystem',
                choiceType: 'aggressive',
                apply: (state) => {
                    state.population += 50;
                    state.techLevel += 30;
                    state.ecosystemHealth -= 25 * calculateBiomeModifier(state.selectedBiome, 'damage', state.ecosystemHealth);
                }
            },
            {
                label: 'Sustainable finish',
                effect: '+25 population, +15 tech, +10% ecosystem',
                choiceType: 'balanced',
                apply: (state) => {
                    state.population += 25;
                    state.techLevel += 15;
                    state.ecosystemHealth += 10 * calculateBiomeModifier(state.selectedBiome, 'recovery', state.ecosystemHealth);
                }
            },
            {
                label: 'Restore the ecosystem',
                effect: '+10 population, +5 tech, +25% ecosystem',
                choiceType: 'sustainable',
                apply: (state) => {
                    state.population += 10;
                    state.techLevel += 5;
                    state.ecosystemHealth += 25 * calculateBiomeModifier(state.selectedBiome, 'recovery', state.ecosystemHealth);
                }
            }
        ]
    }
];

// Initialize a new session
export function startSession(playerName) {
    sessionState.sessionActive = true;
    sessionState.sessionStartTime = Date.now();
    sessionState.timeRemaining = sessionState.sessionDuration;
    sessionState.phase = 'evolution';
    sessionState.playerName = playerName || 'Anonymous';
    sessionState.lastUpdateTime = Date.now();
    
    // Reset evolution
    sessionState.evolutionStage = 0;
    sessionState.evolutionProgress = 0;
    
    // Reset stats
    sessionState.population = 10;
    sessionState.techLevel = 0;
    sessionState.resources = 0;
    sessionState.ecosystemHealth = 100;
    sessionState.choicesPresented = [];
    sessionState.choiceTimer = 0;
    sessionState.nextChoiceTime = 5; // Faster pace for 3-minute game!
    sessionState.speedBonus = 0;
    sessionState.currentChoiceStartTime = 0;
    
    // Reset dramatic systems
    sessionState.extinctionPenalty = 0;
    sessionState.tippingPointWarning = false;
    sessionState.deathSpiralActive = false;
    sessionState.lastChoiceType = [];
    sessionState.streakBonus = 0;
    sessionState.momentumMultiplier = 1.0;
    sessionState.fastChoicesCount = 0;
    sessionState.techMilestonesReached = [];
    sessionState.finalMinute = false;
    
    // Reset species (make new copies so they're not extinct)
    sessionState.species = [
        { id: 'pollinators', name: 'Pollinators', icon: '🐝', extinct: false, threshold: 40, penalty: 0.15 },
        { id: 'predators', name: 'Apex Predators', icon: '🐺', extinct: false, threshold: 35, penalty: 0.10 },
        { id: 'forests', name: 'Old Growth Forests', icon: '🌳', extinct: false, threshold: 50, penalty: 0.20 },
        { id: 'marine', name: 'Marine Life', icon: '🐋', extinct: false, threshold: 30, penalty: 0.12 },
        { id: 'birds', name: 'Birds of Prey', icon: '🦅', extinct: false, threshold: 45, penalty: 0.08 },
        { id: 'megafauna', name: 'Megafauna', icon: '🐻', extinct: false, threshold: 25, penalty: 0.15 },
        { id: 'butterflies', name: 'Butterflies', icon: '🦋', extinct: false, threshold: 55, penalty: 0.10 },
        { id: 'fish', name: 'Freshwater Fish', icon: '🐠', extinct: false, threshold: 20, penalty: 0.08 }
    ];
    
    // Reset genes to default
    sessionState.genes = {
        survival_weight: 0.3,
        growth_weight: 0.2,
        tech_weight: 0.3,
        resource_weight: 0.1,
        diversity_weight: 0.1
    };
    
    // Initialize crisis events (2-3 random crises per game)
    availableCrises = getRandomCrises(3);
    lastCrisisTime = 0;
    mutationsTriggered = 0;
}

// Select biome and transition to civilization phase
export function selectBiome(biomeId) {
    sessionState.selectedBiome = biomeId;
    sessionState.phase = 'civilization';
    sessionState.lastUpdateTime = Date.now();
    
    // Start the 3-minute countdown AFTER biome selection
    sessionState.sessionStartTime = Date.now();
    sessionState.timeRemaining = sessionState.sessionDuration;
    
    const biome = getBiome(biomeId);
    sessionState.growthMultiplier = 1.0;
}

// Auto-progress through evolution stages
function updateEvolutionProgress(deltaTime) {
    if (sessionState.phase !== 'evolution') return;
    
    const currentStage = sessionState.evolutionStages[sessionState.evolutionStage];
    if (!currentStage) return;
    
    // Progress through current stage (based on duration in seconds)
    const progressPerSecond = 100 / currentStage.duration;
    sessionState.evolutionProgress += progressPerSecond * (deltaTime / 1000);
    
    // Move to next stage when progress reaches 100
    if (sessionState.evolutionProgress >= 100) {
        sessionState.evolutionProgress = 0;
        sessionState.evolutionStage++;
        
        // Play sound effect for stage completion
        playSound('evolve');
        
        // Check if evolution is complete (reached last stage)
        if (sessionState.evolutionStage >= sessionState.evolutionStages.length) {
            // Evolution complete, show biome selection
            sessionState.evolutionStage = sessionState.evolutionStages.length - 1;
            sessionState.evolutionProgress = 100;
        }
    }
}

// Check if ready to show biome selection
export function canSelectBiome() {
    return sessionState.evolutionStage >= sessionState.evolutionStages.length - 1 && 
           sessionState.evolutionProgress >= 100;
}

// Simple sound system
const sounds = {
    enabled: true
};

function playSound(type) {
    if (!sounds.enabled) return;
    
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    switch(type) {
        case 'evolve':
            oscillator.frequency.value = 440;
            oscillator.type = 'sine';
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
            break;
        case 'choice':
            oscillator.frequency.value = 523.25;
            oscillator.type = 'square';
            gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
            break;
        case 'warning':
            oscillator.frequency.value = 200;
            oscillator.type = 'sawtooth';
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
            break;
        case 'complete':
            oscillator.frequency.value = 659.25;
            oscillator.type = 'sine';
            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.8);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.8);
            break;
    }
}

export function toggleSound() {
    sounds.enabled = !sounds.enabled;
    return sounds.enabled;
}

// Store crisis state
let availableCrises = [];
let lastCrisisTime = 0;
let mutationsTriggered = 0;

// Check for ecosystem tipping points
function checkTippingPoints() {
    const eco = sessionState.ecosystemHealth;
    
    // Warning at 40%
    if (eco < 40 && !sessionState.tippingPointWarning) {
        sessionState.tippingPointWarning = true;
        // Warning will be shown in UI
    }
    
    // Death spiral at 25%
    if (eco < 25 && !sessionState.deathSpiralActive) {
        sessionState.deathSpiralActive = true;
        playSound('warning');
        // Degradation rate doubles - handled in update loop
    }
    
    // Auto-degrade below 20% (point of no return)
    if (eco < 20 && eco > 0) {
        sessionState.ecosystemHealth -= 0.016; // ~1% per second
    }
}

// Check and handle species extinctions
function checkAndHandleExtinctions() {
    const newExtinctions = checkExtinctions(sessionState);
    
    if (newExtinctions.length > 0) {
        // Play extinction sound for each
        newExtinctions.forEach(species => {
            playSound('warning');
            // Extinction will be shown in UI
        });
        
        // Check for mass extinction event
        if (checkMassExtinction(sessionState)) {
            // Mass extinction! Ecosystem collapses faster
            sessionState.deathSpiralActive = true;
        }
    }
}

// Update game state each frame
export function updateSession(deltaTime) {
    if (!sessionState.sessionActive) return;
    
    const now = Date.now();
    const elapsedSeconds = (now - sessionState.sessionStartTime) / 1000;
    sessionState.timeRemaining = Math.max(0, sessionState.sessionDuration - elapsedSeconds);
    
    // End session when time runs out
    if (sessionState.timeRemaining <= 0 && sessionState.phase !== 'ended') {
        endSession();
        return;
    }
    
    // Check for final 40 seconds (faster for 3-minute game)
    if (sessionState.timeRemaining <= 40 && !sessionState.finalMinute) {
        sessionState.finalMinute = true;
        playSound('warning');
        // Choices come even faster in final stretch!
        sessionState.nextChoiceTime = 4;
    }
    
    // Update evolution phase
    if (sessionState.phase === 'evolution') {
        updateEvolutionProgress(deltaTime);
    }
    
    // Update civilization phase
    if (sessionState.phase === 'civilization') {
        const dt = deltaTime / 1000; // Convert to seconds
        
        // Apply extinction penalties to growth
        const penalties = applyExtinctionPenalties(sessionState);
        
        // Check for tipping points
        checkTippingPoints();
        
        // Check for species extinctions
        checkAndHandleExtinctions();
        
        // Auto-grow population (with penalties from extinctions)
        let popGrowth = 2.5 * calculateBiomeModifier(sessionState.selectedBiome, 'population', sessionState.ecosystemHealth) * dt;
        popGrowth *= penalties.populationMultiplier; // Extinction penalty
        popGrowth *= sessionState.momentumMultiplier; // Momentum bonus
        if (sessionState.finalMinute) popGrowth *= 1.5; // Final minute intensity
        sessionState.population += popGrowth;
        
        // Auto-grow technology (with penalties)
        let techGrowth = 1.5 * calculateBiomeModifier(sessionState.selectedBiome, 'tech', sessionState.ecosystemHealth) * dt;
        techGrowth *= penalties.techMultiplier; // Extinction penalty
        techGrowth *= sessionState.momentumMultiplier; // Momentum bonus
        if (sessionState.finalMinute) techGrowth *= 1.5; // Final minute intensity
        sessionState.techLevel += techGrowth;
        
        // Auto-generate resources (with penalties)
        let resGrowth = 1.2 * calculateBiomeModifier(sessionState.selectedBiome, 'resources', sessionState.ecosystemHealth) * dt;
        resGrowth *= penalties.resourceMultiplier; // Extinction penalty
        sessionState.resources += resGrowth;
        
        // Natural decay system (30% per minute = 0.5% per second)
        const decayRate = 0.30; // 30% per minute
        const decayPerSecond = decayRate / 60;
        
        sessionState.ecosystemHealth -= sessionState.ecosystemHealth * decayPerSecond * dt;
        sessionState.techLevel -= sessionState.techLevel * decayPerSecond * dt;
        sessionState.population -= sessionState.population * decayPerSecond * dt;
        
        // Additional ecosystem degradation from population pressure
        let degradation = (sessionState.population / 1000) * 0.05 * dt;
        if (sessionState.deathSpiralActive) degradation *= 2; // Death spiral doubles degradation!
        sessionState.ecosystemHealth -= degradation;
        
        // Clamp all stats to prevent negative values
        sessionState.ecosystemHealth = Math.max(0, Math.min(100, sessionState.ecosystemHealth));
        sessionState.techLevel = Math.max(0, sessionState.techLevel);
        sessionState.population = Math.max(5, sessionState.population); // Minimum 5 to prevent extinction
        sessionState.resources = Math.max(0, sessionState.resources);
        
        // Check for ecosystem collapse
        if (sessionState.ecosystemHealth <= 0) {
            endSession(true); // catastrophic collapse
            return;
        }
        
        // Population die-off if ecosystem is very low
        if (sessionState.ecosystemHealth < 30) {
            const dieOff = sessionState.population * 0.02 * dt;
            sessionState.population -= dieOff;
        }
        
        // Update choice timer
        sessionState.choiceTimer += deltaTime / 1000;
    }
}

// Shuffle array utility
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Get next choice to present to player
export function getNextChoice() {
    if (sessionState.choiceTimer < sessionState.nextChoiceTime) {
        return null;
    }
    
    // Increased limit for 3-minute game (allow 50 choices)
    if (sessionState.choicesPresented.length >= 50) {
        return null;
    }
    
    // Check if should trigger a crisis instead
    const elapsedSinceStart = 180 - sessionState.timeRemaining;
    if (shouldTriggerCrisis(sessionState.timeRemaining, lastCrisisTime, availableCrises)) {
        if (availableCrises.length > 0) {
            const crisis = availableCrises.shift();
            lastCrisisTime = elapsedSinceStart;
            // Randomize crisis options too
            if (crisis.options) {
                crisis.options = shuffleArray(crisis.options);
            }
            return crisis;
        }
    }
    
    // Random mutation (2-3 per game)
    if (mutationsTriggered < 3 && elapsedSinceStart > 30 && Math.random() < 0.02) {
        mutationsTriggered++;
        const mutation = triggerMutation(sessionState);
        playSound('evolve');
        // Mutation notification will be shown in UI
    }
    
    // Get unused regular choices
    let unusedChoices = gameChoices.filter(c => !sessionState.choicesPresented.includes(c.id));
    
    // If no unused choices, recycle them (allows infinite questions)
    if (unusedChoices.length === 0) {
        sessionState.choicesPresented = []; // Reset
        unusedChoices = [...gameChoices];
    }
    
    // Select random choice
    const choice = unusedChoices[Math.floor(Math.random() * unusedChoices.length)];
    
    // Randomize the option order to prevent gaming
    if (choice && choice.options) {
        choice.options = shuffleArray(choice.options);
    }
    
    // Mark when choice starts (for timer)
    sessionState.currentChoiceStartTime = Date.now();
    
    return choice;
}

// Player makes a choice
export function makeChoice(choiceId, optionIndex) {
    const choice = gameChoices.find(c => c.id === choiceId) || crisisEvents.find(c => c.id === choiceId);
    if (!choice) return;
    
    const option = choice.options[optionIndex];
    if (!option) return;
    
    // Calculate decision time
    const decisionTime = (Date.now() - sessionState.currentChoiceStartTime) / 1000;
    
    // Speed bonuses
    if (decisionTime < 3) {
        sessionState.speedBonus += 50;
        sessionState.fastChoicesCount++;
    } else if (decisionTime < 5) {
        sessionState.speedBonus += 25;
        sessionState.fastChoicesCount++;
    }
    
    // Check momentum (3+ fast choices = multiplier)
    if (sessionState.fastChoicesCount >= 3) {
        sessionState.momentumMultiplier = 1.2;
    }
    if (sessionState.fastChoicesCount >= 5) {
        sessionState.momentumMultiplier = 1.5;
    }
    
    // Reset fast choice count if slow
    if (decisionTime > 8) {
        sessionState.fastChoicesCount = 0;
        sessionState.momentumMultiplier = 1.0;
    }
    
    // Play choice sound
    playSound('choice');
    
    // Apply the choice effect
    option.apply(sessionState);
    
    // Adapt genes based on choice type
    if (option.choiceType) {
        adaptGenes(sessionState, option.choiceType);
        
        // Track for streaks
        sessionState.lastChoiceType.push(option.choiceType);
        if (sessionState.lastChoiceType.length > 3) {
            sessionState.lastChoiceType.shift();
        }
        
        // Check for streaks (3 in a row)
        if (sessionState.lastChoiceType.length === 3) {
            const allSame = sessionState.lastChoiceType.every(t => t === sessionState.lastChoiceType[0]);
            if (allSame) {
                if (sessionState.lastChoiceType[0] === 'sustainable') {
                    sessionState.streakBonus += 500;
                    sessionState.ecosystemHealth += 5; // Harmony bonus
                } else if (sessionState.lastChoiceType[0] === 'aggressive') {
                    sessionState.streakBonus += 500;
                    sessionState.ecosystemHealth -= 10; // Domination penalty
                }
            } else {
                // All different = balance master
                const unique = [...new Set(sessionState.lastChoiceType)];
                if (unique.length === 3) {
                    sessionState.streakBonus += 300;
                }
            }
        }
    }
    
    // Clamp values
    sessionState.population = Math.max(0, sessionState.population);
    sessionState.techLevel = Math.max(0, sessionState.techLevel);
    sessionState.ecosystemHealth = Math.max(0, Math.min(100, sessionState.ecosystemHealth));
    
    // Play warning if ecosystem is low
    if (sessionState.ecosystemHealth < 30) {
        playSound('warning');
    }
    
    // Mark choice as presented
    sessionState.choicesPresented.push(choiceId);
    
    // Reset timer for next choice (rapid-fire: 5-7 seconds, faster in final stretch)
    sessionState.choiceTimer = 0;
    sessionState.nextChoiceTime = sessionState.finalMinute ? 3 : (5 + Math.random() * 2);
    
    // Check for ecosystem collapse
    if (sessionState.ecosystemHealth <= 0) {
        endSession(true);
    }
}

// Calculate final scores using genetic algorithm
export function calculateScores() {
    // Use genetic algorithm for scoring
    const scoreData = calculateFinalScore(sessionState, sessionState.selectedBiome);
    
    sessionState.civilizationScore = scoreData.genetic;
    sessionState.finalScore = scoreData.final;
    
    // Get gene profile for playstyle
    sessionState.playstyle = getGeneProfile(sessionState.genes);
    
    return {
        civilization: scoreData.genetic,
        ecosystem: Math.round(sessionState.ecosystemHealth),
        final: scoreData.final,
        playstyle: sessionState.playstyle,
        biome: sessionState.selectedBiome,
        population: Math.floor(sessionState.population),
        techLevel: Math.floor(sessionState.techLevel),
        resources: Math.floor(sessionState.resources),
        fitness: scoreData.fitness,
        biomeBonus: scoreData.biomeBonus,
        momentumBonus: scoreData.momentumBonus,
        streakBonus: scoreData.streakBonus,
        speedBonus: scoreData.speedBonus,
        extinctionPenalty: scoreData.extinctionPenalty
    };
}

// End the session
export function endSession(collapse = false) {
    sessionState.phase = 'ended';
    sessionState.sessionActive = false;
    
    if (collapse) {
        sessionState.ecosystemHealth = 0;
        playSound('warning');
    } else {
        playSound('complete');
    }
    
    const scores = calculateScores();
    return { ...scores, collapse };
}

// Get current game state for UI
export function getSessionState() {
    return { ...sessionState };
}

export default {
    sessionState,
    gameChoices,
    startSession,
    selectBiome,
    canSelectBiome,
    updateSession,
    getNextChoice,
    makeChoice,
    calculateScores,
    endSession,
    getSessionState,
    toggleSound
};

