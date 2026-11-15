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
  curriculum: Object.freeze({ defaultTier: "core", masteryWindowSize: 5, masteryRequiredIndependentCorrect: 4, evidenceHistoryLimit: 100 }),
  release: Object.freeze({ chapterCount: 10, sideQuestCount: 20, standaloneHtml: true, offlineRuntime: true }),
  progression: Object.freeze({ spendableCurrency: "starGems", masteryCurrency: "starlightSparkles" }),
  persistence: Object.freeze({
    storageKey: "starlight-academy.save",
    schemaVersion: 1,
    autosaveDelayMs: 700,
    maxImportBytes: 10 * 1024 * 1024
  })
});
