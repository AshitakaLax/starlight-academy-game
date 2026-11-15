/**
 * Data-driven chapter runtime. Chapters define their own sequence via data.
 */
export class ChapterRuntime {
  constructor(store, economy) {
    this.store = store;
    this.economy = economy;
    this.chapters = new Map();
    this.active = null; // { chapterId, sceneIndex, startedAt }
  }

  register(chapterDef) {
    if (!chapterDef?.id) throw new Error("Chapter requires id");
    if (!Array.isArray(chapterDef.scenes)) chapterDef.scenes = [];
    this.chapters.set(chapterDef.id, chapterDef);
  }

  get(id) { return this.chapters.get(id) || null; }
  list() { return [...this.chapters.values()]; }

  start(chapterId) {
    const ch = this.chapters.get(chapterId);
    if (!ch) return { ok: false, error: "unknown chapter" };
    this.active = { chapterId, sceneIndex: 0, startedAt: Date.now() };
    this.store.dispatch("progress/chapter/start", { chapterId });
    return { ok: true, chapter: ch, scene: ch.scenes[0] || null };
  }

  currentScene() {
    if (!this.active) return null;
    const ch = this.chapters.get(this.active.chapterId);
    return ch?.scenes?.[this.active.sceneIndex] || null;
  }

  nextScene() {
    if (!this.active) return { ok: false, error: "no active chapter" };
    const ch = this.chapters.get(this.active.chapterId);
    this.active.sceneIndex = Math.min(this.active.sceneIndex + 1, (ch.scenes?.length || 1) - 1);
    return { ok: true, scene: this.currentScene() };
  }

  goToScene(index) {
    if (!this.active) return { ok: false, error: "no active chapter" };
    const ch = this.chapters.get(this.active.chapterId);
    if (index < 0 || index >= (ch.scenes?.length || 0)) return { ok: false, error: "invalid scene" };
    this.active.sceneIndex = index;
    return { ok: true, scene: this.currentScene() };
  }

  checkpoint(data) {
    if (!this.active) return { ok: false, error: "no active chapter" };
    this.store.dispatch("progress/chapter/checkpoint", { chapterId: this.active.chapterId, data });
    return { ok: true };
  }

  complete(reward = null, stats = {}) {
    if (!this.active) return { ok: false, error: "no active chapter" };
    const chapterId = this.active.chapterId;
    this.store.dispatch("progress/chapter/complete", { chapterId, rewardId: reward?.id });
    if (reward && this.economy) this.economy.grantReward(reward);
    // replay record
    const rec = this.store.getState().progress.chapters[chapterId];
    if (rec) {
      rec.replayCount = (rec.replayCount || 0) + (rec.completedAt && rec.completed ? 1 : 0); // naive
      rec.bestStats = stats;
    }
    const active = this.active;
    this.active = null;
    return { ok: true, chapterId, reward };
  }

  exit() {
    if (this.active) {
      this.checkpoint({ exited: true });
    }
    this.active = null;
    return { ok: true };
  }

  isReplay(chapterId) {
    const rec = this.store.getState().progress.chapters?.[chapterId];
    return !!(rec && rec.completed);
  }
}
export default ChapterRuntime;
