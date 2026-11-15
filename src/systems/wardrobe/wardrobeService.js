/**
 * Wardrobe/inventory service: catalog, ownership, equipment, purchase/unlock validation.
 */
import { ITEM_CATALOG } from "../../data/items.js";

export class WardrobeService {
  constructor(store, economy) {
    this.store = store;
    this.economy = economy;
    this.catalog = ITEM_CATALOG;
  }

  item(id) {
    return this.catalog.find((i) => i.id === id) || null;
  }

  isOwned(id) {
    return (this.store.getState().wardrobe.owned || []).includes(id);
  }

  unlock(itemId, source = "system") {
    const it = this.item(itemId);
    if (!it) return { ok: false, error: "unknown item" };
    // chapter-exclusive items should be unlocked via chapter reward flow; allow if source matches
    if (it.source === "chapter" && source !== "chapter") {
      return { ok: false, error: "chapter-exclusive item" };
    }
    this.store.dispatch("wardrobe/item/unlock", { itemId });
    return { ok: true };
  }

  purchase(itemId) {
    const it = this.item(itemId);
    if (!it) return { ok: false, error: "unknown item" };
    if (it.source !== "shop") return { ok: false, error: "not purchasable" };
    const price = it.price ?? 0;
    const res = this.economy.spendGems(price, itemId, price);
    if (!res.ok) return { ok: false, error: res.error || "purchase failed" };
    // ensure owned (purchase action already unlocks)
    if (!this.isOwned(itemId)) this.store.dispatch("wardrobe/item/unlock", { itemId });
    return { ok: true };
  }

  equip(slot, itemId) {
    if (itemId !== null && !this.isOwned(itemId)) return { ok: false, error: "locked item" };
    const it = itemId ? this.item(itemId) : null;
    if (it && it.slot !== slot) return { ok: false, error: "wrong slot" };
    const res = this.store.dispatch("wardrobe/item/equip", { slot, itemId });
    return res.ok ? { ok: true } : { ok: false, error: res.error || "equip failed" };
  }

  saveTexture(itemId, dataUrl) {
    // validate data URL size (basic)
    if (dataUrl && dataUrl.length > 2_000_000) return { ok: false, error: "texture too large" };
    this.store.dispatch("wardrobe/texture/save", { itemId, dataUrl });
    return { ok: true };
  }
}
export default WardrobeService;
