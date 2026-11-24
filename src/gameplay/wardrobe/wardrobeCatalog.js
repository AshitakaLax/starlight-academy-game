const ITEM_ID_PATTERN = /^[a-z][a-z0-9-]*(?:[.-][a-z][a-z0-9-]*)+$/;
const SOURCE_ID_PATTERN = /^[a-z][a-z0-9-]*(?:[.-][a-z][a-z0-9-]*)*$/;
export const WARDROBE_SLOTS = Object.freeze(["head", "outfit", "footwear", "accessory"]);

function isPlainObject(value) {
  if (value === null || typeof value !== "object") return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}
function hasOnlyKeys(value, keys) {
  return Object.keys(value).every((key) => keys.includes(key));
}
function freezeRecursively(value) {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) freezeRecursively(child);
  }
  return value;
}
function validateAcquisition(acquisition) {
  if (!isPlainObject(acquisition)) return "Item acquisition must be a plain object.";
  if (acquisition.type === "starter") {
    return hasOnlyKeys(acquisition, ["type", "sourceId"])
      && (acquisition.sourceId === undefined
        || (typeof acquisition.sourceId === "string" && SOURCE_ID_PATTERN.test(acquisition.sourceId)))
      ? true : "Starter acquisition accepts only type and an optional sourceId.";
  }
  if (acquisition.type === "purchase") {
    return hasOnlyKeys(acquisition, ["type", "priceStarGems"])
      && Number.isSafeInteger(acquisition.priceStarGems) && acquisition.priceStarGems >= 1
      ? true : "Purchase acquisition needs a positive safe-integer priceStarGems.";
  }
  if (acquisition.type === "chapter" || acquisition.type === "quest") {
    return hasOnlyKeys(acquisition, ["type", "sourceId"])
      && typeof acquisition.sourceId === "string" && SOURCE_ID_PATTERN.test(acquisition.sourceId)
      ? true : "Chapter and quest acquisitions need a stable sourceId.";
  }
  return 'Acquisition type must be "starter", "purchase", "chapter", or "quest".';
}

/** Validate a cosmetic item before it is visible to inventory or equipment actions. */
export function validateWardrobeItem(input) {
  if (!isPlainObject(input) || !hasOnlyKeys(input, ["id", "title", "slot", "description", "symbol", "theme", "acquisition"])) {
    return "A wardrobe item must contain only id, title, slot, description, symbol, theme, and acquisition.";
  }
  if (typeof input.id !== "string" || !ITEM_ID_PATTERN.test(input.id)) return "Wardrobe item id must be a stable namespaced identifier.";
  if (typeof input.title !== "string" || !input.title.trim()) return "Wardrobe item title must be non-empty.";
  if (!WARDROBE_SLOTS.includes(input.slot)) return "Wardrobe item slot must be head, outfit, footwear, or accessory.";
  if (typeof input.description !== "string" || !input.description.trim()) return "Wardrobe item description must be non-empty.";
  if (typeof input.symbol !== "string" || input.symbol.length < 1 || input.symbol.length > 4) return "Wardrobe item symbol must be 1 to 4 characters.";
  if (typeof input.theme !== "string" || !/^[a-z][a-z0-9-]{1,24}$/.test(input.theme)) return "Wardrobe item theme must be a short lowercase token.";
  return validateAcquisition(input.acquisition);
}

export function createWardrobeItem(input) {
  const validation = validateWardrobeItem(input);
  if (validation !== true) throw new TypeError(validation);
  return freezeRecursively({
    ...input,
    title: input.title.trim(),
    description: input.description.trim(),
    acquisition: { ...input.acquisition }
  });
}

export function createWardrobeCatalog(initialItems = []) {
  if (!Array.isArray(initialItems)) throw new TypeError("Wardrobe catalog initialItems must be an array.");
  const items = new Map();
  function register(input) {
    const item = createWardrobeItem(input);
    if (items.has(item.id)) throw new Error("Wardrobe item already registered: " + item.id);
    items.set(item.id, item);
    return item;
  }
  for (const item of initialItems) register(item);
  function list() {
    return [...items.values()].sort((a, b) => a.slot.localeCompare(b.slot) || a.title.localeCompare(b.title));
  }
  return Object.freeze({
    register,
    get(id) { return items.get(id) ?? null; },
    has(id) { return items.has(id); },
    list,
    listBySlot(slot) { return list().filter((item) => item.slot === slot); }
  });
}

export function createWardrobeShopCatalog(wardrobeCatalog) {
  if (!wardrobeCatalog || typeof wardrobeCatalog.list !== "function") {
    throw new TypeError("createWardrobeShopCatalog requires a wardrobe catalog.");
  }
  const purchases = wardrobeCatalog.list()
    .filter((item) => item.acquisition.type === "purchase")
    .map((item) => ({
      id: item.id,
      title: item.title,
      priceStarGems: item.acquisition.priceStarGems,
      maxOwned: 1
    }));
  return purchases;
}

export const defaultWardrobeItems = Object.freeze([
  Object.freeze({ id: "wardrobe.starlight-tiara", title: "Starlight Tiara", slot: "head", description: "A little silver sparkle for academy days.", symbol: "✧", theme: "silver", acquisition: Object.freeze({ type: "starter", sourceId: "academy" }) }),
  Object.freeze({ id: "wardrobe.academy-tunic", title: "Academy Tunic", slot: "outfit", description: "A cozy lavender uniform for new adventures.", symbol: "✦", theme: "lavender", acquisition: Object.freeze({ type: "starter", sourceId: "academy" }) }),
  Object.freeze({ id: "wardrobe.moonlit-slippers", title: "Moonlit Slippers", slot: "footwear", description: "Soft shoes for dancing between discoveries.", symbol: "☾", theme: "moonlight", acquisition: Object.freeze({ type: "starter", sourceId: "academy" }) }),
  Object.freeze({ id: "wardrobe.star-pendant", title: "Star Pendant", slot: "accessory", description: "A tiny reminder to keep reaching for the stars.", symbol: "✧", theme: "starlight", acquisition: Object.freeze({ type: "starter", sourceId: "academy" }) }),
  Object.freeze({ id: "wardrobe.comet-dance-dress", title: "Comet Dance Dress", slot: "outfit", description: "A chapter celebration outfit earned through the first adventure.", symbol: "☄", theme: "comet", acquisition: Object.freeze({ type: "chapter", sourceId: "chapter-01" }) }),
  Object.freeze({ id: "wardrobe.lavender-crown", title: "Lavender Crown", slot: "head", description: "A graceful crown with a soft violet glow.", symbol: "♕", theme: "lavender", acquisition: Object.freeze({ type: "purchase", priceStarGems: 30 }) }),
  Object.freeze({ id: "wardrobe.cloud-dance-dress", title: "Cloud Dance Dress", slot: "outfit", description: "A flowing look inspired by silver clouds.", symbol: "☁", theme: "cloud", acquisition: Object.freeze({ type: "purchase", priceStarGems: 45 }) }),
  Object.freeze({ id: "wardrobe.sparkle-boots", title: "Sparkle Boots", slot: "footwear", description: "Bright boots for bold new steps.", symbol: "✦", theme: "sparkle", acquisition: Object.freeze({ type: "purchase", priceStarGems: 25 }) }),
  Object.freeze({ id: "wardrobe.moonbeam-bow", title: "Moonbeam Bow", slot: "accessory", description: "A shimmering bow with a moonlit finish.", symbol: "❀", theme: "moonbeam", acquisition: Object.freeze({ type: "purchase", priceStarGems: 20 }) })
]);
