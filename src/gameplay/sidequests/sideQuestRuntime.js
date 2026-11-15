/**
 * Side quest runtime: registration, start, complete, replay records.
 */
export class SideQuestRuntime {
  constructor(store, economy) {
    this.store = store;
    this.economy = economy;
    this.quests = new Map();
  }

  register(quest) {
    if (!quest?.id) throw new Error("Quest requires id");
    this.quests.set(quest.id, quest);
  }

  get(id) { return this.quests.get(id) || null; }
  list() { return [...this.quests.values()]; }
  byChapter(chapterId) { return this.list().filter((q) => q.chapterId === chapterId); }

  start(questId) {
    const q = this.quests.get(questId);
    if (!q) return { ok: false, error: "unknown quest" };
    return { ok: true, quest: q };
  }

  complete(questId) {
    const q = this.quests.get(questId);
    if (!q) return { ok: false, error: "unknown quest" };
    this.store.dispatch("progress/quest/complete", { questId });
    if (q.reward && this.economy) this.economy.grantReward(q.reward);
    return { ok: true, questId };
  }
}
export default SideQuestRuntime;
