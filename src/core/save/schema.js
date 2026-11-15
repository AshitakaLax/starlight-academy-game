/**
 * Save schema definition and default state factory.
 */
export const SCHEMA_VERSION = 1;

export function createDefaultState() {
  return {
    schemaVersion: SCHEMA_VERSION,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    app: { screen: "hub", bootstrapped: false },
    settings: {
      textScale: 1,
      reducedMotion: false,
      masterVolume: 0.8,
      musicVolume: 0.6,
      sfxVolume: 0.8,
      narrationEnabled: true,
      startingDifficultyPreference: "standard",
    },
    economy: { gems: 150, sparkles: 0 },
    progress: {
      academyLevel: 1,
      chapters: {},
      quests: {},
      achievements: [],
    },
    skills: {},
    wardrobe: {
      owned: [],
      equipped: {},
      textures: {},
    },
    pets: {
      activePetId: null,
      pets: {
        pegasus: { unlocked: false, bondLevel: 1, bondXp: 0, careProgress: { joy: 0, nourishment: 0, grooming: 0 }, appearance: {} },
        phoenix: { unlocked: false, bondLevel: 1, bondXp: 0, careProgress: { joy: 0, nourishment: 0, grooming: 0 }, appearance: {} },
        nymphKitten: { unlocked: false, bondLevel: 1, bondXp: 0, careProgress: { joy: 0, nourishment: 0, grooming: 0 }, appearance: {} },
      },
    },
    gymnastics: { routines: {} },
    playTimeMs: 0,
  };
}
export default { SCHEMA_VERSION, createDefaultState };
