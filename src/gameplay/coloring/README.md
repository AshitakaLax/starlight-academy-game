# Coloring gameplay

The Coloring Studio owns garment mask templates, clipped drawing operations, undo/redo, and the compact saved design representation. It does not own wardrobe item ownership or the global save manager.

- `garmentTemplates.js` provides three validated garment silhouettes: Academy Tunic, Comet Dance Dress, and Starlight Cape. Each template carries a bounded polygon mask and optional seam/accent paths. Every drawing tool checks the same raster mask before changing a pixel.
- `textureCodec.js` stores a 64 × 80 indexed-color texture as a palette and bounded run-length string. Imports validate the version, dimensions, palette, run count, indices, exact pixel coverage, and encoded size before state can accept them.
- `coloringState.js` adds the active garment and a separate design texture for each template to the save payload. Older saves receive the default blank design map without losing existing progress.
- `coloringActions.js` accepts only registered templates and validated encoded textures. Design changes are regular immutable state transitions and therefore participate in autosave, backup export, and import.
- `createColoringService.js` implements a clipped round brush, eraser, star/heart/flower stamps, bounded per-template undo/redo, and reset with an explicit confirmation flag. A drag is committed once when the pointer is released, not once per pointer movement.
- `renderColoringCanvas.js` paints the stored indexed texture into the garment silhouette and redraws the outline and seam details for a live preview.
- The Wardrobe screen opens Coloring Studio as a sub-view. Players can switch templates, choose from the color palette, select brush/eraser and brush size, place stamps, undo/redo, or confirm a reset.

The design is saved after each completed brush stroke, stamp, undo, redo, or confirmed reset. History is intentionally session-local; the final design survives reload and JSON save export/import. Texture dimensions are fixed and bounded, so malformed or oversized texture data cannot create unbounded allocations.

Implementation: `STEP-15`.
