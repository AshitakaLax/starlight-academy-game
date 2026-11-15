/**
 * Pet care activities: feed, groom, play. Positive only, no decay.
 * Full meters do not punish; interactions still yield small bond credit.
 */
export class PetCare {
  constructor(store) {
    this.store = store;
  }

  _care(petId, metric, amount, bondXp) {
    const pet = this.store.getState().pets.pets[petId];
    if (!pet || !pet.unlocked) return { ok: false, error: "pet not unlocked" };
    const current = pet.careProgress[metric] ?? 0;
    const atCap = current >= 100;
    const grant = atCap ? 0 : amount;
    this.store.dispatch("pet/care", { petId, metric, amount: grant, bondXp });
    return { ok: true, atCap, message: atCap ? "Already full! Still earning bond." : "Care complete." };
  }

  feed(petId) {
    return this._care(petId, "nourishment", 5, 2);
  }

  groom(petId) {
    return this._care(petId, "grooming", 5, 2);
  }

  play(petId) {
    return this._care(petId, "joy", 5, 2);
  }

  ribbonToss(petId, score = 1) {
    const bondXp = Math.max(1, Math.min(5, score));
    return this._care(petId, "joy", 3, bondXp);
  }
}
export default PetCare;
