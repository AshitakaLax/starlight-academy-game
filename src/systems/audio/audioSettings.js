import { gameConfig } from "../../config/gameConfig.js";

export const DEFAULT_AUDIO_SETTINGS = Object.freeze({
  masterVolume: gameConfig.audio.defaultMasterVolume,
  musicVolume: gameConfig.audio.defaultMusicVolume,
  sfxVolume: gameConfig.audio.defaultSfxVolume,
  muted: gameConfig.audio.defaultMuted
});

/** Backward-compatible audio defaults for saves created before STEP-08. */
export function selectAudioSettings(state) {
  const audio = state?.audio ?? {};
  const clamp = (value, fallback) => Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : fallback;
  return Object.freeze({
    masterVolume: clamp(audio.masterVolume, DEFAULT_AUDIO_SETTINGS.masterVolume),
    musicVolume: clamp(audio.musicVolume, DEFAULT_AUDIO_SETTINGS.musicVolume),
    sfxVolume: clamp(audio.sfxVolume, DEFAULT_AUDIO_SETTINGS.sfxVolume),
    muted: audio.muted === true
  });
}
