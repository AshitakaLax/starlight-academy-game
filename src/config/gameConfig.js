/** Central defaults shared by the source project. */
export const gameConfig = Object.freeze({
  application: Object.freeze({ id: "starlight-academy", title: "Starlight Academy: Studio of Magic & Motion" }),
  platform: Object.freeze({
    targetBrowsers: Object.freeze(["Chrome", "Edge"]),
    aspectRatio: 16 / 9,
    minimumViewport: Object.freeze({ width: 960, height: 540 })
  }),
  ui: Object.freeze({ defaultTextScale: "normal", defaultReducedMotion: false }),
  audio: Object.freeze({ defaultMasterVolume: 70, defaultMusicVolume: 24, defaultSfxVolume: 55, defaultMuted: false }),
  narration: Object.freeze({ defaultEnabled: false, defaultVoiceURI: "", defaultRate: 1 }),
  curriculum: Object.freeze({ defaultTier: "core", onboardingTier: "core", masteryWindowSize: 5, masteryRequiredIndependentCorrect: 4, adaptiveWindowSize: 5, promotionIndependentCorrect: 4, demotionMaximumCorrect: 1, evidenceHistoryLimit: 100 }),
  release: Object.freeze({ chapterCount: 10, sideQuestCount: 20, standaloneHtml: true, offlineRuntime: true }),
  progression: Object.freeze({ spendableCurrency: "starGems", masteryCurrency: "starlightSparkles" }),
  economy: Object.freeze({ defaultStarGems: 0, defaultStarlightSparkles: 0, transactionHistoryLimit: 200, maximumRewardClaims: 5 }),
  petCare: Object.freeze({ progressPerInteraction: 25, progressMaximum: 100, bondExperiencePerInteraction: 5 }),
  petAbilities: Object.freeze({
    definitions: Object.freeze({
      "pet.pegasus": Object.freeze({
        id: "ability.skyward-shine",
        title: "Skyward Shine",
        description: "While Pegasus is your active companion, sparkle grooming adds 10 extra care points.",
        careType: "grooming",
        careProgressBonus: 10
      }),
      "pet.phoenix": Object.freeze({
        id: "ability.ember-treat",
        title: "Ember Treat",
        description: "While Phoenix is your active companion, treat feeding adds 10 extra care points.",
        careType: "feeding",
        careProgressBonus: 10
      }),
      "pet.nymph-kitten": Object.freeze({
        id: "ability.ribbontail-whirl",
        title: "Ribbontail Whirl",
        description: "While Nymph Kitten is your active companion, ribbon play adds 10 extra care points.",
        careType: "play",
        careProgressBonus: 10
      })
    })
  }),
  persistence: Object.freeze({
    storageKey: "starlight-academy.save",
    schemaVersion: 1,
    autosaveDelayMs: 700,
    maxImportBytes: 10 * 1024 * 1024
  })
});
