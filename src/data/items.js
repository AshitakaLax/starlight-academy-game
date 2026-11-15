/**
 * Item catalog. Ownership source: default, chapter, quest, shop.
 */
export const ITEM_CATALOG = [
  { id: "outfit_default", name: "Starter Tunic", slot: "outfit", source: "default", price: 0 },
  { id: "ribbon_star", name: "Star Ribbon", slot: "accessory", source: "shop", price: 20 },
  { id: "chapter1_cape", name: "Ribbon Cape", slot: "back", source: "chapter", chapterId: "chapter1", price: null },
  { id: "chapter2_lyre", name: "Apollo's Lyre", slot: "back", source: "chapter", chapterId: "chapter2", price: null },
  { id: "chapter3_spellbook", name: "Spellbook", slot: "back", source: "chapter", chapterId: "chapter3", price: null },
  { id: "chapter4_beam", name: "Beam Badge", slot: "accessory", source: "chapter", chapterId: "chapter4", price: null },
  { id: "chapter5_quiver", name: "Quiver", slot: "back", source: "chapter", chapterId: "chapter5", price: null },
  { id: "chapter6_greenhouse", name: "Greenhouse Key", slot: "accessory", source: "chapter", chapterId: "chapter6", price: null },
  { id: "chapter7_scroll", name: "Athena Scroll", slot: "back", source: "chapter", chapterId: "chapter7", price: null },
  { id: "chapter8_trident", name: "Trident", slot: "back", source: "chapter", chapterId: "chapter8", price: null },
  { id: "chapter9_chimera", name: "Chimera Crest", slot: "accessory", source: "chapter", chapterId: "chapter9", price: null },
  { id: "chapter10_trophy", name: "Championship Trophy", slot: "back", source: "chapter", chapterId: "chapter10", price: null },
];
export default ITEM_CATALOG;
