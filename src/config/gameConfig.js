/** Central defaults shared by the source project. Feature tuning belongs here. */
export const gameConfig = Object.freeze({
  application: Object.freeze({
    id: "starlight-academy",
    title: "Starlight Academy: Studio of Magic & Motion"
  }),
  platform: Object.freeze({
    targetBrowsers: Object.freeze(["Chrome", "Edge"]),
    aspectRatio: 16 / 9,
    minimumViewport: Object.freeze({ width: 960, height: 540 })
  }),
  release: Object.freeze({
    chapterCount: 10,
    sideQuestCount: 20,
    standaloneHtml: true,
    offlineRuntime: true
  }),
  progression: Object.freeze({
    spendableCurrency: "starGems",
    masteryCurrency: "starlightSparkles"
  }),
  persistence: Object.freeze({
    storageKey: "starlight-academy.save",
    schemaVersion: 1,
    autosaveDelayMs: 700,
    maxImportBytes: 10 * 1024 * 1024
  })
});
