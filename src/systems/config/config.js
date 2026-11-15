/**
 * Centralized configuration. All tunable gameplay values live here.
 */
export const CONFIG = {
  difficulty: {
    tiers: ["Foundation", "Developing", "Core", "Stretch"],
    defaultTier: "Core",
    evidenceWindow: 5,
    moveUpThreshold: 4, // correct without full demo
    moveDownThreshold: 2,
  },
  gymnastics: {
    combinedFormula: "average",
    starThresholds: {
      oneStar: { minCombined: 0 },
      twoStar: { tracing: 60, rhythm: 60 },
      threeStar: { tracing: 85, rhythm: 85 },
    },
    timingWindowsMs: { intro: 250, standard: 180, strict: 120 },
  },
  economy: {
    startingGems: 150,
    replayRewardCap: 3,
  },
  pets: {
    abilities: {
      pegasus: { id: "graceful_flight", effect: "gem_bonus_routine", value: 0.1 },
      phoenix: { id: "spark_reprise", effect: "sparkle_bonus_pb", value: 1 },
      nymphKitten: { id: "curious_insight", effect: "extra_hint_token", value: 1 },
    },
  },
  skills: {
    // skillId -> metadata
  },
};
export default CONFIG;
