# Wardrobe and inventory

The wardrobe system owns cosmetic item definitions, acquisition-source validation, saved ownership, and equipment selection. It does not own currency balances; shop purchases reuse the STEP-13 economy reducer.

- `wardrobeCatalog.js` defines the four equipment slots (head, outfit, footwear, accessory), validates immutable items, provides the default academy collection, and derives the Star Gem shop entries.
- `wardrobeState.js` creates the save-backed `wardrobe.inventory` and `wardrobe.equipped` records. New players begin with one equipped starter item in each slot.
- `wardrobeActions.js` defines three validated actions. Chapter/quest unlocks must match the exact source registered by the item. Shop purchases reuse the catalog-priced economy purchase reducer and add the ownership record to the same state transition. Equipment changes require an owned item with the matching slot.
- `createWardrobeService.js` exposes inventory/equipment snapshots, item purchases, explicit source-based unlocks, equip, and unequip. Chapter and quest completion handlers call `unlockSource(sourceId)` only after the corresponding content is completed.
- `createAcademyShell.js` renders equipped slots and item cards. Owned items can be worn; purchasable items show their Star Gem price and are disabled when funds are insufficient; chapter/quest pieces show their earning source.

Default catalog content includes four starter cosmetics, one chapter-exclusive outfit, and four optional shop cosmetics. Purchases are one-time per item. Ownership and equipment are part of the normal save payload; older saves receive the starter wardrobe defaults using the existing state-default merge.

The browser registers the sample Chapter 1 reward item against `chapter-01`, but a chapter runtime does not yet exist. The unlock service is ready for the later chapter-completion system to call with its completed chapter/quest ID; the wardrobe itself does not allow an item to unlock from a different source ID.

Implementation: `STEP-14`.
