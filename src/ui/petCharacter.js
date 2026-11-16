const SPECIES_DEFAULTS = Object.freeze({
  pegasus: Object.freeze({ primaryColor: "#fffaf3", secondaryColor: "#b99bd0", accentColor: "#e8c879" }),
  phoenix: Object.freeze({ primaryColor: "#f4a45d", secondaryColor: "#c95850", accentColor: "#ffdf8a" }),
  "nymph-kitten": Object.freeze({ primaryColor: "#b5a3c9", secondaryColor: "#756589", accentColor: "#e6c98b" })
});

const SPECIES_ART = Object.freeze({
  pegasus: [
    '<g class="pet-character-tail"><path d="M51 91 Q31 82 28 98 Q39 111 51 103 Q37 109 36 119" fill="none" stroke="var(--pet-secondary)" stroke-width="9" stroke-linecap="round"/><path d="M35 112l-7 7" stroke="var(--pet-accent)" stroke-width="3" stroke-linecap="round"/></g>',
    '<g class="pet-character-wing pet-character-wing--far"><path d="M73 76 Q43 52 48 30 Q70 34 84 63 Q91 40 105 38 Q111 64 91 85Z" fill="var(--pet-secondary)" stroke="#806b91" stroke-width="2.5" stroke-linejoin="round"/><path d="M57 43 Q70 51 80 72 M72 38 Q83 49 88 69 M89 43 Q96 54 94 71" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".78"/></g>',
    '<g class="pet-character-body" stroke="#76627f" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">',
    '<path d="M68 92 Q68 116 63 126 M84 103 Q85 119 82 129 M104 102 Q108 117 110 128 M119 88 Q126 109 126 124" fill="none" stroke="var(--pet-primary)" stroke-width="10"/><path d="M58 127h10 M77 130h11 M105 129h11 M121 125h11" fill="none" stroke="#806a8b" stroke-width="4"/>',
    '<ellipse cx="91" cy="91" rx="38" ry="23" fill="var(--pet-primary)"/>',
    '<path d="M105 93 Q111 76 111 62 Q112 45 128 43 Q145 44 146 59 Q147 71 132 76 L121 75 L119 101" fill="var(--pet-primary)"/>',
    '<path d="M125 47 Q118 31 126 26 Q137 30 139 46" fill="var(--pet-primary)"/><path d="M128 47 Q128 37 132 34" fill="none" stroke="#fff" stroke-width="2" opacity=".75"/>',
    '<path d="M113 51 Q101 34 109 27 Q119 31 123 43 Q128 27 139 29 Q143 39 135 48 Q151 37 155 46 Q150 58 137 58" fill="var(--pet-secondary)" stroke="#806b91"/>',
    '<path d="M118 65 Q132 83 148 70 Q141 89 123 81" fill="var(--pet-secondary)" stroke="#806b91"/>',
    '<ellipse cx="136" cy="57" rx="3.6" ry="5" fill="#44364f" stroke="none" class="pet-character-eye"/><circle cx="137" cy="55" r="1.2" fill="#fff" stroke="none"/>',
    '<path d="M146 68q3 3 6 0" fill="none"/><ellipse cx="150" cy="63" rx="2" ry="1.5" fill="#8b6478" stroke="none"/>',
    '<path d="M80 82 Q71 66 75 56 Q86 62 92 78" fill="var(--pet-secondary)" opacity=".9"/><path d="M76 83 Q70 70 64 68" fill="none" stroke="#9f84b4" stroke-width="3"/>',
    '</g>',
    '<g class="pet-character-wing pet-character-wing--near"><path d="M82 79 Q54 70 52 54 Q70 48 91 70 Q96 52 109 48 Q116 68 97 88Z" fill="var(--pet-secondary)" stroke="#806b91" stroke-width="2.2"/><path d="M61 57 Q75 63 88 78 M80 54 Q91 62 95 79 M98 55 Q105 65 102 80" fill="none" stroke="#fff" stroke-width="2.7" stroke-linecap="round" opacity=".8"/></g>',
    '<path d="M154 92l3 6 7 1-5 5 1 7-6-4-6 4 1-7-5-5 7-1Z" fill="var(--pet-accent)" stroke="none" opacity=".95"/>',
    '<path d="M64 48l2 4 5 1-4 3 1 5-4-3-4 3 1-5-4-3 5-1Z" fill="var(--pet-accent)" stroke="none"/>'
  ].join(""),
  phoenix: [
    '<g class="pet-character-tail"><path d="M81 111 Q67 132 51 128 Q55 115 73 105 Q55 112 42 104 Q50 94 73 96" fill="var(--pet-secondary)" stroke="#965b63" stroke-width="2.3"/><path d="M55 119q-2 8-8 9 M57 107q-8 0-13-4" fill="none" stroke="var(--pet-accent)" stroke-width="3" stroke-linecap="round"/></g>',
    '<g class="pet-character-wing pet-character-wing--far"><path d="M88 85 Q61 76 45 53 Q50 39 65 48 Q72 29 86 41 Q100 51 105 76Z" fill="var(--pet-secondary)" stroke="#94575c" stroke-width="2.5"/><path d="M53 53q20 10 39 30 M68 44q15 12 25 33 M83 46q11 11 14 25" fill="none" stroke="var(--pet-accent)" stroke-width="3" stroke-linecap="round"/></g>',
    '<g class="pet-character-body" stroke="#965b63" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round">',
    '<path d="M81 104 Q77 119 68 126 M100 105 Q105 119 116 123" fill="none" stroke="#c65d52" stroke-width="7"/><path d="M64 127l8-1 M112 124l8 2" fill="none" stroke="#8f665c" stroke-width="3"/>',
    '<path d="M66 96 Q69 65 93 62 Q118 62 124 93 Q121 116 96 118 Q72 116 66 96Z" fill="var(--pet-primary)"/>',
    '<path d="M95 76 Q91 56 104 43 Q117 37 128 48 Q139 61 128 75 Q120 83 111 80 L108 97" fill="var(--pet-primary)"/>',
    '<path d="M124 60l20 7-18 8Z" fill="var(--pet-accent)" stroke="#965b63"/><path d="M107 43 Q97 30 105 22 Q114 28 115 39 Q122 26 132 30 Q135 39 126 47" fill="var(--pet-secondary)"/>',
    '<path d="M81 74 Q61 60 57 77 Q61 92 82 94" fill="none" stroke="var(--pet-accent)" stroke-width="8" opacity=".9"/>',
    '<ellipse cx="121" cy="57" rx="3.6" ry="5" fill="#4a3546" stroke="none" class="pet-character-eye"/><circle cx="122" cy="55" r="1.2" fill="#fff" stroke="none"/>',
    '<path d="M126 70q4 3 7 0" fill="none"/><circle cx="137" cy="68" r="2" fill="#e78972" stroke="none"/>',
    '<path d="M151 43q-8-11-1-17 9 7 1 17 M158 50q8-14 15-8-2 12-15 8" fill="var(--pet-accent)" stroke="#d18455" stroke-width="1.5"/>',
    '</g>',
    '<g class="pet-character-wing pet-character-wing--near"><path d="M91 86 Q65 75 58 58 Q63 48 75 56 Q87 48 99 65 Q108 79 105 94Z" fill="var(--pet-secondary)" stroke="#94575c" stroke-width="2.4"/><path d="M65 61q18 8 31 26 M79 58q13 12 19 29" fill="none" stroke="var(--pet-accent)" stroke-width="3" stroke-linecap="round"/></g>',
    '<path d="M45 31l3 7 8 1-6 5 1 8-6-4-7 4 2-8-6-5 8-1Z" fill="var(--pet-accent)"/>'
  ].join(""),
  "nymph-kitten": [
    '<g class="pet-character-tail"><path d="M113 105 Q149 112 148 87 Q147 72 135 78 Q128 83 136 90" fill="none" stroke="var(--pet-secondary)" stroke-width="11" stroke-linecap="round"/><path d="M140 80q8-6 13 2" fill="none" stroke="var(--pet-accent)" stroke-width="3" stroke-linecap="round"/></g>',
    '<g class="pet-character-wing pet-character-wing--far"><path d="M67 83 Q43 65 51 49 Q66 49 80 72 Q89 54 102 56 Q107 77 84 91Z" fill="var(--pet-secondary)" stroke="#87769a" stroke-width="2.2"/><path d="M57 56q12 10 20 27 M75 57q9 8 12 22" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/></g>',
    '<g class="pet-character-body" stroke="#756589" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">',
    '<ellipse cx="95" cy="102" rx="32" ry="25" fill="var(--pet-primary)"/>',
    '<path d="M76 111 Q75 126 67 129 M96 119 Q97 129 91 132 M112 114 Q119 125 121 130" fill="none" stroke="var(--pet-primary)" stroke-width="9"/><path d="M62 130h10 M87 133h10 M117 131h9" fill="none" stroke="#756589" stroke-width="3.5"/>',
    '<path d="M61 64 Q52 38 63 26 Q78 29 82 52 Q99 38 115 49 Q132 61 126 84 Q122 108 95 109 Q67 107 59 86Z" fill="var(--pet-primary)"/>',
    '<path d="M64 49 Q52 16 68 15 Q84 26 82 51Z" fill="var(--pet-secondary)"/><path d="M107 48 Q116 15 130 27 Q137 44 120 58Z" fill="var(--pet-secondary)"/>',
    '<path d="M67 26l8 20-10-5 M124 30l-8 21 11-7" fill="none" stroke="#e9dce8" stroke-width="3"/>',
    '<path d="M77 54q8-7 15 0 M105 54q8-7 14 0" fill="none" stroke="var(--pet-secondary)" stroke-width="5"/>',
    '<ellipse cx="83" cy="70" rx="3.5" ry="5" fill="#493b5a" stroke="none" class="pet-character-eye"/><ellipse cx="111" cy="70" rx="3.5" ry="5" fill="#493b5a" stroke="none" class="pet-character-eye"/><circle cx="84" cy="68" r="1.1" fill="#fff" stroke="none"/><circle cx="112" cy="68" r="1.1" fill="#fff" stroke="none"/>',
    '<path d="M93 79q4-4 8 0q-4 7-8 0Z" fill="#d98eaa" stroke="none"/><path d="M98 85q-5 8-10 2 M98 85q5 8 10 2" fill="none" stroke="#756589" stroke-width="1.8"/>',
    '<ellipse cx="70" cy="81" rx="6" ry="3.5" fill="#e8a8bd" stroke="none" opacity=".8"/><ellipse cx="121" cy="81" rx="6" ry="3.5" fill="#e8a8bd" stroke="none" opacity=".8"/>',
    '<path d="M74 42q7-12 15-7 M99 37q10-8 18 2" fill="none" stroke="var(--pet-accent)" stroke-width="4"/>',
    '</g>',
    '<g class="pet-character-wing pet-character-wing--near"><path d="M81 85 Q58 79 57 63 Q72 57 91 79 Q99 63 110 64 Q116 80 99 93Z" fill="var(--pet-secondary)" stroke="#87769a" stroke-width="2"/><path d="M64 66q14 8 24 19 M87 68q8 8 10 19" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/></g>',
    '<path d="M47 92l3 6 6 1-5 4 1 7-5-4-6 4 1-7-5-4 6-1Z" fill="var(--pet-accent)"/>'
  ].join("")
});


const ACCESSORY_THEME_COLORS = Object.freeze({
  silver: "#d8cbe5",
  lavender: "#c8a8de",
  moonlight: "#d7d1f2",
  starlight: "#f0c979",
  moonbeam: "#df9cbd"
});

const ACCESSORY_HEAD_ANCHORS = Object.freeze({
  pegasus: "translate(134 31) scale(.68)",
  phoenix: "translate(121 27) scale(.62)",
  "nymph-kitten": "translate(96 27) scale(.68)"
});

const ACCESSORY_NECK_ANCHORS = Object.freeze({
  pegasus: "translate(111 93)",
  phoenix: "translate(105 96)",
  "nymph-kitten": "translate(100 107)"
});

function createPetAccessoryMarkup(species, accessories) {
  const selected = new Map();
  if (Array.isArray(accessories)) {
    for (const item of accessories) {
      if (!item || !["head", "accessory"].includes(item.slot)) continue;
      const color = Object.hasOwn(ACCESSORY_THEME_COLORS, item.theme)
        ? ACCESSORY_THEME_COLORS[item.theme]
        : "#e8c879";
      selected.set(item.slot, color);
    }
  }
  const headColor = selected.get("head");
  const neckColor = selected.get("accessory");
  if (!headColor && !neckColor) return "";
  const head = headColor
    ? '<g class="pet-character-accessory pet-character-accessory--head" data-pet-accessory="head" transform="' + ACCESSORY_HEAD_ANCHORS[species] + '" stroke="#8b7295" stroke-width="1.8" stroke-linejoin="round"><path d="M-17 7L-13-4L-5 2L0-10L6 2L14-4L18 7Z" fill="' + headColor + '"/><path d="M-17 8H18" fill="none" stroke="#8b7295" stroke-width="2.3"/><circle cx="0" cy="-4" r="2.4" fill="#fff8e8" stroke="none"/></g>'
    : "";
  const neck = neckColor
    ? '<g class="pet-character-accessory pet-character-accessory--neck" data-pet-accessory="accessory"><g transform="' + ACCESSORY_NECK_ANCHORS[species] + '"><path d="M-10-5Q0 4 10-5" fill="none" stroke="' + neckColor + '" stroke-width="2.8" stroke-linecap="round"/><path d="M0 0L5 6L0 14L-5 6Z" fill="' + neckColor + '" stroke="#8b7295" stroke-width="1.5"/><circle cx="0" cy="5" r="1.5" fill="#fff8e8" stroke="none"/></g></g>'
    : "";
  return '<g class="pet-character-accessories">' + head + neck + '</g>';
}

const VALID_REACTIONS = new Set(["feeding", "grooming", "play"]);
const isHexColor = (value) => typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value);

function resolvePalette(species, palette = {}) {
  const fallback = SPECIES_DEFAULTS[species];
  return Object.freeze({
    primaryColor: isHexColor(palette.primaryColor) ? palette.primaryColor.toLowerCase() : fallback.primaryColor,
    secondaryColor: isHexColor(palette.secondaryColor) ? palette.secondaryColor.toLowerCase() : fallback.secondaryColor,
    accentColor: isHexColor(palette.accentColor) ? palette.accentColor.toLowerCase() : fallback.accentColor
  });
}

/**
 * Build a self-contained, decorative SVG companion. Reactions are transient
 * presentation only; no animation state is written to the saved game model.
 */
export function createPetCharacterMarkup({ species, palette, reaction = "idle", accessories = [] } = {}) {
  if (!Object.hasOwn(SPECIES_ART, species)) {
    throw new TypeError("Pet character species is not supported: " + String(species));
  }
  const colors = resolvePalette(species, palette);
  const activeReaction = VALID_REACTIONS.has(reaction) ? reaction : "idle";
  const effects = [
    '<g class="pet-character-effect pet-character-effect--feeding"><path d="M145 33c-8-10-20 1-12 10l12 12 12-12c8-9-4-20-12-10Z" fill="#ee8fa8" stroke="#b96b8a" stroke-width="2"/><path d="M141 36q4 4 6 8" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"/></g>',
    '<g class="pet-character-effect pet-character-effect--grooming"><path d="M145 22l4 9 10 1-8 6 2 10-8-5-9 5 3-10-8-6 10-1Z M42 40l3 6 7 1-6 4 1 7-5-4-6 4 1-7-6-4 7-1Z" fill="#f4d57e"/><circle cx="150" cy="66" r="3" fill="#fff" stroke="#d5b3e8" stroke-width="2"/><circle cx="39" cy="76" r="3" fill="#fff" stroke="#d5b3e8" stroke-width="2"/></g>',
    '<g class="pet-character-effect pet-character-effect--play"><path d="M21 112 Q2 78 32 67 Q53 58 58 83 Q61 102 40 99 Q29 98 32 86" fill="none" stroke="#df8fb5" stroke-width="4" stroke-linecap="round"/><path d="M21 112q-11-8-16 0q7 12 16 0q9 12 16 0q-6-9-16 0Z" fill="#df8fb5" stroke="#b96e9c" stroke-width="1.5"/><path d="M153 110l3 6 7 1-6 4 1 7-5-4-6 4 1-7-6-4 7-1Z" fill="#f0d17e"/></g>'
  ].join("");
  return [
    '<svg class="pet-character-art pet-character-art--', species, '" viewBox="0 0 180 150" data-reaction="', activeReaction, '" style="--pet-primary:', colors.primaryColor, ';--pet-secondary:', colors.secondaryColor, ';--pet-accent:', colors.accentColor, '" aria-hidden="true" focusable="false">',
    '<ellipse cx="91" cy="137" rx="43" ry="6" fill="#76627f" opacity=".12"/>',
    SPECIES_ART[species],
    createPetAccessoryMarkup(species, accessories),
    effects,
    '</svg>'
  ].join("");
}


/**
 * Resolve a saved pet appearance into the exact colors and SVG used by the UI.
 * The returned palette ID is mirrored on the character stage for diagnostics
 * and browser-level verification.
 */
export function createPetCharacterPresentation(pet, reaction = "idle", accessories = []) {
  if (!pet || typeof pet.id !== "string" || !pet.id.startsWith("pet.")) {
    throw new TypeError("A registered pet is required to create its character presentation.");
  }
  const species = pet.id.slice("pet.".length);
  if (!Object.hasOwn(SPECIES_ART, species)) {
    throw new TypeError("Pet character species is not supported: " + species);
  }
  const palettes = Array.isArray(pet.appearancePalettes) ? pet.appearancePalettes : [];
  const selectedPalette = palettes.find((entry) => entry.id === pet.appearance?.paletteId)
    ?? palettes[0]
    ?? SPECIES_DEFAULTS[species];
  const paletteId = palettes.includes(selectedPalette) ? selectedPalette.id : "default";
  const colors = resolvePalette(species, selectedPalette);
  return Object.freeze({
    species,
    paletteId,
    palette: colors,
    markup: createPetCharacterMarkup({ species, palette: colors, reaction, accessories })
  });
}
