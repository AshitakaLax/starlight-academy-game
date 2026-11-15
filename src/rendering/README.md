# Rendering boundary

The rendering layer draws presentation only. It does not update progression, curriculum evidence, rewards, pet stats, saves, or gameplay timers.

## Canvas engine

- `createCanvasRenderer` manages ordered 2D layers, high-DPI backing resolution, resize observation, animation-frame scheduling, page visibility, scene activation, and cleanup.
- Each layer receives an immutable frame description with CSS-pixel dimensions, pixel ratio, capped frame delta, elapsed presentation time, and frame number.
- Reduced-motion mode draws a static frame without scheduling an animation loop. Inactive scenes and hidden pages cancel scheduled frames.
- Layer errors are isolated so a decorative layer cannot prevent sibling layers from drawing.
- `createMaskedTexture` composes a texture with an alpha mask using `destination-in`, preferring OffscreenCanvas with a detached-canvas fallback.
- The hub scene demonstrates separate background, student-character, Pegasus-companion, and sparkle-effect layers. Essential text and controls remain DOM-based.

Rendering modules never fetch assets at runtime. Future assets must be local imports or generated primitives embedded by the offline build.
