/**
 * Pet collection model service: unlock, select active, independent state.
 */
export class PetCollection {
  constructor(store) {
    this.store = store;
  }

  unlock(petId) {
    if (!this.store.getState().pets.pets[petId]) return { ok: false, error: "unknown pet" };
    this.store.dispatch("pet/unlock", { petId });
    return { ok: true };
  }

  selectActive(petId) {
    const pet = this.store.getState().pets.pets[petId];
    if (!pet || !pet.unlocked) return { ok: false, error: "pet not unlocked" };
    const res = this.store.dispatch("pet/selectActive", { petId });
    return res.ok ? { ok: true } : { ok: false, error: res.error };
  }

  get(petId) {
    return this.store.getState().pets.pets[petId] || null;
  }

  active() {
    const id = this.store.getState().pets.activePetId;
    return id ? this.get(id) : null;
  }
}
export default PetCollection;
