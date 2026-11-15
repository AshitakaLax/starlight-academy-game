/**
 * Pure selector functions. They never mutate state.
 */
export const selectors = {
  screen: (s) => s.app?.screen ?? "hub",
  gems: (s) => s.economy?.gems ?? 0,
  sparkles: (s) => s.economy?.sparkles ?? 0,
  settings: (s) => s.settings ?? {},
  activePetId: (s) => s.pets?.activePetId ?? null,
  pet: (s, id) => (id ? s.pets?.pets?.[id] ?? null : null),
  ownedItems: (s) => s.wardrobe?.owned ?? [],
  equipped: (s, slot) => s.wardrobe?.equipped?.[slot] ?? null,
  skill: (s, id) => s.skills?.[id] ?? null,
  chapterRecord: (s, id) => s.progress?.chapters?.[id] ?? null,
  questRecord: (s, id) => s.progress?.quests?.[id] ?? null,
};
export default selectors;
