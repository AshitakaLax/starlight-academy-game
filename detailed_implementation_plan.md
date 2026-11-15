# Starlight Academy: Studio of Magic & Motion — Architectural & Engineering Implementation Plan

## 1. Executive Summary & Design Philosophy
**Starlight Academy: Studio of Magic & Motion** is a self-contained, single-file (`.html`) educational adventure, gymnastics rhythm, fashion customization, and pet-nurturing game designed specifically for a 9-year-old player (3rd-grade reading and mathematics comprehension level). 

The architecture enforces zero external dependencies—all vector graphics, sprite layering, coloring shaders, generative music, sound effects, speech synthesis, and procedural curriculum generators run natively via HTML5 `<canvas>`, inline SVG, CSS3, Web Audio API, and `window.speechSynthesis`.

### Core Design Pillars
1. **Strict Modesty & Kawaii-Mythological Aesthetic:** Every leotard, skirt overlay, leg warmer, tiara, wing set, and pet accessory is procedurally engineered to be stylish, vibrant, and strictly modest (high necklines, full-coverage tunics/skirts, opaque leggings/tights) styled in pastel/vibrant Pink (`#FF69B4`), Sky Blue (`#38BDF8`), Royal Purple (`#7E22CE`), Starlight Gold (`#FBBF24`), and Soft Cream (`#FFFDF7`).
2. **Default Dyslexia-Friendly Accessibility:** High-legibility sans-serif typography (`Verdana`, `Trebuchet MS`, `Comic Sans MS` fallback stack), `1.6` line height, `0.06em` letter spacing, `0.14em` word spacing, off-white cream reading backgrounds (`#FFFDF7`) to prevent visual crowding/glare, and high-contrast borders are active by default on first boot.
3. **Anti-Frustration Mastery Loop:** Adaptive difficulty scaling pairs with a deterministic 3-attempt hint trigger (summoning *Professor Hoot* with step-by-step visual scaffolding) and positive-reinforcement *Flawless Streak* rewards.

---

## 2. System Architecture & State Management

### 2.1 Unidirectional Event-Driven State Store (`GameState`)
All game systems read from and dispatch mutations to a centralized singleton `Store` object. Any mutation tagged `{ persist: true }` automatically serializes `GameState` to `localStorage` under the key `starlight_academy_save_v1`.

#### Canonical JSON Save Schema
```json
{
  "schemaVersion": "1.0.0",
  "meta": {
    "playerName": "Starlight Gymnast",
    "createdAt": "2026-01-01T00:00:00.000Z",
    "lastSavedAt": "2026-01-01T00:00:00.000Z",
    "totalPlaytimeSeconds": 0
  },
  "settings": {
    "masterVolume": 0.8,
    "narrationVolume": 0.9,
    "sfxMusicVolume": 0.65,
    "narrationEnabled": true,
    "dyslexiaFontEnabled": true,
    "textScale": 1.0
  },
  "progression": {
    "starGems": 150,
    "starlightSparkles": 0,
    "academyLevel": 1,
    "currentFlawlessStreak": 0,
    "bestFlawlessStreak": 0,
    "unlockedChapter": 1,
    "chapterRecords": {
      "1": {
        "completed": false,
        "bestScore": 0,
        "starsEarned": 0,
        "flawlessCompleted": false,
        "replayCount": 0,
        "sideQuestsCompleted": { "sq1": false, "sq2": false }
      }
    },
    "adaptiveDifficulty": {
      "math_mult": 1.0,
      "math_fractions": 1.0,
      "math_geometry": 1.0,
      "math_measurement": 1.0,
      "math_multistep": 1.0,
      "ela_spelling": 1.0,
      "ela_grammar": 1.0,
      "sci_habitats": 1.0,
      "sci_botany": 1.0
    }
  },
  "wardrobe": {
    "equipped": {
      "skinTone": "#FDE2D2",
      "hairStyle": "twin_ribbons",
      "hairColor": "#6B3E26",
      "leotardStyle": "classic_tunic_skirt",
      "legWarmers": "knit_pastel",
      "headAccessory": "basic_bow",
      "backAccessory": "none",
      "wandStyle": "star_ribbon_wand",
      "ribbonStyle": "silk_gradient"
    },
    "unlockedItems": {
      "hairStyles": ["twin_ribbons", "high_ponytail_puff"],
      "leotardStyles": ["classic_tunic_skirt", "ruffle_sleeve_leotard"],
      "legWarmers": ["knit_pastel"],
      "headAccessories": ["basic_bow"],
      "backAccessories": ["none"],
      "wandStyles": ["star_ribbon_wand"],
      "ribbonStyles": ["silk_gradient"],
      "colors": ["#FF69B4", "#FFB6C1", "#38BDF8", "#BAE6FD", "#7E22CE", "#D8B4FE", "#FBBF24", "#FFFFFF"],
      "stamps": ["star", "heart", "bow"]
    },
    "customTextures": {
      "leotardDataUrl": null,
      "legWarmersDataUrl": null,
      "ribbonDataUrl": null,
      "petCollarDataUrl": null
    }
  },
  "pet": {
    "species": "pegasus",
    "name": "Starbeam",
    "stats": {
      "happiness": 85,
      "hunger": 80,
      "grooming": 90,
      "bondLevel": 1,
      "bondXp": 0
    },
    "appearance": {
      "coatColor": "#FFF5F7",
      "maneColor": "#D8B4FE",
      "hairStyle": "fluffy_curl",
      "collarStyle": "bell_ribbon",
      "collarColor": "#FF69B4"
    },
    "unlockedPetItems": {
      "species": ["pegasus", "phoenix", "nymph_kitten"],
      "hairStyles": ["fluffy_curl"],
      "collarStyles": ["bell_ribbon"]
    },
    "lastInteractionTimestamp": 0
  }
}
```

### 2.2 Rendering Pipeline (Dual-Layer Canvas + Accessible DOM Overlay)
To achieve crisp 60 FPS animations alongside sharp, dyslexia-friendly text and reliable desktop mouse/keyboard focus states, the viewport (`1280x720` responsive aspect-ratio container) uses a hybrid architecture:
1. **Background & Stage Canvas (`#stage-canvas`):** Renders dynamic studio backdrops (evolves with `academyLevel`—adding chandeliers, stained-glass Greek columns, starlight banners, and trophy pedestals), animated floating dust motes, flowing physics-driven gymnastics ribbons (Verlet integration chain of 24 nodes), and animated character/pet sprites.
2. **Interactive DOM UI Layer (`#ui-overlay`):** Semantic HTML5/CSS3 panels (`role="dialog"`, `aria-live="polite"`) for dialogue boxes, educational puzzle widgets, courtyard chapter cards, and settings controls. All interactive controls support both mouse click/drag and keyboard navigation (`Tab`, `Enter`, `Space`, `1–4` hotkeys, `Arrow` keys).
3. **Offscreen Texture Compositor (`OffscreenCanvas` / Hidden `<canvas>`):** Stores player-painted outfits and stamp patterns as `256x256` RGBA buffers. During character rendering, the outfit mask clips the player's custom painted texture cleanly inside the modest leotard and skirt boundaries.

### 2.3 Web Audio API Synthesizer & Generative Music Engine (`AudioEngine`)
Zero external `.mp3`/`.wav` files are used. `AudioEngine` initializes on the first user pointer/key gesture and builds three gain buses routed into a master compressor:
* `masterGain` -> `DynamicsCompressorNode` -> `audioCtx.destination`
* `sfxGain` -> `masterGain` (Sound effects: crystalline bell chimes, pentatonic harp arpeggios, filtered white-noise ribbon whooshes, brush sparkles, pet purrs/chirps, gentle wooden thuds for soft errors)
* `musicGain` -> `masterGain` (Generative ambient music scheduler)

#### Generative Music Chord Progressions
A lookahead scheduler (`setInterval` every `100ms` scheduling Web Audio oscillators `200ms` ahead) plays soft triangle/sine pad chords with low-pass filtering (`800Hz` cutoff) and gentle bell arpeggios that morph smoothly by scene:
* **Studio Hub / Wardrobe:** Lydian bright pastel progression (`Fmaj7` -> `G6` -> `Em7` -> `Am7`) at `84 BPM`.
* **Pet Courtyard:** Cozy major pentatonic lullaby (`Cmaj9` -> `Am7` -> `Fmaj7` -> `Gsus4`) at `76 BPM`.
* **Educational Challenge:** Focused, calm marimba/celesta pulse (`Dm7` -> `G7` -> `Cmaj7` -> `A7`) at `92 BPM` to aid concentration without distraction.
* **Gymnastics Routine:** Uplifting waltz/rhythmic bounce (`Gmaj7` -> `D/F#` -> `Em7` -> `Cmaj7`) at `112 BPM`.

### 2.4 Web Speech API Narration Manager (`NarrationManager`)
* Queries `window.speechSynthesis.getVoices()` on load and `onvoiceschanged`.
* **Voice Selection Heuristic:** Prioritizes natural desktop voices in order: `Microsoft Aria Online`, `Microsoft Jenny Online`, `Microsoft Zira`, `Google US English`, `Samantha`, falling back to the default `en-US` female/neutral voice.
* **Dynamic Mixing:** Sets `pitch = 1.12` and `rate = 0.94` for warm, clear 3rd-grade pacing. Automatically ducks `musicGain` by `-8dB` while speaking and restores volume on `utterance.onend`. Strips decorative symbols/emojis before speaking.

---

## 3. UI/UX Wireframe & Navigation Flow

### 3.1 Screen State Machine
```
[Title / Welcome Overlay]
        │ (Click "Enter Studio" / Press Enter)
        ▼
┌───────────────────────────────────────────────────────────────────┐
│                    CREATIVE STUDIO HUB (Central)                  │
│  Top HUD: [Star Gems] [Sparkles] [Streak] [Pet Mood] [Settings ⚙] │
│  Center: Live Animated Heroine + Custom Outfit + Pet Companion    │
│  Bottom Dock (Mouse Click or Keys 1-5):                           │
│   [1] Academy Courtyard  [2] Wardrobe & Coloring  [3] Pet Care    │
│   [4] Gymnastics Practice [5] Save & Settings Vault               │
└───────┬──────────────────────┬───────────────────────┬────────────┘
        │                      │                       │
        ▼                      ▼                       ▼
[Academy Courtyard]    [Wardrobe & Coloring]   [Pet Bonding Station]
 ├─ 10 Chapter Cards    ├─ Modest Outfit Tabs   ├─ Species Switcher
 ├─ Replay Mode Toggle  ├─ Paint Brush & Sizes  ├─ Feed Magical Treats
 └─ 20 Side Quests      ├─ Pattern Stamps       ├─ Sparkle Grooming
        │               └─ Unlock Shop          └─ Catch-the-Star Game
        ▼
[Chapter Execution Pipeline]
  Phase 1: Story Intro (Narrated Dialogue + Character Portraits)
     │
  Phase 2: 3rd-Grade Educational Challenge (5–8 Adaptive Questions)
     │     └─ [3 Wrong Attempts] ──► Professor Hoot Visual Hint Card
     │
  Phase 3: Gymnastics Ribbon & Routine Showcase (Rhythm + Shape Trace)
     │
  Phase 4: Victory & Reward Summary (Gems, Streak Bonus, Item Unlock)
```

### 3.2 Desktop Mouse & Keyboard Ergonomics
* **Mouse Interactions:** Large hit targets (minimum `48x48px`), hover elevation states with subtle sparkle particles, click-and-drag painting on the coloring canvas, drag-and-drop fraction/word/habitat tiles (with click-to-place accessibility alternative so fine-motor fatigue never blocks progress).
* **Keyboard Shortcuts:**
  * `1`–`4`: Select multiple-choice answers or dialogue responses.
  * `Enter` / `Space`: Advance dialogue, submit puzzle, or hit rhythmic gymnastics cue.
  * `H`: Request hint (highlights counter until 3rd attempt unlocks free hint).
  * `Esc`: Toggle Settings / Pause modal.

---

## 4. Educational Engine & Adaptive Curriculum Design

### 4.1 Parameterized Question Factory (`CurriculumEngine`)
Rather than static multiple-choice arrays that become memorized on replay, each chapter registers procedural generator functions backed by curated 3rd-grade lexical/scientific banks:

| Chapter | Subject & Standard | Procedural Generator Mechanics & Pool Size |
| :--- | :--- | :--- |
| **Ch. 1** | **Math:** Multiplication `1–5` & Skip Counting | Generates `a × b` (`1 <= a <= 5, 1 <= b <= 10`), visual star-array grids (`rows × cols`), and missing-node stepping stones (`3, 6, [?], 12`). **200+ unique combinations.** |
| **Ch. 2** | **Math:** Fractions (`1/2, 1/3, 1/4, 1/6, 1/8`) | Procedurally slices pastel cakes/lyre strings; asks player to shade `n/d`, match equivalent fractions (`1/2 = 2/4 = 4/8`), or compare slices with same numerator/denominator. |
| **Ch. 3** | **ELA:** Spelling, Prefixes & Suffixes | Pool of **80+ 3rd-grade root words** paired with prefixes (`un-`, `re-`, `pre-`, `dis-`, `mis-`) and suffixes (`-ful`, `-less`, `-ly`, `-er`, `-est`, `-ment`) with contextual potion clues. |
| **Ch. 4** | **Math:** Geometry, Perimeter, Area & Angles | Generates rectangles/squares (`3–12` units) for perimeter (`2L + 2W`) & area (`L × W`), classifies right (`90°`), acute (`<90°`), and obtuse (`>90°`) beam angles, and identifies symmetry lines. |
| **Ch. 5** | **Science:** Animal Adaptations & Ecosystems | **48 creature-trait scenarios** across 4 biomes (Alpine Mountain, Whispering Forest, Crystal Reef, Sunlit Desert) matching structural/behavioral adaptations to survival. |
| **Ch. 6** | **Science:** Plant Biology & Photosynthesis | Interactive growth simulator requiring exact sequencing of 5 life-cycle stages plus balancing Water, Sunlight, and Carbon Dioxide inputs to bloom star-flowers. |
| **Ch. 7** | **ELA:** Parts of Speech & Reading Comprehension | **60+ dynamic sentences** highlighting target Nouns, Verbs, Adjectives, and Adverbs, plus 12 multi-sentence Greek myth micro-passages with main-idea & inference questions. |
| **Ch. 8** | **Math:** Liquid Volume, Mass & Elapsed Time | Potion beaker reading (`100mL–1000mL`), balance scale gram/kilogram arithmetic, and analog/digital clock elapsed time (`+15m`, `+25m`, `+40m`) for routine scheduling. |
| **Ch. 9** | **Math:** Multi-Digit `+/-` & Division Sharing | 3-digit addition/subtraction with regrouping (`125 + 248`, `412 - 165`) and equal-group division (`24 gems ÷ 4 pedestals = 6`) for the Chimera's vault. |
| **Ch. 10** | **Cumulative:** Grand Starlight Championship | Weighted sampler pulling across all 9 domains at scaled mastery difficulty (`1.2x–1.5x`) with multi-stage gymnastics combo multipliers. |

### 4.2 Adaptive Difficulty & 3-Attempt Anti-Frustration System
* **Adaptive Rating (`skillRating` in `[0.8, 1.5]`):**
  * First-try correct answer: `skillRating = Math.min(1.5, skillRating + 0.08)`, `currentFlawlessStreak++`.
  * Incorrect answer: `skillRating = Math.max(0.8, skillRating - 0.10)`, `currentFlawlessStreak = 0`, `attemptCount++`.
* **3-Attempt Hint Escalation:**
  * **Attempt 1 Wrong:** Gentle chime + encouraging shake animation ("Almost! Check the numbers carefully and try again!").
  * **Attempt 2 Wrong:** Eliminates one distractor option (in multiple-choice) or highlights a key visual clue ("You're so close! One more try, or Professor Hoot will fly in to help!").
  * **Attempt 3 Wrong:** **Automatic Hint Trigger.** *Professor Hoot* appears on screen with a visual step-by-step breakdown (e.g., showing the multiplication array grouped into rows, highlighting the root word, or drawing a right-angle corner guide) and narrates the clue via `NarrationManager`.

---

## 5. Customization, Coloring & Pet Nurturing Pipeline

### 5.1 Layered Sprite & Modest Wardrobe Architecture
Every character render executes a strict Z-order draw stack on the HTML5 Canvas to guarantee modesty and visual clarity:
1. `Layer 0`: Back Hair & Flowing Gymnastics Ribbon (physics trail)
2. `Layer 1`: Back Accessories (Pegasus Wings, Starlight Cape)
3. `Layer 2`: Base Character Body (head, neck, arms, legs in `skinTone`)
4. `Layer 3`: **Opaque Pastel Tights / Leggings** (always rendered beneath skirts/leotards for full modesty)
5. `Layer 4`: **Modest Leotard & Full Tunic Skirt** (clipped to player's custom `leotardDataUrl` painted canvas)
6. `Layer 5`: Leg Warmers & Ballet/Gymnastics Slippers (clipped to `legWarmersDataUrl`)
7. `Layer 6`: Kawaii Face (large sparkling eyes with dual catchlights, rosy blush ovals, expressive mouth)
8. `Layer 7`: Front Hair Bangs & Side Locks
9. `Layer 8`: Head Accessories (Bows, Athena's Owl Tiara, Star Crown) & Handheld Wand

### 5.2 Interactive Coloring Studio Engine
* **UV Mask Clipping:** Players paint on a dedicated `300x340` interactive canvas showing the selected garment template (Leotard, Leg Warmers, Ribbon, or Pet Collar). A `globalCompositeOperation = 'destination-in'` mask ensures paint strokes and pattern stamps (Stars, Hearts, Bows, Lightning Bolts, Glitter Dust) never bleed outside the garment silhouette.
* **Glitter & Metallic Shaders:** Selecting a metallic/glitter swatch dynamically overlays animated specular star-glints onto the painted pixels during stage rendering.

### 5.3 Pet Companion Nurturing Loop
* **3 Selectable Mythical Kawaii Pets:** *Baby Pegasus* (boosts Leap height & Gem multiplier), *Phoenix Chick* (boosts Streak sparkle bonus), and *Nymph Kitten* (grants 1 free early hint per chapter).
* **Three Care Verbs:**
  1. **Feed Magical Treats** (Starberry Tart, Ambrosia Cupcake, Moonbeam Milk): Restores `+25 Hunger`, `+10 Happiness`, triggers happy hop animation.
  2. **Sparkle Grooming** (Click-and-drag brush over pet on canvas to clear dust puffs and spawn rainbow sparkles): Restores `+30 Grooming`, `+15 Happiness`.
  3. **Play Ribbon Toss** (Click floating star-balls before they drift away): Restores `+25 Happiness`, `+20 Bond XP`.
* **Passive Gameplay Synergy:** When average pet care (`(happiness + hunger + grooming) / 3`) is `>= 80%`, the pet enters **"Starlight Cheer Mode"**, granting `+20% Star Gems` on all gymnastics routines and educational challenges.