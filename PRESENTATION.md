# BIOMES EVOLUTION - Presentation Slides

## Slide 1: Title
**BIOMES EVOLUTION**  
*Balancing Civilization Growth with Ecosystem Health*

Franklyn Okechukwu (2025)  
Play: [chimerical-raindrop-52f1e7.netlify.app/biomes.html](https://chimerical-raindrop-52f1e7.netlify.app/biomes.html)

---

## Slide 2: Central Question

> **How do we balance the future and growth of our civilization with the health of our ecosystem?**

Through game mechanics that force players to confront **trade-offs** between human expansion and species survival.

---

## Slide 3: Game Flow - Evolution to Anthropocene

```mermaid
flowchart LR
    A[Primordial Ooze<br/>Collect RNA] --> B[Synthesize DNA<br/>Genetic Foundation]
    B --> C[Evolution Timeline<br/>4 billion years<br/>in 60 seconds]
    C --> D[Modern Era<br/>The Anthropocene]
    D --> E[Choose Your Biome<br/>8 ecosystems]
    E --> F[3-Minute<br/>Civilization Game]
    
    style A fill:#2c3e50,color:#fff
    style B fill:#34495e,color:#fff
    style C fill:#16a085,color:#fff
    style D fill:#e74c3c,color:#fff
    style E fill:#3498db,color:#fff
    style F fill:#27ae60,color:#fff
```

---

## Slide 4: Core Decision Loop

```mermaid
graph TD
    Choice[Rapid Choice<br/>Every 5-7 seconds] --> Type{What do you choose?}
    
    Type -->|Aggressive| A[+Growth<br/>--Ecosystem<br/>High Risk]
    Type -->|Balanced| B[+Moderate Growth<br/>-Moderate Damage<br/>Middle Path]
    Type -->|Sustainable| C[+Slow Growth<br/>+Ecosystem Healing<br/>Long-term Thinking]
    
    A --> Consequences[Cascading Effects]
    B --> Consequences
    C --> Consequences
    
    Consequences --> Species[8 Species<br/>Face Extinction]
    Species --> Threshold{Below<br/>Threshold?}
    
    Threshold -->|Yes| Extinct[Permanent<br/>Extinction<br/>-500 points]
    Threshold -->|No| Survive[Species<br/>Survives<br/>+1000 points]
    
    style Choice fill:#3498db,color:#fff
    style A fill:#e74c3c,color:#fff
    style B fill:#f39c12,color:#fff
    style C fill:#27ae60,color:#fff
    style Extinct fill:#c0392b,color:#fff
    style Survive fill:#16a085,color:#fff
```

---

## Slide 5: Key Design Variables

### 1. **Choice Type** (Player Agency)
- Aggressive vs. Sustainable vs. Balanced
- Each has trade-offs

### 2. **Species Thresholds** (Ecosystem Agency)
- 8 iconic species with extinction limits
- Pollinators, apex predators, forests, coral reefs...

### 3. **Tipping Points** (Systemic Feedback)
- Ecosystem < 30%: Cascading failures
- < 15%: Death spiral (no recovery)

### 4. **Time Pressure** (Climate Urgency)
- 3-minute countdown
- Fast decisions = bonuses
- Slow decisions = penalties

### 5. **Genetic Algorithm** (Emergent Scoring)
- Your choices create your "genes"
- Aggression, Sustainability, Adaptability, Resilience

---

## Slide 6: Ecosystem Feedback Loop

```mermaid
graph TD
    Player[Player Makes<br/>Aggressive Choice] --> Damage[Ecosystem<br/>Damage]
    Damage --> Threshold{Multiple Species<br/>Below Threshold?}
    
    Threshold -->|Yes 3+| Mass[Mass Extinction<br/>Event Triggered]
    Threshold -->|No| Individual[Individual<br/>Penalties]
    
    Mass --> Spiral[DEATH SPIRAL<br/>Growth → 0<br/>Decay Accelerates]
    Spiral --> NoRecovery[No Recovery<br/>System Collapse]
    
    Individual --> Warning[Tipping Point<br/>Warning]
    Warning --> Crisis[Random Crisis<br/>Drought, Disease]
    Crisis --> Emergency[Emergency<br/>Decisions]
    Emergency --> Player
    
    style Player fill:#3498db,color:#fff
    style Mass fill:#8e44ad,color:#fff
    style Spiral fill:#c0392b,color:#fff
    style NoRecovery fill:#000,color:#fff
```

---

## Slide 7: Building Cross-Species Relationships

**Design Choice:** Name specific species, not just "biodiversity points"

**Impact:**
- Pollinators going extinct → immediate emotional response
- Players develop care through witnessing consequences
- But: Does making species "useful" reinforce anthropocentrism?

**Tension:**  
Care entangled with self-interest (we protect what benefits us)

**Learning:**  
The game doesn't resolve this—it sits with the complexity

---

## Slide 8: Deconstructing Power Hierarchies

**The Contradiction:**
- Players have god-like control (pause, manage, strategize)
- But ecosystems **fight back** (tipping points, death spirals)

**Ecosystems Have Agency:**
- They respond with their own logic
- Indifferent to human intent
- Can trigger irreversible collapse

**Genetic Algorithm:**
- Humans aren't separate from nature
- Our choices shape our evolutionary path
- We are participants, not just managers

**Critical Question:**  
Can a game truly deconstruct hierarchies when the player is still "managing" nature?

---

## Slide 9: Technology, Stewardship & Care

**Technology as Tool:**
- Makes invisible relationships visible
- Global leaderboard shares multispecies data
- Backend tracks species survival across all players

**Technology as Trap:**
- Leaderboard promotes competition, not stewardship
- "Beat the high score" → domination logic
- Does gamification help or hurt ecological thinking?

**Coding Humility:**
- Random crisis events → uncertainty
- Extinction permanence → no "undo"
- Death spiral → unrecoverable failure

**Hardest Code I Wrote:**  
Making extinction permanent. Once a species is gone, it's gone.

---

## Slide 10: What I Learned

### Surprising Player Behaviors:
- Some always choose "sustainable" first (rituals)
- Others deliberately trigger mass extinction (experimentation)
- No single "optimal" strategy emerges

### Design Contradictions:
- 3-minute timer = climate urgency
- But real ecological change takes centuries
- The compression distorts scale

### If I Redesigned:
- Add "slow mode" without timer
- Let players sit with consequences
- Remove competitive leaderboard?

**Most Important Insight:**  
The game reveals values through choice patterns. It doesn't prescribe answers—it creates space for questions.

---

## Slide 11: Final Reflection

> *"Biomes Evolution is both a tool for ecological thinking and a product of anthropocentric game design."*

**What it does well:**
- Makes invisible relationships visible
- Creates empathy for specific species
- Shows cascading consequences in real-time

**What it struggles with:**
- Still centers human agency
- Competitive framing may undermine care
- Time compression distorts ecological reality

**The Question:**  
Can we care for species while benefiting from their existence?  
Can technology foster stewardship or does it inevitably reinforce domination?

*I don't have answers. But the game creates space to sit with these questions.*

---

## Slide 12: Play & Discuss

**Live Game:**  
[chimerical-raindrop-52f1e7.netlify.app/biomes.html](https://chimerical-raindrop-52f1e7.netlify.app/biomes.html)

**GitHub:**  
[github.com/chezona/Biomes](https://github.com/chezona/Biomes)

**After Playing, Reflect:**
- What species did you lose first? Why?
- Did you prioritize growth or sustainability?
- How did time pressure affect your choices?
- Would you play differently a second time?

*Design is not neutral. Every choice encodes values.*  
*What values does this game encode?*

---

## Appendix: Technical Implementation

**Systems:**
- Session Timer (3 min)
- Choice Engine (randomized every 5-7s)
- Species Tracker (8 species, dynamic thresholds)
- Genetic Algorithm (emergent scoring)
- Crisis System (random events)
- Global Leaderboard (Railway backend)

**Tech Stack:**
- Frontend: Vanilla JavaScript (ES6)
- Backend: Node.js + Express
- Deploy: Netlify + Railway

**Design Principles:**
1. Visibility (make relationships explicit)
2. Consequence (permanent extinction)
3. Tension (growth vs. sustainability)
4. Emergence (unpredictable outcomes)
5. Reflection (end-game narrative)

---

**END**

*Franklyn Okechukwu, 2025*  
*Making the invisible consequences of anthropocentric decision-making visible through game design.*

