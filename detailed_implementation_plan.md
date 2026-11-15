# Starlight Academy: Studio of Magic & Motion
## Revised Gameplay, Architecture & Engineering Implementation Plan

**Document purpose:** Authoritative design specification for the complete first release. This document describes the intended player experience, gameplay rules, technical architecture, and quality requirements. The Engineering Implementation Ledger turns these requirements into ordered, testable work items.

**Release target:** All 10 chapters and all 20 side quests in one self-contained HTML deliverable.

---

## 1. Product vision and confirmed decisions

*Starlight Academy: Studio of Magic & Motion* is a desktop educational adventure for a young player. It combines learning, gymnastics-inspired rhythm and tracing activities, magical pet companionship, and creative customization. The four pillars should feel like parts of one imaginative academy rather than four unrelated applications.

### 1.1 Confirmed product requirements

| Area | Requirement |
|---|---|
| Development source | Organize the project into multiple maintainable source files. |
| Final delivery | Build one self-contained `.html` file that runs locally without a server or internet connection. |
| Supported platform | Desktop/laptop with mouse and keyboard. Mobile and tablet are not release targets. |
| Supported browsers | Google Chrome and Microsoft Edge. |
| Gameplay balance | Education, gymnastics, pets, and customization are all important pillars. |
| Chapter structure | Each chapter may use its own story structure, activity sequence, and gameplay mechanics. Do not force every chapter into one identical template. |
| Educational adaptation | Adjust difficulty to the player's demonstrated ability, independently by skill. The game should begin near the intended third-grade content range but must not assume that every skill is at the same level. |
| Gymnastics | Combine tracing and rhythm in the same routine. |
| Gymnastics scoring | Score tracing accuracy and rhythm timing. Award stars for performance, but never make a missed cue or low score a hard failure. |
| Pets | All three mythical pet species are collectible. Each has individual saved progress. Care is optional and pet statistics never decrease automatically, including while the game is closed. |
| Pet abilities | Each species has a distinct gameplay bonus. Bonuses must not change educational question difficulty or the correctness of learning assessments. |
| Currency | Star Gems are spendable. Starlight Sparkles are a non-spendable record of mastery and achievements. |
| Rewards | Major, important items are earned through chapters and quests. Optional accessories may be purchased with Star Gems. |
| First release | Include all ten chapters and twenty side quests. A Chapter 1 prototype is an early validation milestone, not a reduced release scope. |

### 1.2 Design pillars

1. **Magical, modest, expressive art direction.** Use the established pastel and jewel-tone palette: Pink (`#FF69B4`), Sky Blue (`#38BDF8`), Royal Purple (`#7E22CE`), Starlight Gold (`#FBBF24`), and Soft Cream (`#FFFDF7`). Character outfits remain modest by design: high necklines, opaque leggings or tights, and full-coverage tunic or skirt layers.
2. **Welcoming learning.** Mistakes are information, not punishment. Explain, scaffold, and invite another attempt. Do not use harsh failure screens, lost progress, or time pressure as the default learning experience.
3. **Player agency.** Let the player explore, replay, customize, care for pets, and choose optional activities without being forced to maintain daily streaks or pet needs.
4. **Visible progress.** Learning mastery, chapter completion, collectible rewards, pet bonds, and creative work should be easy to see and understand.
5. **Offline ownership.** The released HTML file and the player's save data should remain usable without network access.

---

## 2. Core experience and progression

### 2.1 Academy hub

The academy hub is the player's central place to explore. It should provide access to:

- Chapter and side-quest discovery.
- Gymnastics practice and previously unlocked routines.
- Wardrobe and coloring studio.
- Pet collection and pet-care activities.
- The Star Gem shop.
- Progress, mastery, achievements, and settings.

The hub may evolve visually as the player completes chapters. Display Star Gems, Starlight Sparkles, chapter progress, and the active pet without overcrowding the screen.

### 2.2 Chapters have individual structures

Every chapter must have a distinct theme, story, learning mechanic, and activity sequence. Reuse common services and interface conventions, not a mandatory four-stage sequence.

A chapter may include some or all of the following: story scenes, exploration, educational puzzles, gymnastics routines, pet interactions, creative tasks, character encounters, optional challenges, and a celebratory ending. The content designer decides the sequence that best serves that chapter's theme.

**Shared chapter invariants:**

- The player can understand the chapter's goal and controls before being assessed.
- The chapter includes meaningful educational content aligned to its stated learning objectives.
- The player receives clear feedback and access to appropriate hints.
- Progress is saved at safe checkpoints.
- Completing the chapter advances progression and grants its defined major reward, without requiring a perfect score.
- The player can replay completed content without losing previously earned progress or items.

### 2.3 Ten-chapter content map

The following themes and learning topics are carried forward from the original plan. The specific activity structure is intentionally allowed to vary by chapter.

| Chapter | Theme | Learning focus | Distinctive activity direction |
|---|---|---|---|
| 1. The Ribbon of Multiplication | Hermes and the ribbon studio | Multiplication facts from 1–5; skip counting; arrays | Build and use star arrays, then apply patterns in a stepping-stone or ribbon routine. This chapter is the first complete playable vertical slice. |
| 2. Apollo's Musical Fractions | Apollo's music room | Fractions, visual parts, equivalent fractions | Assemble measures, fraction bars, or musical patterns so the player sees how equal parts make a whole. |
| 3. Spellbook of Spelling & Root Words | Potion classroom | Spelling, roots, prefixes, suffixes, context | Build valid words from components and use them to solve a story-based potion task. |
| 4. Geometry on the Balance Beam | Geometry studio | Shapes, symmetry, angles, perimeter, area | Trace and construct shapes, identify angles, and use geometry in a beam-themed course. |
| 5. Artemis and the Magical Habitats | Wildlife sanctuary | Habitats, ecosystems, structural and behavioral adaptations | Investigate creature clues and match each creature to a suitable habitat and survival strategy. |
| 6. Demeter's Enchanted Greenhouse | Magical greenhouse | Plant structures, life cycle, photosynthesis inputs | Grow and care for a plant by sequencing stages and selecting the resources plants need. |
| 7. Athena's Logic & Word Wizardry | Academy library | Parts of speech, reading comprehension, main idea, inference | Repair a story or library puzzle by interpreting sentences and passages in context. |
| 8. Poseidon's Volume & Measurement Lab | Potion laboratory | Liquid volume, mass, units, elapsed time | Measure, compare, fill, and schedule through interactive laboratory tasks. |
| 9. The Chimera's Multi-Step Challenge | Grand vault | Multi-digit addition/subtraction, division, multi-step reasoning | Solve connected steps to open the vault; hints scaffold the reasoning rather than only giving the result. |
| 10. The Grand Starlight Championship | Academy celebration | Cumulative review across previously introduced skills | A multi-event finale that samples learned skills and showcases the player's gymnastics, outfit, and pets. |

### 2.4 Twenty side quests

Provide exactly two optional side quests for each of the ten chapters. Side quests should extend or apply the chapter's subject rather than simply repeat the chapter's main questions with larger numbers.

Recommended pattern for each chapter:

- **Side quest A — mastery extension:** a new puzzle format or a slightly more complex application of the chapter skill.
- **Side quest B — playful application:** use the skill to help a character, pet, academy location, or story situation.

Side quests award their own completion records and defined rewards. They must be optional; no side quest may block the main chapter sequence or the chapter's major reward. The detailed quest briefs, generated content pools, hints, and acceptance tests must be authored as content data before implementation.

---

## 3. Educational engine and adaptive difficulty

### 3.1 Starting level: learn through play, not a long placement test

Do not begin with a formal, lengthy diagnostic exam. Start with a short, friendly onboarding sequence that explains controls and samples a small number of foundational activities. Use the first encounters with each skill to establish the player's starting level.

- Begin near the original target range of third-grade content, but treat this only as an initial estimate.
- Maintain separate mastery records for individual skills. A player may be advanced in multiplication and need more support in fractions, spelling, or measurement.
- Do not infer skill from response speed. The player should have enough time to think and use visual aids.
- Allow a parent/player setting to select a gentler, standard, or more challenging starting preference, while continuing to adapt from actual play.
- Explain that difficulty adjusts to help the player learn; never label the player as behind, low ability, or failing.

### 3.2 Skill model

Each educational activity declares one or more skill identifiers, for example:

- `math.multiplication.facts_1_to_5`
- `math.fractions.identify_parts`
- `ela.spelling.prefixes`
- `ela.grammar.parts_of_speech`
- `science.habitats.adaptations`
- `science.botany.plant_lifecycle`
- `math.measurement.elapsed_time`
- `math.multistep.reasoning`

Each skill stores a current difficulty tier, recent evidence, a mastery estimate, and the date/sequence of the last update. Keep these records independent.

### 3.3 Recommended adaptation rule

Use four named tiers for each skill: **Foundation**, **Developing**, **Core**, and **Stretch**. Start at **Core** by default unless onboarding preference or early play indicates a better starting tier.

Use the most recent five meaningful attempts for a skill as a rolling evidence window. Each attempt records correctness, whether a hint was used, and whether the player needed a worked demonstration. Do not use speed as a mastery signal.

Proposed initial adjustment rules (tune after playtesting):

- Move up one tier when at least four of the last five attempts are independently correct, without a full worked demonstration.
- Move down one tier when two or fewer of the last five attempts are solved, or repeated full demonstrations are needed.
- Otherwise keep the same tier.
- Never move more than one tier in a single update.
- Keep a minimum and maximum tier; never make a skill easier or harder without bound.
- Do not reduce chapter access, remove rewards, or erase completion when difficulty changes.

The five-attempt window and thresholds are initial balancing parameters, not claims about a validated educational assessment. Store them centrally so they can be tuned without rewriting chapter content.

### 3.4 Question and activity generation

Each generator must declare:

- Skill identifier and supported difficulty tiers.
- Learning objective and prerequisite skills, if any.
- Question/activity type and allowed parameter ranges.
- Correct-answer logic and distractor rules.
- Visual representation rules and accessible alternative interaction.
- Hint steps, including the worked demonstration.
- Feedback messages for correct and incorrect actions.
- Content source/pool and any randomization constraints.

Generators must be deterministic when supplied the same seed and parameters. This enables reproducible bug reports and automated tests. Prevent invalid questions, duplicate answer choices, ambiguous wording, and distractors that are accidentally correct.

### 3.5 Hint escalation and retry behavior

Keep Professor Hoot as the friendly guide. A recommended default escalation is:

1. **First incorrect attempt:** gentle, non-judgmental feedback; invite the player to try again.
2. **Second incorrect attempt:** reveal a visual clue, highlight a relevant part, or eliminate one distractor where appropriate.
3. **Third incorrect attempt:** demonstrate the reasoning step by step, with optional narration.
4. **After the demonstration:** let the player answer a parallel or retry question so the player can apply what was shown.

The exact hint sequence may be overridden by an activity when a different form of scaffolding is more suitable. A hint must not permanently block completion or rewards. Record hint use for learning analytics, but do not shame the player or make it a reason to deny the chapter reward.

---

## 4. Gymnastics rhythm-and-tracing system

### 4.1 Core interaction

The gymnastics activity combines a visual tracing path with a rhythmic sequence. The recommended interaction is **trace along a path while passing checkpoints on the beat**:

1. Show the routine's path, beat markers, and a short animated demonstration.
2. Give a clear count-in so the player can anticipate the tempo.
3. The player presses and holds the mouse button (or uses an equivalent supported keyboard control) and traces the visible path.
4. Place visual checkpoints along the path at rhythmic beats. Reaching a checkpoint near its beat earns timing credit.
5. The routine continues even when the player misses a checkpoint, drifts from the path, or stops tracing.
6. At the end, show tracing accuracy, rhythm timing, the combined result, and encouraging feedback.

Short phrases are preferable to one long uninterrupted trace. Introduce only a few checkpoints at first and increase complexity gradually.

### 4.2 Two independent performance measures

- **Tracing accuracy:** how closely the player's trace follows the intended path, normalized to a 0–100 score.
- **Rhythm timing:** how accurately the player reaches beat checkpoints, normalized to a 0–100 score.

The combined routine score is initially the equal-weight average of the two measures:

`combinedScore = (tracingAccuracy + rhythmTiming) / 2`

Also retain both component scores. Do not allow a very high score in one dimension to completely conceal a very low score in the other when awarding stars.

### 4.3 Star ratings and no-hard-failure policy

Recommended starting thresholds for playtesting:

- **1 star:** the player reaches the end of the routine. No minimum score is required.
- **2 stars:** tracing accuracy and rhythm timing are each at least 60.
- **3 stars:** tracing accuracy and rhythm timing are each at least 85.

These thresholds are proposed tuning values. They must be playtested with the intended player and adjusted if they feel discouraging or too easy.

A missed cue never ends a routine. Do not show a failure state, remove previously earned stars, deduct currency, or prevent chapter completion because of performance. The player may replay to improve a personal best, but replay is optional.

### 4.4 Accessibility and progression

- Provide a visible count-in, clear checkpoint indicators, and a practice demonstration.
- Support adjustable tempo or an easier practice speed. Tempo choice must not create a punitive experience.
- Offer a non-drag or keyboard-accessible alternative for routine navigation where feasible, while retaining the main trace-and-rhythm experience.
- Use generous timing windows at introductory tiers and tune them with playtesting.
- Make the trace path visually distinct from background art.
- Separate player performance from character animation: a missed input may change the flourish, but must not produce an injury or humiliating animation.
- Record best score, best tracing score, best rhythm score, stars, and play count per routine.

---

## 5. Pet collection, care, and abilities

### 5.1 Collectible pet collection

The player can collect all three species: **Baby Pegasus**, **Phoenix Chick**, and **Nymph Kitten**. Each pet has its own saved record, including:

- Unlocked/owned status.
- Name and appearance/customization.
- Bond level and bond experience.
- Positive care-progress values (for example joy, nourishment, and grooming).
- Interaction history or achievement flags.

The player may choose an active companion. Switching the active pet must not delete, reset, or reduce another pet's progress. The exact chapter or quest that unlocks each species must be defined in the chapter reward table before implementation.

### 5.2 No-decay, optional care

Pet care is an optional positive activity, not a maintenance obligation.

- No pet statistic decreases with real time, play time, inactivity, or closing the game.
- Do not simulate starvation, neglect, sickness, sadness caused by absence, or lost bond.
- Prefer positive progress labels such as **Joy**, **Nourishment**, and **Grooming** over need meters that imply a pet is suffering.
- Care actions may increase a pet's care progress and bond experience. Values may cap at 100; reaching the cap must not cause a penalty.
- When a meter is full, the interaction can still provide an animation, dialogue, or small bond/collection credit without requiring the player to repeat care.
- Pet care never blocks chapters, routines, or rewards.

### 5.3 Care activities

Retain and refine the original three verbs:

1. **Feed magical treats:** choose a snack and watch a positive reaction; advance Nourishment and bond progress.
2. **Sparkle grooming:** brush the pet using mouse movement; clear visible sparkle/dust effects and advance Grooming and bond progress.
3. **Play ribbon toss or a related mini-game:** catch or toss floating star-balls; advance Joy and bond progress.

Use click-to-interact or other forgiving alternatives if continuous dragging is frustrating. Care interactions should have clear start/end states and should not require precision to earn a small reward.

### 5.4 Distinct pet abilities

Each species has a different optional gameplay bonus. Only the active pet's ability is active at a time; bonuses do not stack. The player may change the active pet from a safe hub screen.

Recommended initial abilities:

- **Baby Pegasus — Graceful Flight:** a small bonus to Star Gem rewards from completed gymnastics routines. It does not inflate tracing or rhythm accuracy.
- **Phoenix Chick — Spark Reprise:** an additional Starlight Sparkle bonus for achieving or improving a personal-best streak/achievement. It does not change question difficulty.
- **Nymph Kitten — Curious Insight:** one optional extra hint token in a chapter. It supplements the normal hint system and never forces an answer or blocks mastery credit.

These are proposed initial effects. Exact bonus values and limits must be set in the balancing table. No pet ability may change the correctness rules for an educational question or the mastery evidence recorded for a skill.

---

## 6. Rewards, currency, shop, and unlocks

### 6.1 Two separate progression currencies

| Currency | Purpose | Spendable? |
|---|---|---|
| **Star Gems** | Earned through defined gameplay rewards and used to purchase optional accessories and cosmetic items. | Yes |
| **Starlight Sparkles** | A visible record of mastery, achievements, and learning milestones. | No |

Sparkles must never be required to purchase an item. Do not display a Sparkles balance in a shop as though it were money.

### 6.2 Chapter rewards versus shop inventory

- Major story, chapter, and quest identity items are earned directly by completing their associated content.
- Those major rewards are not sold in the shop; the player should not be able to bypass the chapter achievement by purchasing them.
- Optional accessories, color palettes, decorative patterns, and other non-critical cosmetics may be purchased with Star Gems.
- Display the price and a preview before purchase. Confirm purchases and prevent accidental double spending.
- Purchased items remain unlocked permanently in the save.

### 6.3 Economy rules to finalize and centralize

The exact Star Gem amounts, accessory prices, pet unlock milestones, and replay reward caps require balancing. Store all values in one economy configuration rather than scattering numbers through chapter code.

Required rules:

- Every reward has a unique reward ID, source, currency type, amount, and repeat policy.
- First-time chapter and side-quest rewards are granted once.
- Replays may improve records and grant explicitly configured replay bonuses, but must not enable unlimited reward farming through repeated identical completions.
- A reward transaction must be atomic: the player receives the reward and the corresponding progress record is saved together.
- The player must never be charged for a major chapter-exclusive item.
- Show a clear message when the player does not have enough Star Gems; never subtract a negative balance.

The initial save may retain the original proposed 150 Star Gems starting balance, but this should be treated as a balance parameter to confirm during playtesting.

---

## 7. Wardrobe and creative customization

### 7.1 Character customization

Retain the layered character rendering concept. The character should support skin tone, hairstyle, hair color, modest outfit style, opaque tights/leggings, leg warmers, head accessories, back accessories, wand, and ribbon style.

All unlock conditions must be explicit. Separate:

- Default items available at first launch.
- Chapter/quest rewards.
- Star Gem shop purchases.
- Equipped items.

An item cannot be equipped unless it is unlocked or owned.

### 7.2 Coloring studio

The player may paint and stamp patterns on supported garments and accessories. The editor must provide:

- Clear selection of the current item/template.
- Color palette and brush size.
- Paint, erase, and pattern stamp tools.
- Undo and redo (recommended) and a reset-to-default option with confirmation.
- Mask clipping so paint remains within the selected silhouette.
- A live preview on the character.
- Save/load persistence for custom designs.

Store custom textures efficiently. Use appropriately sized, compressed image data and validate data URLs during import. Do not assume that unlimited canvas image data will fit in browser storage.

---

## 8. Technical architecture and offline packaging

### 8.1 Source project versus delivered artifact

The source project should use multiple logical files for maintainability. A suggested structure:

```text
src/
  app/             # bootstrap, screen router, lifecycle
  core/            # state store, event bus, input, save manager
  systems/         # audio, narration, curriculum, hints, economy
  gameplay/        # gymnastics, pet care, coloring, chapter runtime
  chapters/        # chapter definitions and content data
  side-quests/     # twenty quest definitions and content data
  rendering/       # canvas renderer, sprites, effects
  ui/              # semantic DOM screens, components, styles
  data/            # item catalog, rewards, settings, localization
build/             # single-file bundling and validation scripts
```

The exact folder names may change, but each system should have clear boundaries and a stable interface. Chapter and side-quest content should be data-driven wherever practical.

A build step bundles the sources and embeds required CSS, JavaScript, curriculum data, vector art, and audio generation code into one HTML file. Build-time tooling is permitted; the final player-facing file must not load scripts, styles, fonts, images, audio, or data from the internet or external files.

### 8.2 Runtime architecture

Use a unidirectional event-driven state store:

- Systems read state through defined selectors.
- Gameplay actions dispatch named actions/events.
- State transitions are validated and deterministic.
- Rendering responds to state changes; rendering code does not directly mutate progression.
- Persistence is triggered by validated state changes and safe checkpoints.

Keep curriculum logic, reward logic, pet abilities, and chapter content separate from UI rendering. A chapter should call shared APIs rather than directly modifying unrelated systems.

### 8.3 Rendering

Retain the hybrid rendering approach:

1. **Stage canvas:** character and pet sprites, scene backdrops, ribbon effects, particles, and visual gymnastics.
2. **Accessible DOM layer:** dialogue, question controls, settings, inventory, chapter selection, and all essential text.
3. **Offscreen canvas or hidden canvas:** texture masks and custom-paint buffers.

The stage may target 60 FPS on supported desktop hardware, but gameplay correctness must not depend on frame rate. Use elapsed-time animation and cancel or pause animation loops when a screen is hidden.

Canvas is for visual presentation. Essential instructions, scores, feedback, and controls remain accessible as DOM content.

### 8.4 Audio and narration

Use Web Audio API synthesis for music and sound effects, with separate master, music, and SFX gain controls. Start audio only after a user gesture where browser policy requires it. Provide a mute option and graceful behavior when audio is unavailable.

Use `window.speechSynthesis` as optional narration, not as a required source of instructions. Available voices differ by device and installation; never assume a named voice or an internet connection. All narrated content must also appear as readable on-screen text. If no suitable voice exists, continue silently without blocking gameplay.

### 8.5 Browser and offline requirements

- Target current stable desktop versions of Chrome and Edge.
- No mobile/tablet optimization is required for this release.
- No external network calls at runtime.
- No external fonts, CDNs, analytics, remote APIs, or hosted assets.
- Verify opening the delivered HTML file locally in Chrome and Edge.
- Verify that audio, rendering, game controls, import/export, and core gameplay work with network access disabled.
- Test local persistence in both target browsers. Provide a visible save-health indicator and a JSON export/import backup path.

### 8.6 Input and navigation

Mouse and keyboard are the supported input methods. Every essential action must be possible with at least one supported input method; use keyboard alternatives for drag-heavy interactions where feasible.

Contextual shortcuts:

- `1–4`: select a multiple-choice answer when a multiple-choice screen is active.
- `1–5`: navigate the corresponding hub dock item only while the hub is active.
- `Enter` or `Space`: activate the focused primary action or advance dialogue when appropriate.
- `H`: request a hint when the current activity supports hints.
- `Esc`: close a modal or open/pause settings according to current screen state.

Shortcuts must be context-aware, ignored while typing into text fields, and must not cause two actions from one key press.

---

## 9. State, save schema, and recovery

### 9.1 Save model

The save must include at minimum:

- `schemaVersion` and save timestamps.
- Player settings and accessibility preferences.
- Star Gems and Starlight Sparkles.
- Academy level and unlocked/completed chapter state.
- Per-chapter records and 20 side-quest records.
- Per-skill adaptive difficulty and recent mastery evidence.
- Wardrobe ownership, purchases, equipment, and custom textures.
- The full pet collection with independent state for Pegasus, Phoenix, and Nymph Kitten.
- Gymnastics routine best scores, component scores, and stars.
- Achievement flags and total play time.

Suggested pet model:

```json
{
  "activePetId": "pegasus",
  "pets": {
    "pegasus": {
      "unlocked": true,
      "bondLevel": 1,
      "bondXp": 0,
      "careProgress": { "joy": 0, "nourishment": 0, "grooming": 0 },
      "appearance": {}
    },
    "phoenix": {
      "unlocked": false,
      "bondLevel": 1,
      "bondXp": 0,
      "careProgress": { "joy": 0, "nourishment": 0, "grooming": 0 },
      "appearance": {}
    },
    "nymphKitten": {
      "unlocked": false,
      "bondLevel": 1,
      "bondXp": 0,
      "careProgress": { "joy": 0, "nourishment": 0, "grooming": 0 },
      "appearance": {}
    }
  }
}
```

This is a structural example, not the complete save object. Care progress is positive and non-decaying; it is not a timer-driven need system.

### 9.2 Persistence and recovery

- Persist after important progression changes and at safe checkpoints; debounce frequent cosmetic edits.
- Validate imported JSON before applying it. Reject malformed or unsupported data with a useful explanation.
- Include schema versioning and migration functions for future releases.
- Protect the current save when importing: preview the import and ask before replacing existing progress.
- Provide JSON export and import as a backup/restore mechanism.
- Handle unavailable storage, quota errors, corrupted saves, and interrupted writes gracefully.
- Never reset progress silently. Offer recovery or a clear export/import path.

---

## 10. Accessibility, usability, and child-friendly safeguards

- Use clear sans-serif typography, comfortable line spacing, adjustable text scale, and high-contrast focus indicators. Font and spacing settings should be adjustable; do not claim one font is universally dyslexia-friendly.
- Use large, consistent click targets and obvious hover/focus/pressed states.
- Provide readable on-screen equivalents for all narration.
- Allow reduced motion and control over music, SFX, and narration separately.
- Do not rely on color alone to communicate correctness, selection, or status.
- Provide alternatives to drag-and-drop where feasible.
- Avoid timers in core educational tasks. When rhythm timing is the activity, use forgiving windows and practice options.
- Use encouraging language. No humiliating error animations, lost progress, punitive streak resets, or pet-neglect messages.
- No external chat, social sharing, advertising, analytics, or account sign-in is part of this offline release.

---

## 11. Quality requirements and definition of done

The first release is complete only when all ten chapters and all twenty side quests are implemented and verified.

### 11.1 Functional quality gates

- Every chapter and quest can be started, completed, replayed where applicable, and exited safely.
- No chapter requires a perfect score to complete or earn its major reward.
- Adaptive difficulty is tracked per skill and behaves within the configured tier limits.
- Hints work for each supported activity and never dead-end the player.
- Gymnastics always completes; tracing and rhythm scores are recorded separately and combined consistently.
- Pet progress is independent for all owned pets and never decreases automatically.
- Star Gem spending cannot produce a negative balance; major chapter items cannot be purchased to bypass progression.
- Sparkles are never spent.
- Custom outfits and all progression survive a save/reload and export/import round trip.
- All required functionality works offline in Chrome and Edge.

### 11.2 Test requirements

For every chapter, quest, and activity, include tests for:

- Normal completion.
- Incorrect answers and all hint stages.
- Boundary values and random generator edge cases.
- Keyboard and mouse control paths.
- Save/reload during and after progress checkpoints.
- Replay and reward repeat rules.
- Reduced-motion and audio-disabled modes where applicable.

For the build, test the final HTML file itself—not only the development server or source project.

### 11.3 Release checklist

- All 10 chapter content briefs and 20 quest briefs approved.
- All learning objectives and question generators reviewed for correctness and age appropriateness.
- All reward values, item prices, pet unlocks, and ability values centralized and playtested.
- Chrome and Edge offline tests pass.
- No uncaught console errors during the full content test pass.
- Save import/export and corrupted-save recovery tests pass.
- Final deliverable is one HTML file with no runtime network dependencies.

---

## 12. Open balancing/content items (not architectural blockers)

These values need to be filled into centralized content/configuration tables before their related tasks are considered complete:

1. Exact Star Gem reward amounts, accessory prices, and replay reward caps.
2. Which chapter or side quest unlocks Phoenix and Nymph Kitten.
3. Exact numeric effect and limit for each pet ability.
4. Final gymnastics timing windows, trace tolerances, and star thresholds after playtesting. Initial recommended star thresholds are documented in Section 4.3.
5. Final question pools, story dialogue, and the forty side-quest activity/reward details.
6. Starting Star Gem balance (150 is retained as an unconfirmed initial proposal).

These should be resolved in data tables and content briefs, not through ad hoc assumptions in gameplay code.