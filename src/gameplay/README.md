# Gameplay modules

This layer contains player-facing activities and orchestration:

- \`chapters/\` — data-driven chapter runtime and checkpoints.
- \`gymnastics/\` — trace paths, beat checkpoints, independent scores, and no-failure completion.
- \`pets/\` — independent pet collection state, care activities, and active-pet ability selection.
- \`coloring/\` — garment templates, paint tools, and custom design operations.
- \\`wardrobe/\\` — cosmetic item catalog, ownership sources, saved inventory, equipment slots, and wardrobe service.

Gameplay modules own activity rules but not global persistence, currency balances, or DOM presentation. They request those capabilities through injected system interfaces and named actions.
