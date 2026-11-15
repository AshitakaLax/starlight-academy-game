export const DEFAULT_UI_PREFERENCES = Object.freeze({
  textScale: "normal",
  reducedMotion: false
});

/** Return safe, presentation-ready preferences even when restoring an older save. */
export function selectUiPreferences(state) {
  const preferences = state?.ui?.preferences ?? {};
  return Object.freeze({
    textScale: ["small", "normal", "large"].includes(preferences.textScale)
      ? preferences.textScale
      : DEFAULT_UI_PREFERENCES.textScale,
    reducedMotion: preferences.reducedMotion === true
  });
}
