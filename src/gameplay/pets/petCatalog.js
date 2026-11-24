const PET_ID_PATTERN = /^pet\.[a-z][a-z0-9-]*$/;
const SPECIES_PATTERN = /^[a-z][a-z0-9-]*$/;
const HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;

function isPlainObject(value) {
  if (value === null || typeof value !== "object") return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function freezeRecursively(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) freezeRecursively(child);
  return Object.freeze(value);
}

export function validatePetDefinition(input) {
  if (!isPlainObject(input) || Object.keys(input).some((key) =>
    !["id", "species", "title", "description", "symbol", "order", "starter", "appearancePalettes", "defaultPaletteId"].includes(key))) {
    return "A pet definition contains unsupported fields.";
  }
  if (typeof input.id !== "string" || !PET_ID_PATTERN.test(input.id)) return "Pet ID must use the pet namespace.";
  if (typeof input.species !== "string" || !SPECIES_PATTERN.test(input.species)
      || input.id !== "pet." + input.species) return "Pet species must match its stable pet ID.";
  if (typeof input.title !== "string" || !input.title.trim()) return "Pet title must be non-empty.";
  if (typeof input.description !== "string" || !input.description.trim()) return "Pet description must be non-empty.";
  if (typeof input.symbol !== "string" || !input.symbol.trim() || input.symbol.length > 8) return "Pet symbol must be a short non-empty string.";
  if (!Number.isInteger(input.order) || input.order < 0 || input.order > 99) return "Pet order must be an integer from 0 to 99.";
  if (typeof input.starter !== "boolean") return "Pet starter must be a boolean.";
  if (!Array.isArray(input.appearancePalettes) || input.appearancePalettes.length < 1 || input.appearancePalettes.length > 8) {
    return "Each pet must have between one and eight appearance palettes.";
  }
  const paletteIds = new Set();
  for (const palette of input.appearancePalettes) {
    if (!isPlainObject(palette) || Object.keys(palette).some((key) =>
      !["id", "label", "primaryColor", "secondaryColor", "accentColor"].includes(key))) {
      return "Pet appearance palettes contain unsupported fields.";
    }
    if (typeof palette.id !== "string" || !/^[a-z][a-z0-9-]*$/.test(palette.id) || paletteIds.has(palette.id)) {
      return "Pet appearance palette IDs must be unique stable identifiers.";
    }
    paletteIds.add(palette.id);
    if (typeof palette.label !== "string" || !palette.label.trim()) return "Pet appearance palette labels must be non-empty.";
    if (![palette.primaryColor, palette.secondaryColor, palette.accentColor].every((color) =>
      typeof color === "string" && HEX_COLOR_PATTERN.test(color))) {
      return "Pet appearance palette colors must be six-digit hex values.";
    }
  }
  if (typeof input.defaultPaletteId !== "string" || !paletteIds.has(input.defaultPaletteId)) {
    return "Pet defaultPaletteId must refer to a registered appearance palette.";
  }
  return true;
}

export function createPetDefinition(input) {
  const validation = validatePetDefinition(input);
  if (validation !== true) throw new TypeError(validation);
  return freezeRecursively({
    id: input.id,
    species: input.species,
    title: input.title.trim(),
    description: input.description.trim(),
    symbol: input.symbol,
    order: input.order,
    starter: input.starter,
    appearancePalettes: input.appearancePalettes.map((palette) => ({
      id: palette.id,
      label: palette.label.trim(),
      primaryColor: palette.primaryColor.toLowerCase(),
      secondaryColor: palette.secondaryColor.toLowerCase(),
      accentColor: palette.accentColor.toLowerCase()
    })),
    defaultPaletteId: input.defaultPaletteId
  });
}

export function createPetCatalog(initialPets = []) {
  if (!Array.isArray(initialPets)) throw new TypeError("Pet definitions must be supplied as an array.");
  const pets = new Map();
  const orders = new Set();

  function register(input) {
    const pet = createPetDefinition(input);
    if (pets.has(pet.id)) throw new Error("Pet already registered: " + pet.id);
    if (orders.has(pet.order)) throw new Error("Pet display order is already registered: " + pet.order);
    pets.set(pet.id, pet);
    orders.add(pet.order);
    return pet;
  }

  for (const pet of initialPets) register(pet);
  if (![...pets.values()].some((pet) => pet.starter)) {
    throw new Error("The pet catalog must include at least one starter companion.");
  }

  return Object.freeze({
    register,
    get(id) { return pets.get(id) ?? null; },
    has(id) { return pets.has(id); },
    list() { return [...pets.values()].sort((left, right) => left.order - right.order); }
  });
}

export const defaultPetDefinitions = Object.freeze([
  Object.freeze({
    id: "pet.pegasus",
    species: "pegasus",
    title: "Pegasus",
    description: "A gentle sky-dancer who loves open clouds and quiet starlight.",
    symbol: "🪽",
    order: 0,
    starter: true,
    defaultPaletteId: "moonlit",
    appearancePalettes: Object.freeze([
      Object.freeze({ id: "moonlit", label: "Moonlit", primaryColor: "#fffaf3", secondaryColor: "#b99bd0", accentColor: "#e8c879" }),
      Object.freeze({ id: "rose-cloud", label: "Rose Cloud", primaryColor: "#f8e5ed", secondaryColor: "#d28eaf", accentColor: "#f0c979" }),
      Object.freeze({ id: "twilight", label: "Twilight", primaryColor: "#d9d5f2", secondaryColor: "#7972b4", accentColor: "#f0c979" })
    ])
  }),
  Object.freeze({
    id: "pet.phoenix",
    species: "phoenix",
    title: "Phoenix",
    description: "A bright-hearted bird whose feathers shimmer like a sunrise.",
    symbol: "🔥",
    order: 1,
    starter: false,
    defaultPaletteId: "sunrise",
    appearancePalettes: Object.freeze([
      Object.freeze({ id: "sunrise", label: "Sunrise", primaryColor: "#f4a45d", secondaryColor: "#c95850", accentColor: "#ffdf8a" }),
      Object.freeze({ id: "ember", label: "Ember", primaryColor: "#c94e45", secondaryColor: "#8e3d63", accentColor: "#f6b65f" }),
      Object.freeze({ id: "dawn", label: "Dawn", primaryColor: "#f8c4a0", secondaryColor: "#cf82a4", accentColor: "#fff0bd" })
    ])
  }),
  Object.freeze({
    id: "pet.nymph-kitten",
    species: "nymph-kitten",
    title: "Nymph Kitten",
    description: "A curious little forest companion with a sprinkle of fairy magic.",
    symbol: "🐈",
    order: 2,
    starter: false,
    defaultPaletteId: "lilac-grove",
    appearancePalettes: Object.freeze([
      Object.freeze({ id: "lilac-grove", label: "Lilac Grove", primaryColor: "#b5a3c9", secondaryColor: "#756589", accentColor: "#e6c98b" }),
      Object.freeze({ id: "mossy-meadow", label: "Mossy Meadow", primaryColor: "#91ad91", secondaryColor: "#587a6b", accentColor: "#e8d78c" }),
      Object.freeze({ id: "moon-garden", label: "Moon Garden", primaryColor: "#c5d2e7", secondaryColor: "#7886a6", accentColor: "#f0d7a6" })
    ])
  })
]);
