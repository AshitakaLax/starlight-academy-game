# Canvas infrastructure

- `createCanvasRenderer` provides deterministic layer ordering, high-DPI resizing, visibility-aware requestAnimationFrame lifecycle, reduced-motion support, error isolation, and disposal.
- `createMaskedTexture` creates a bounded offscreen surface and applies an alpha mask using destination-in composition.
- Canvas draw callbacks are presentation-only. Gameplay clocks, rhythm scoring, and curriculum progress must be driven by system state rather than animation-frame frequency.
