// Species Tracking & Extinction System

// Check for extinctions based on ecosystem health
export function checkExtinctions(state) {
    const newExtinctions = [];
    
    state.species.forEach(species => {
        if (!species.extinct && state.ecosystemHealth < species.threshold) {
            // Species goes extinct!
            species.extinct = true;
            state.extinctionPenalty += species.penalty;
            newExtinctions.push(species);
        }
    });
    
    return newExtinctions;
}

// Check if mass extinction event should trigger
export function checkMassExtinction(state) {
    const extinctCount = state.species.filter(s => s.extinct).length;
    return extinctCount >= 3;
}

// Get species survival count
export function getSpeciesSurvival(state) {
    const alive = state.species.filter(s => !s.extinct).length;
    const total = state.species.length;
    return { alive, total, extinct: total - alive };
}

// Apply permanent penalties from extinctions
export function applyExtinctionPenalties(state) {
    let popPenalty = 0;
    let techPenalty = 0;
    let resourcePenalty = 0;
    
    state.species.forEach(species => {
        if (species.extinct) {
            switch(species.id) {
                case 'pollinators':
                    // Pollinators: Food production reduced
                    popPenalty += 0.15;
                    break;
                case 'predators':
                    // Apex predators: Ecosystem balance disrupted
                    techPenalty += 0.10;
                    break;
                case 'forests':
                    // Old growth forests: Resource generation reduced
                    resourcePenalty += 0.20;
                    break;
                case 'marine':
                    // Marine life: Coastal resources affected
                    resourcePenalty += 0.12;
                    break;
                case 'birds':
                    // Birds of prey: Pest control lost
                    popPenalty += 0.08;
                    break;
                case 'megafauna':
                    // Megafauna: Ecosystem services lost
                    popPenalty += 0.15;
                    break;
                case 'butterflies':
                    // Butterflies: Pollination affected
                    popPenalty += 0.10;
                    break;
                case 'fish':
                    // Freshwater fish: Water quality indicator
                    resourcePenalty += 0.08;
                    break;
            }
        }
    });
    
    return {
        populationMultiplier: 1 - popPenalty,
        techMultiplier: 1 - techPenalty,
        resourceMultiplier: 1 - resourcePenalty
    };
}

// Generate extinction narrative for end screen
export function getExtinctionNarrative(state) {
    const extinctSpecies = state.species.filter(s => s.extinct);
    const aliveSpecies = state.species.filter(s => !s.extinct);
    
    if (extinctSpecies.length === 0) {
        return {
            title: '🌟 PERFECT CONSERVATION',
            message: 'All species survived! Your civilization achieved harmony with nature.',
            type: 'perfect'
        };
    } else if (extinctSpecies.length >= 6) {
        return {
            title: '💀 MASS EXTINCTION',
            message: `Only ${aliveSpecies.length} of 8 species survived. The ecological cost was devastating.`,
            type: 'catastrophic'
        };
    } else if (extinctSpecies.length >= 3) {
        return {
            title: '⚠️ MAJOR LOSSES',
            message: `${extinctSpecies.length} species went extinct. The ecosystem is severely damaged.`,
            type: 'major'
        };
    } else {
        return {
            title: '😔 SOME LOSSES',
            message: `${extinctSpecies.length} species extinct, but ${aliveSpecies.length} survived.`,
            type: 'minor'
        };
    }
}

// Get species list for UI display
export function getSpeciesDisplay(state) {
    return state.species.map(s => ({
        ...s,
        status: s.extinct ? 'EXTINCT' : 'ALIVE',
        healthNeeded: s.threshold,
        currentHealth: state.ecosystemHealth
    }));
}

export default {
    checkExtinctions,
    checkMassExtinction,
    getSpeciesSurvival,
    applyExtinctionPenalties,
    getExtinctionNarrative,
    getSpeciesDisplay
};

