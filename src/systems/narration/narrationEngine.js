/**
 * Optional Web Speech narration. Never blocks gameplay. Supports voice
 * discovery, music ducking, cancel/interrupt, and enable/disable.
 */
export class NarrationEngine {
  constructor(audioEngine = null) {
    this.audioEngine = audioEngine;
    this.enabled = true;
    this.voice = null;
    this.synth = (typeof window !== "undefined") ? window.speechSynthesis : null;
    this.ducking = false;
    this.previousMusicVolume = null;
    this.discoverVoice();
  }

  discoverVoice() {
    if (!this.synth) return;
    const pick = () => {
      const voices = this.synth.getVoices();
      this.voice = voices.find((v) => /^en/i.test(v.lang) && /natural|neural/i.test(v.name)) ||
        voices.find((v) => /^en/i.test(v.lang)) ||
        voices[0] || null;
    };
    pick();
    if (typeof window !== "undefined" && this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = pick;
    }
  }

  setAudioEngine(audioEngine) {
    this.audioEngine = audioEngine;
  }

  duckMusic() {
    if (!this.audioEngine || this.ducking) return;
    this.ducking = true;
    this.previousMusicVolume = this.audioEngine.volumes?.music ?? 0.6;
    this.audioEngine.setVolumes({ music: this.previousMusicVolume * 0.35 });
  }

  restoreMusic() {
    if (!this.audioEngine || !this.ducking) return;
    this.ducking = false;
    this.audioEngine.setVolumes({ music: this.previousMusicVolume ?? 0.6 });
    this.previousMusicVolume = null;
  }

  speak(text, options = {}) {
    if (!this.enabled || !this.synth || !text) return;
    try {
      this.cancel();
      if (options.duck !== false) this.duckMusic();
      const u = new SpeechSynthesisUtterance(text);
      if (this.voice) u.voice = this.voice;
      u.rate = options.rate || 1;
      u.pitch = options.pitch || 1;
      u.onend = () => { this.restoreMusic(); if (options.onEnd) options.onEnd(); };
      u.onerror = () => { this.restoreMusic(); };
      this.synth.speak(u);
    } catch (e) {
      console.warn("Narration unavailable", e);
      this.restoreMusic();
    }
  }

  cancel() {
    if (this.synth) {
      try { this.synth.cancel(); } catch (e) {}
    }
    this.restoreMusic();
  }

  setEnabled(enabled) {
    this.enabled = !!enabled;
    if (!enabled) this.cancel();
  }
}
export default NarrationEngine;
