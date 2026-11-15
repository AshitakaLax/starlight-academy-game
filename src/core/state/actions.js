/**
 * Named action constants. Gameplay code dispatches these rather than
 * mutating state directly. New actions should be added here.
 */
export const Actions = Object.freeze({
  // App / navigation
  APP_BOOT: "app/boot",
  SCREEN_CHANGE: "screen/change",
  SETTINGS_UPDATE: "settings/update",

  // Economy
  GEMS_ADD: "economy/gems/add",
  GEMS_SPEND: "economy/gems/spend",
  SPARKLES_ADD: "economy/sparkles/add",

  // Progression
  CHAPTER_START: "progress/chapter/start",
  CHAPTER_CHECKPOINT: "progress/chapter/checkpoint",
  CHAPTER_COMPLETE: "progress/chapter/complete",
  QUEST_COMPLETE: "progress/quest/complete",

  // Skills / mastery
  SKILL_ATTEMPT: "skill/attempt",
  SKILL_TIER_SET: "skill/tier/set",

  // Pets
  PET_UNLOCK: "pet/unlock",
  PET_SELECT_ACTIVE: "pet/selectActive",
  PET_CARE: "pet/care",
  PET_APPEARANCE_SET: "pet/appearance/set",

  // Wardrobe / inventory
  ITEM_UNLOCK: "wardrobe/item/unlock",
  ITEM_PURCHASE: "wardrobe/item/purchase",
  ITEM_EQUIP: "wardrobe/item/equip",
  TEXTURE_SAVE: "wardrobe/texture/save",

  // Gymnastics
  ROUTINE_START: "gymnastics/routine/start",
  ROUTINE_CHECKPOINT: "gymnastics/routine/checkpoint",
  ROUTINE_COMPLETE: "gymnastics/routine/complete",

  // Save
  SAVE_LOADED: "save/loaded",
  SAVE_EXPORTED: "save/exported",
});
