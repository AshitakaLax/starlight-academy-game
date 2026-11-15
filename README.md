# Starlight Academy: Studio of Magic & Motion

Modular source project. See `detailed_implementation_plan.md` and `implementation_ledger.md`.

## Structure

- `src/app` — bootstrap, screen router, lifecycle
- `src/core` — state store, event bus, input, save manager
- `src/systems` — audio, narration, curriculum, hints, economy, config
- `src/gameplay` — gymnastics, pets, coloring, chapter runtime
- `src/chapters` — chapter definitions and content data
- `src/side-quests` — side quest definitions and content data
- `src/rendering` — canvas renderer, sprites, effects
- `src/ui` — semantic DOM screens, components, styles
- `src/data` — item catalog, rewards, settings
- `build` — bundling and validation scripts
- `tests` — automated tests

## Development

```sh
npm run dev      # serve src for development
npm run build    # produce single-file HTML in dist/
npm test         # run tests
```
