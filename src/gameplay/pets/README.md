# Pet collection model (STEP-16)

- `petCatalog.js` defines validated, immutable Pegasus, Phoenix, and Nymph Kitten definitions, stable IDs, species-specific appearance palettes, and one starter companion (Pegasus).
- `petCollectionState.js` owns the serializable `petCollection` save domain. Each pet has independent unlock source, palette selection, bond experience, and feeding/grooming/play progress counters. Selectors normalize older or malformed optional fields without sharing progress between companions.
- `petActions.js` validates unlock, active-pet, and appearance actions. Locked companions cannot be selected or customized; unlock source IDs are recorded.
- `createPetCollectionService.js` exposes collection snapshots, unlocks, active selection, and per-pet appearance updates. It never resets another pet's state when switching.
- The browser initializes pet collection defaults before save restoration; the existing default merge keeps legacy saves compatible.
- The Pets destination displays the collection, locked/unlocked status, active companion, and each unlocked pet's appearance palette. It does not yet implement feeding, grooming, play, or abilities; those belong to STEP-17 and STEP-18.

No elapsed-time or inactivity logic exists in the collection model, so care and bond progress cannot decay.

