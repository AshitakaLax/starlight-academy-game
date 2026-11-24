function freezePoint(point) {
  return Object.freeze({ x: point.x, y: point.y });
}

/** Validated, data-driven definition for one trace-and-rhythm routine. */
export function createGymnasticsRoutine(definition = {}) {
  if (!definition || typeof definition !== "object" || Array.isArray(definition)) {
    throw new TypeError("A gymnastics routine must be an object.");
  }
  const { id, title, description, bpm = 96, countInBeats = 4, tracePath, beatCheckpoints } = definition;
  if (typeof id !== "string" || !/^routine\.[a-z0-9-]+$/.test(id)) {
    throw new TypeError("A gymnastics routine ID must use the routine namespace.");
  }
  if (typeof title !== "string" || !title.trim() || title.length > 100) {
    throw new TypeError("A gymnastics routine requires a short title.");
  }
  if (typeof description !== "string" || !description.trim() || description.length > 360) {
    throw new TypeError("A gymnastics routine requires a short description.");
  }
  if (!Number.isFinite(bpm) || bpm < 40 || bpm > 180) {
    throw new RangeError("Routine tempo must be between 40 and 180 beats per minute.");
  }
  if (!Number.isInteger(countInBeats) || countInBeats < 2 || countInBeats > 8) {
    throw new RangeError("A routine count-in must contain 2 to 8 beats.");
  }
  if (!Array.isArray(tracePath) || tracePath.length < 2 || tracePath.length > 64
      || !tracePath.every((point) => point && Number.isFinite(point.x) && Number.isFinite(point.y)
        && point.x >= 0 && point.x <= 1 && point.y >= 0 && point.y <= 1)) {
    throw new TypeError("A routine tracePath must contain 2 to 64 normalized points.");
  }
  if (!Array.isArray(beatCheckpoints) || beatCheckpoints.length < 2 || beatCheckpoints.length > 32
      || !beatCheckpoints.every((beat, index) => Number.isInteger(beat) && beat >= 0
        && (index === 0 || beat > beatCheckpoints[index - 1]))) {
    throw new TypeError("Beat checkpoints must be increasing, non-negative beat numbers.");
  }
  return Object.freeze({
    id,
    title: title.trim(),
    description: description.trim(),
    bpm,
    countInBeats,
    tracePath: Object.freeze(tracePath.map(freezePoint)),
    beatCheckpoints: Object.freeze([...beatCheckpoints])
  });
}

export function createGymnasticsRoutineCatalog(definitions = []) {
  if (!Array.isArray(definitions)) throw new TypeError("Routine definitions must be an array.");
  const routines = new Map();
  for (const definition of definitions) {
    const routine = createGymnasticsRoutine(definition);
    if (routines.has(routine.id)) throw new Error("Gymnastics routine already registered: " + routine.id);
    routines.set(routine.id, routine);
  }
  if (routines.size === 0) throw new Error("At least one gymnastics routine must be registered.");
  return Object.freeze({
    has(id) { return routines.has(id); },
    get(id) { return routines.get(id) ?? null; },
    list() { return Object.freeze([...routines.values()]); }
  });
}

export const defaultGymnasticsRoutines = Object.freeze([
  createGymnasticsRoutine({
    id: "routine.starlight-ribbon",
    title: "Starlight Ribbon Waltz",
    description: "Follow the glowing ribbon, then tap each star as the music reaches its beat. Every try is practice, and every routine reaches its finish.",
    bpm: 96,
    countInBeats: 4,
    tracePath: [
      { x: 0.12, y: 0.58 }, { x: 0.22, y: 0.32 }, { x: 0.38, y: 0.2 },
      { x: 0.55, y: 0.25 }, { x: 0.74, y: 0.42 }, { x: 0.84, y: 0.62 },
      { x: 0.72, y: 0.78 }, { x: 0.52, y: 0.72 }, { x: 0.34, y: 0.82 },
      { x: 0.16, y: 0.68 }
    ],
    beatCheckpoints: [0, 1, 2, 3, 4, 5, 6, 7]
  })
]);
