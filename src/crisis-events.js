// Crisis Events - Random dramatic events that appear 2-3 times per game
import { calculateBiomeModifier } from './biomes-simple.js';

export const crisisEvents = [
    {
        id: 'pandemic',
        title: '🦠 DISEASE OUTBREAK!',
        description: 'A deadly pandemic sweeps through your civilization!',
        timer: 12,
        isCrisis: true,
        options: [
            {
                label: 'Quarantine the infected',
                effect: '-30 pop, save ecosystem',
                choiceType: 'sustainable',
                apply: (state) => {
                    state.population -= 30;
                    // Ecosystem benefits from reduced activity
                    state.ecosystemHealth += 3 * calculateBiomeModifier(state.selectedBiome, 'recovery', state.ecosystemHealth);
                }
            },
            {
                label: 'Continue as normal',
                effect: '-10% ecosystem, pop keeps growing',
                choiceType: 'aggressive',
                apply: (state) => {
                    state.ecosystemHealth -= 10 * calculateBiomeModifier(state.selectedBiome, 'damage', state.ecosystemHealth);
                    // Disease spreads but civilization continues
                }
            },
            {
                label: 'Fund medical research',
                effect: '-40 tech to develop cure',
                choiceType: 'balanced',
                apply: (state) => {
                    state.techLevel -= 40;
                    state.population -= 10; // Some casualties during research
                }
            }
        ]
    },
    
    {
        id: 'asteroid',
        title: '☄️ ASTEROID APPROACHING!',
        description: 'A massive asteroid threatens your world!',
        timer: 8, // Panic! Shorter time
        isCrisis: true,
        options: [
            {
                label: 'Deflect with technology',
                effect: '-50 tech to save everyone',
                choiceType: 'balanced',
                apply: (state) => {
                    state.techLevel -= 50;
                    // Success! No casualties
                }
            },
            {
                label: 'Evacuate to safety',
                effect: 'Save 50% of population',
                choiceType: 'sustainable',
                apply: (state) => {
                    state.population = Math.floor(state.population * 0.5);
                    state.ecosystemHealth -= 15 * calculateBiomeModifier(state.selectedBiome, 'damage', state.ecosystemHealth);
                }
            },
            {
                label: 'Accept the impact',
                effect: '-150 pop, -20% ecosystem',
                choiceType: 'aggressive',
                apply: (state) => {
                    state.population -= 150;
                    state.ecosystemHealth -= 20 * calculateBiomeModifier(state.selectedBiome, 'damage', state.ecosystemHealth);
                }
            }
        ]
    },
    
    {
        id: 'revolution',
        title: '✊ POPULATION REVOLTS!',
        description: 'Your people revolt against environmental destruction!',
        timer: 10,
        isCrisis: true,
        options: [
            {
                label: 'Submit to their demands',
                effect: '+20% eco, -50 pop (emigration)',
                choiceType: 'sustainable',
                apply: (state) => {
                    state.ecosystemHealth += 20 * calculateBiomeModifier(state.selectedBiome, 'recovery', state.ecosystemHealth);
                    state.population -= 50;
                }
            },
            {
                label: 'Suppress the revolt',
                effect: '-100 pop (casualties), continue growth',
                choiceType: 'aggressive',
                apply: (state) => {
                    state.population -= 100;
                    state.ecosystemHealth -= 5 * calculateBiomeModifier(state.selectedBiome, 'damage', state.ecosystemHealth);
                }
            },
            {
                label: 'Negotiate compromise',
                effect: '-30 tech, -5% eco compromise',
                choiceType: 'balanced',
                apply: (state) => {
                    state.techLevel -= 30;
                    state.ecosystemHealth -= 5 * calculateBiomeModifier(state.selectedBiome, 'damage', state.ecosystemHealth);
                    state.population -= 20; // Some still leave
                }
            }
        ]
    },
    
    {
        id: 'famine',
        title: '🌾 WIDESPREAD FAMINE!',
        description: 'Crops have failed - your people are starving!',
        timer: 10,
        isCrisis: true,
        options: [
            {
                label: 'Emergency deforestation',
                effect: '+30 pop (short term), -25% eco',
                choiceType: 'aggressive',
                apply: (state) => {
                    state.population += 30;
                    state.ecosystemHealth -= 25 * calculateBiomeModifier(state.selectedBiome, 'damage', state.ecosystemHealth);
                }
            },
            {
                label: 'Ration food supplies',
                effect: '-40 pop but maintain stability',
                choiceType: 'sustainable',
                apply: (state) => {
                    state.population -= 40;
                    state.ecosystemHealth += 5 * calculateBiomeModifier(state.selectedBiome, 'recovery', state.ecosystemHealth);
                }
            },
            {
                label: 'Import emergency food',
                effect: '-60 resources for trade',
                choiceType: 'balanced',
                apply: (state) => {
                    state.resources -= 60;
                    state.population -= 10; // Some casualties before food arrives
                }
            }
        ]
    },
    
    {
        id: 'climate_disaster',
        title: '🌪️ EXTREME WEATHER!',
        description: 'A massive storm threatens your infrastructure!',
        timer: 10,
        isCrisis: true,
        options: [
            {
                label: 'Build storm defenses',
                effect: '-40 resources, save infrastructure',
                choiceType: 'balanced',
                apply: (state) => {
                    state.resources -= 40;
                    state.techLevel += 5; // Learn from the experience
                }
            },
            {
                label: 'Adapt to the new climate',
                effect: '-20 pop, -10% eco',
                choiceType: 'sustainable',
                apply: (state) => {
                    state.population -= 20;
                    state.ecosystemHealth -= 10 * calculateBiomeModifier(state.selectedBiome, 'damage', state.ecosystemHealth);
                    state.techLevel += 8; // Innovation from adversity
                }
            },
            {
                label: 'Ignore the warnings',
                effect: '-5% eco, -20 resources (damage)',
                choiceType: 'aggressive',
                apply: (state) => {
                    state.ecosystemHealth -= 5 * calculateBiomeModifier(state.selectedBiome, 'damage', state.ecosystemHealth);
                    state.resources -= 20;
                    state.population -= 30; // Casualties from storm
                }
            }
        ]
    },
    
    {
        id: 'war',
        title: '⚔️ WAR BREAKS OUT!',
        description: 'Conflict with a neighboring civilization!',
        timer: 10,
        isCrisis: true,
        options: [
            {
                label: 'Fight to conquer',
                effect: '-60 pop, +40 resources (plunder)',
                choiceType: 'aggressive',
                apply: (state) => {
                    state.population -= 60;
                    state.resources += 40;
                    state.ecosystemHealth -= 8 * calculateBiomeModifier(state.selectedBiome, 'damage', state.ecosystemHealth);
                }
            },
            {
                label: 'Defend your borders',
                effect: '-30 pop, maintain status quo',
                choiceType: 'balanced',
                apply: (state) => {
                    state.population -= 30;
                    state.techLevel += 10; // Military innovations
                }
            },
            {
                label: 'Negotiate peace',
                effect: '-50 resources (tribute)',
                choiceType: 'sustainable',
                apply: (state) => {
                    state.resources -= 50;
                    state.ecosystemHealth += 5 * calculateBiomeModifier(state.selectedBiome, 'recovery', state.ecosystemHealth);
                }
            }
        ]
    },
    
    {
        id: 'discovery',
        title: '💎 RARE RESOURCE FOUND!',
        description: 'Your explorers discover valuable minerals!',
        timer: 10,
        isCrisis: false, // Positive event!
        options: [
            {
                label: 'Exploit immediately',
                effect: '+100 resources, -15% eco',
                choiceType: 'aggressive',
                apply: (state) => {
                    state.resources += 100;
                    state.ecosystemHealth -= 15 * calculateBiomeModifier(state.selectedBiome, 'damage', state.ecosystemHealth);
                }
            },
            {
                label: 'Sustainable extraction',
                effect: '+50 resources, -3% eco, +10 tech',
                choiceType: 'balanced',
                apply: (state) => {
                    state.resources += 50;
                    state.ecosystemHealth -= 3 * calculateBiomeModifier(state.selectedBiome, 'damage', state.ecosystemHealth);
                    state.techLevel += 10;
                }
            },
            {
                label: 'Preserve for future',
                effect: '+5% eco (untouched nature)',
                choiceType: 'sustainable',
                apply: (state) => {
                    state.ecosystemHealth += 5 * calculateBiomeModifier(state.selectedBiome, 'recovery', state.ecosystemHealth);
                    state.techLevel += 5; // Study it instead
                }
            }
        ]
    },
    
    {
        id: 'breakthrough',
        title: '🔬 SCIENTIFIC BREAKTHROUGH!',
        description: 'Your scientists make a revolutionary discovery!',
        timer: 10,
        isCrisis: false, // Positive event!
        options: [
            {
                label: 'Military application',
                effect: '+50 tech, -20% eco (weapons)',
                choiceType: 'aggressive',
                apply: (state) => {
                    state.techLevel += 50;
                    state.ecosystemHealth -= 20 * calculateBiomeModifier(state.selectedBiome, 'damage', state.ecosystemHealth);
                    state.population += 20; // Military strength attracts migrants
                }
            },
            {
                label: 'Medical application',
                effect: '+30 pop, +30 tech (healthcare)',
                choiceType: 'balanced',
                apply: (state) => {
                    state.population += 30;
                    state.techLevel += 30;
                    state.ecosystemHealth -= 2 * calculateBiomeModifier(state.selectedBiome, 'damage', state.ecosystemHealth);
                }
            },
            {
                label: 'Environmental application',
                effect: '+25% eco, +20 tech (green tech)',
                choiceType: 'sustainable',
                apply: (state) => {
                    state.ecosystemHealth += 25 * calculateBiomeModifier(state.selectedBiome, 'recovery', state.ecosystemHealth);
                    state.techLevel += 20;
                }
            }
        ]
    }
];

// Get random crisis events for a game (2-3 crises)
export function getRandomCrises(count = 3) {
    const shuffled = [...crisisEvents].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

// Determine if it's time for a crisis (random between 1-4 minutes)
export function shouldTriggerCrisis(timeRemaining, lastCrisisTime, availableCrises) {
    if (availableCrises.length === 0) return false;
    
    const elapsedSinceStart = 300 - timeRemaining;
    const elapsedSinceLast = lastCrisisTime ? (elapsedSinceStart - lastCrisisTime) : elapsedSinceStart;
    
    // Don't trigger crises in first 60 seconds or last 30 seconds
    if (elapsedSinceStart < 60 || timeRemaining < 30) return false;
    
    // Trigger if at least 40 seconds since last crisis and random chance
    if (elapsedSinceLast > 40 && Math.random() < 0.03) {
        return true;
    }
    
    return false;
}

export default {
    crisisEvents,
    getRandomCrises,
    shouldTriggerCrisis
};

