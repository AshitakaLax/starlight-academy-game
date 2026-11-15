/**
 * Web Audio synthesis engine with master/music/SFX buses, scene music,
 * effects, mute, and volume settings. Audio starts only after a user gesture.
 */
export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.music = null;
    this.sfx = null;
    this.initialized = false;
    this.muted = false;
    this.volumes = { master: 0.8, music: 0.6, sfx: 0.8 };
    this.musicTimer = null;
    this.currentScene = null;
    this.interactionHooked = false;
  }

  async init() {
    if (this.initialized) return true;
    try {
      const Ctx = (typeof window !== "undefined") && (window.AudioContext || window.webkitAudioContext);
      if (!Ctx) return false;
      this.ctx = new Ctx();
      this.master = this.ctx.createGain();
      this.music = this.ctx.createGain();
      this.sfx = this.ctx.createGain();
      this.music.connect(this.master);
      this.sfx.connect(this.master);
      this.master.connect(this.ctx.destination);
      this.applyVolumes();
      this.initialized = true;
      return true;
    } catch (e) {
      console.warn("Audio unavailable", e);
      return false;
    }
  }

  async resume() {
    if (this.ctx && this.ctx.state === "suspended") {
      try { await this.ctx.resume(); } catch (e) {}
    }
  }

  applyVolumes() {
    if (!this.master) return;
    this.master.gain.value = this.muted ? 0 : this.volumes.master;
    if (this.music) this.music.gain.value = this.volumes.music;
    if (this.sfx) this.sfx.gain.value = this.volumes.sfx;
  }

  setVolumes({ master, music, sfx } = {}) {
    if (master !== undefined) this.volumes.master = master;
    if (music !== undefined) this.volumes.music = music;
    if (sfx !== undefined) this.volumes.sfx = sfx;
    this.applyVolumes();
  }

  setMute(muted) {
    this.muted = !!muted;
    this.applyVolumes();
  }

  toggleMute() {
    this.setMute(!this.muted);
    return this.muted;
  }

  hookUserGesture() {
    if (this.interactionHooked || typeof window === "undefined") return;
    this.interactionHooked = true;
    const start = async () => {
      await this.init();
      await this.resume();
      window.removeEventListener("click", start);
      window.removeEventListener("keydown", start);
    };
    window.addEventListener("click", start, { once: true });
    window.addEventListener("keydown", start, { once: true });
  }

  playTone(freq = 440, duration = 0.1, bus = "sfx", type = "sine", volume = 0.2) {
    if (!this.initialized || this.muted || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      osc.connect(gain);
      gain.connect(bus === "music" ? this.music : this.sfx);
      const now = this.ctx.currentTime;
      gain.gain.setValueAtTime(volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
      osc.start(now);
      osc.stop(now + duration);
    } catch (e) {
      console.warn("playTone failed", e);
    }
  }

  playEffect(name) {
    switch (name) {
      case "correct": this.playTone(660, 0.12, "sfx", "triangle", 0.25); break;
      case "incorrect": this.playTone(220, 0.15, "sfx", "sawtooth", 0.2); break;
      case "click": this.playTone(440, 0.06, "sfx", "square", 0.15); break;
      case "reward": this.playTone(880, 0.2, "sfx", "triangle", 0.25); break;
      default: this.playTone(440, 0.08, "sfx"); break;
    }
  }

  playSceneMusic(sceneId) {
    if (this.currentScene === sceneId) return;
    this.stopMusic();
    this.currentScene = sceneId;
    if (!this.initialized || this.muted) return;
    const patterns = {
      hub: [523, 587, 659, 587],
      default: [392, 440, 494, 440],
    };
    const seq = patterns[sceneId] || patterns.default;
    let i = 0;
    this.musicTimer = setInterval(() => {
      if (this.muted || !this.initialized) return;
      this.playTone(seq[i % seq.length], 0.25, "music", "sine", 0.12);
      i++;
    }, 400);
  }

  stopMusic() {
    if (this.musicTimer) {
      clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
    this.currentScene = null;
  }
}
export default AudioEngine;
