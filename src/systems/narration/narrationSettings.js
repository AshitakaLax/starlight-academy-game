import { gameConfig } from "../../config/gameConfig.js";

export const DEFAULT_NARRATION_SETTINGS = Object.freeze({
  enabled: gameConfig.narration.defaultEnabled,
  voiceURI: gameConfig.narration.defaultVoiceURI,
  rate: gameConfig.narration.defaultRate
});

/** Backward-compatible narration settings for saves created before STEP-09. */
export function selectNarrationSettings(state) {
  const narration = state?.narration ?? {};
  const rate = Number.isFinite(narration.rate)
    ? Math.min(1.2, Math.max(0.8, narration.rate))
    : DEFAULT_NARRATION_SETTINGS.rate;
  return Object.freeze({
    enabled: narration.enabled === true,
    voiceURI: typeof narration.voiceURI === "string" ? narration.voiceURI : DEFAULT_NARRATION_SETTINGS.voiceURI,
    rate
  });
}
