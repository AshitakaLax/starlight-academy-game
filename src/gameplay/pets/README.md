# Pet collection and care (STEP-16–17)

- `petCatalog.js` defines validated, immutable Pegasus, Phoenix, and Nymph Kitten definitions, stable IDs, species-specific appearance palettes, and one starter companion (Pegasus).
- `petCollectionState.js` owns the serializable `petCollection` save domain. Each pet has independent unlock source, palette selection, bond experience, and feeding/grooming/play progress counters. Selectors normalize older or malformed optional fields without sharing progress between companions.
- `petActions.js` validates unlock, active-pet, appearance, and care actions. Locked companions cannot be selected, customized, or receive care; unlock source IDs are recorded.
- `createPetCollectionService.js` exposes collection snapshots, unlocks, active selection, per-pet appearance updates, and the `performCare` API. It never resets another pet's state when switching.
- Feeding, grooming, and ribbon play are optional actions. Each awards +25 to its own bounded care meter (maximum 100) and +5 bond experience. A care moment is recorded separately, so using an activity while its meter is full still gives positive friendship progression.
- Care progression settings live in `gameConfig.petCare`. Action payloads contain only pet ID and care type; callers cannot choose their own progress or bond rewards.
- The browser initializes pet collection defaults before save restoration; the existing default merge keeps legacy saves compatible.
- The Pets destination displays the collection, locked/unlocked status, active companion, appearance palette, care meters, and one-click treat feeding, sparkle grooming, and ribbon-toss play. Special pet abilities remain for STEP-18.

No elapsed-time or inactivity logic exists in the collection model, so care and bond progress cannot decay.

