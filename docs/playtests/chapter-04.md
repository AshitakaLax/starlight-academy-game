# Chapter 4 implementation and playtest notes

**Review date:** 2026-11-16  
**Scope:** Geometry on the Balance Beam, including shape properties, symmetry, angle classification, rectangle perimeter and area, hints, chapter progression, and replay rewards.

## Implemented content

- Five tiered activities aligned to the existing shape-recognition, symmetry, angles, perimeter, and area skill IDs.
- Shape diagrams that pair side and corner clues with a labeled polygon.
- Symmetry questions with fold-line diagrams for equilateral triangles, squares, rectangles, rhombi, regular pentagons, and regular hexagons.
- Angle questions with a drawn angle and degree label; practice includes acute, right, obtuse, and straight angles.
- Perimeter and area challenge questions with labeled rectangle dimensions and visible unit-square grids.
- Three-stage Professor Hoot nudges, strategies, and worked demonstrations for all five activities.
- Chapter 3 prerequisite, saved checkpoints, resume, replay, and a once-only Geometry Star Pin reward.

## Automated verification

The regression suite covers all three difficulty tiers, deterministic question generation, distinct choices, shape and symmetry properties, exact angle classification, perimeter and area formulas, hint stages, chapter prerequisite gating, checkpoint resume, and one-time reward replay.

## Remaining desktop and learner checks

1. Run the GitHub Actions syntax check, Node regression suite, and standalone HTML build.
2. Open the packaged file in desktop Chrome and Edge. Check that shape, symmetry, angle, and rectangle diagrams are visible and accessible.
3. Play through all five geometry stations at Foundation, Core, and Stretch settings. Confirm that angle labels and measurement units remain legible.
4. Observe a representative learner identifying shapes, counting symmetry lines, and distinguishing perimeter from area without coaching.
5. Check Tab/Enter and number shortcuts, Professor Hoot hints, text scaling, reduced motion, narrow desktop sizes, checkpoint resume, save/reload, and reward replay.

**Gate:** Chapter 4 is implemented with source-level and automated checks. Live desktop and learner observations are still required before mass content production.
