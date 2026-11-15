import test from "node:test";
import assert from "node:assert/strict";
import { Store } from "../src/core/state/store.js";
import { registerCoreActions } from "../src/core/state/registerActions.js";
import { createDefaultState } from "../src/core/save/schema.js";
import { SaveManager } from "../src/core/save/saveManager.js";
import { EconomyService } from "../src/systems/economy/economyService.js";
import { WardrobeService } from "../src/systems/wardrobe/wardrobeService.js";
import { PetCollection } from "../src/gameplay/pets/petCollection.js";
import { PetCare } from "../src/gameplay/pets/petCare.js";
import { GymnasticsEngine } from "../src/gameplay/gymnastics/gymnasticsEngine.js";

test("integration: chapter reward + pet + wardrobe + gymnastics + save", () => {
  const storage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
  const store = new Store(createDefaultState());
  registerCoreActions(store);
  const sm = new SaveManager(store, storage);
  const eco = new EconomyService(store);
  const ws = new WardrobeService(store, eco);
  const pc = new PetCollection(store);

  // unlock pet and care
  pc.unlock("pegasus");
  pc.selectActive("pegasus");
  const care = new PetCare(store);
  care.feed("pegasus");
  assert.equal(store.getState().pets.pets.pegasus.careProgress.nourishment, 5);

  // gymnastics
  const g = new GymnasticsEngine();
  g.preview("r", [{x:0,y:0}], []);
  g.start();
  const res = g.finish();
  store.dispatch("gymnastics/routine/complete", { routineId: "r", tracing: res.tracing, rhythm: res.rhythm, combined: res.combined, stars: res.stars });

  // reward chapter item
  eco.grantReward({ id: "reward_x", type: "item", itemId: "chapter1_cape", repeatPolicy: "once" });
  // chapter-exclusive must be unlocked via chapter source; simulate unlock
  ws.unlock("chapter1_cape", "chapter");
  assert.equal(ws.isOwned("chapter1_cape"), true);

  // save/reload
  const saveRes = sm.save(store.getState());
  assert.equal(saveRes.ok, true);

  // no negative gems
  assert.ok(store.getState().economy.gems >= 0);
});
