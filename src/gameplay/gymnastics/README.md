# Gymnastics gameplay — STEP-19

The Gymnastics Studio now has a complete first routine, **Starlight Ribbon Waltz**, and a deterministic, data-driven routine engine.

## Routine flow

1. **Preview:** the player can review the routine before starting.
2. **Count-in:** a four-beat count-in uses the routine's configured tempo.
3. **Tracing:** the player drags a mouse along the normalized ribbon path. A visible Continue control also allows tracing to be skipped.
4. **Rhythm:** the player taps each configured beat checkpoint. A generous timing window accepts early or late taps; missed checkpoints are marked without ending the routine.
5. **Completion:** separate tracing and rhythm scores are recorded, combined with centralized weights, then translated into zero to three stars.

## Rules and persistence

- Routine tempo, trace tolerance, target-sampling spacing, timing window, score weights, star thresholds, and history limits are centrally configured.
- Engine timing is timestamp-based, not frame-rate-based.
- Trace coverage and rhythm precision are measured independently. A missed beat never changes the trace score.
- Every completed session is recorded once. Personal bests are maintained independently for tracing, rhythm, combined score, and stars; the most recent ten runs are retained.
- Progress is part of the ordinary game save and is restored through the existing save-default merge process.
- A soft synthesized tick marks each count-in beat and routine checkpoint when audio is enabled. Rhythm taps work with mouse, touch, Enter, or Space when focused. Sound remains optional and unavailable audio never blocks completion.
- No score, number of stars, or missed cue blocks a player from continuing to the next chapter.

## Module responsibilities

- `gymnasticsCatalog.js` validates routine definitions and owns the starter routine data.
- `gymnasticsEngine.js` owns preview/count-in/trace/rhythm/completion transitions and deterministic scoring.
- `gymnasticsState.js` normalizes save-backed records.
- `gymnasticsActions.js` validates completion actions and updates high-water personal bests.
- `createGymnasticsService.js` creates sessions and records each completed session once.
- `tests/gymnastics.test.js` covers catalog rules, timing boundaries, misses, score aggregation, action validation, and save restoration.
