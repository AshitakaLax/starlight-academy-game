# Pet collection, care, and abilities (STEP-16–18)

- `petCatalog.js` defines validated, immutable Pegasus, Phoenix, and Nymph Kitten definitions, stable IDs, species-specific appearance palettes, and one starter companion (Pegasus).
- `petCollectionState.js` owns the serializable `petCollection` save domain. Each pet has independent unlock source, palette selection, bond experience, and feeding/grooming/play progress counters. Selectors normalize older or malformed optional fields without sharing progress between companions.
- `petActions.js` validates unlock, active-pet, appearance, and care actions. Locked companions cannot be selected, customized, or receive care; unlock source IDs are recorded.
- `createPetCollectionService.js` exposes collection snapshots, unlocks, active selection, per-pet appearance updates, and the `performCare` API. It never resets another pet's state when switching.
- Feeding, grooming, and ribbon play are optional actions. Each awards +25 to its own bounded care meter (maximum 100) and +5 bond experience. A care moment is recorded separately, so using an activity while its meter is full still gives positive friendship progression.
- Care progression settings live in `gameConfig.petCare`. Action payloads contain only pet ID and care type; callers cannot choose their own progress or bond rewards.
- `gameConfig.petAbilities.definitions` assigns one unique, species-specific ability to each companion. Pegasus's Skyward Shine adds 10 care points to grooming, Phoenix's Ember Treat adds 10 to feeding, and Nymph Kitten's Ribbontail Whirl adds 10 to ribbon play.
- `petAbilities.js` derives one active ability from the saved active pet. Only a matching care interaction performed for that active pet receives its bonus. Switching companions immediately replaces the bonus; inactive pet interactions receive only the base care amount.
- Ability configuration affects only optional care-meter progression. It is not read by question generation, adaptive difficulty, hint selection, answer validation, or curriculum mastery.
- The browser initializes pet collection defaults before save restoration; the existing default merge keeps legacy saves compatible.
- The Pets destination displays the collection, locked/unlocked status, active companion, appearance palette, care meters, and one-click treat feeding, sparkle grooming, and ribbon-toss play. Each card displays its ability, while the active companion's ability is highlighted and summarized in the Pets status area.

No elapsed-time or inactivity logic exists in the collection model, so care and bond progress cannot decay.



## Animated companion presentation

The Pets screen uses the presentation-only `src/ui/petCharacter.js` helper to render each species as a small inline SVG character. The characters idle with gentle movement and use the selected appearance palette. Feeding, grooming, and ribbon play trigger distinct temporary visual reactions (a happy hop and treat, a sparkle glow, or a playful ribbon flourish). These reactions are not persisted and do not change care, bond, reward, or ability rules. CSS animations respect the academy's reduced-motion preference and the artwork is bundled into the self-contained offline HTML.
