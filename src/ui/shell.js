/**
 * UI shell helpers: apply settings (text scale, reduced motion, volumes) to DOM.
 */
export function applySettings(settings = {}, audioEngine = null) {
  const root = document.documentElement;
  if (settings.textScale) root.style.setProperty("--text-scale", String(settings.textScale));
  if (settings.reducedMotion) {
    document.body.classList.add("reduced-motion");
  } else {
    document.body.classList.remove("reduced-motion");
  }
  if (audioEngine && typeof audioEngine.setVolumes === "function") {
    audioEngine.setVolumes({ master: settings.masterVolume, music: settings.musicVolume, sfx: settings.sfxVolume });
  }
  if (audioEngine && typeof audioEngine.setMute === "function") {
    // mute handled separately if needed
  }
}
export default { applySettings };
