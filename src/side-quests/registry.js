import { sideQuestOneDefinition, sideQuestOneActivityDefinitions, sideQuestOneHintDefinitions, sideQuestOneReward } from "./sideQuestOne.js";
import { sideQuestTwoDefinition, sideQuestTwoActivityDefinitions, sideQuestTwoHintDefinitions, sideQuestTwoReward } from "./sideQuestTwo.js";
import { sideQuestThreeDefinition, sideQuestThreeActivityDefinitions, sideQuestThreeHintDefinitions, sideQuestThreeReward } from "./sideQuestThree.js";
import { sideQuestFourDefinition, sideQuestFourActivityDefinitions, sideQuestFourHintDefinitions, sideQuestFourReward } from "./sideQuestFour.js";
import { sideQuestFiveDefinition, sideQuestFiveActivityDefinitions, sideQuestFiveHintDefinitions, sideQuestFiveReward } from "./sideQuestFive.js";
import { sideQuestSixDefinition, sideQuestSixActivityDefinitions, sideQuestSixHintDefinitions, sideQuestSixReward } from "./sideQuestSix.js";
import { sideQuestSevenDefinition, sideQuestSevenActivityDefinitions, sideQuestSevenHintDefinitions, sideQuestSevenReward } from "./sideQuestSeven.js";
import { sideQuestEightDefinition, sideQuestEightActivityDefinitions, sideQuestEightHintDefinitions, sideQuestEightReward } from "./sideQuestEight.js";
import { sideQuestNineDefinition, sideQuestNineActivityDefinitions, sideQuestNineHintDefinitions, sideQuestNineReward } from "./sideQuestNine.js";
import { sideQuestTenDefinition, sideQuestTenActivityDefinitions, sideQuestTenHintDefinitions, sideQuestTenReward } from "./sideQuestTen.js";

/**
 * Data-driven optional side-quest registry. Quest progress shares the safe
 * chapter-session runtime while retaining quest-* identifiers and a separate
 * optional catalogue, so required chapter sequences are never extended.
 */
export { createSideQuestDefinition, validateSideQuestDefinition } from "./sideQuestCatalog.js";

export const sideQuestDefinitions = Object.freeze([
  sideQuestOneDefinition,
  sideQuestTwoDefinition,
  sideQuestThreeDefinition,
  sideQuestFourDefinition,
  sideQuestFiveDefinition,
  sideQuestSixDefinition,
  sideQuestSevenDefinition,
  sideQuestEightDefinition,
  sideQuestNineDefinition,
  sideQuestTenDefinition
]);
export const sideQuestActivityDefinitions = Object.freeze([
  ...sideQuestOneActivityDefinitions,
  ...sideQuestTwoActivityDefinitions,
  ...sideQuestThreeActivityDefinitions,
  ...sideQuestFourActivityDefinitions,
  ...sideQuestFiveActivityDefinitions,
  ...sideQuestSixActivityDefinitions,
  ...sideQuestSevenActivityDefinitions,
  ...sideQuestEightActivityDefinitions,
  ...sideQuestNineActivityDefinitions,
  ...sideQuestTenActivityDefinitions
]);
export const sideQuestHintDefinitions = Object.freeze([
  ...sideQuestOneHintDefinitions,
  ...sideQuestTwoHintDefinitions,
  ...sideQuestThreeHintDefinitions,
  ...sideQuestFourHintDefinitions,
  ...sideQuestFiveHintDefinitions,
  ...sideQuestSixHintDefinitions,
  ...sideQuestSevenHintDefinitions,
  ...sideQuestEightHintDefinitions,
  ...sideQuestNineHintDefinitions,
  ...sideQuestTenHintDefinitions
]);
export const sideQuestRewardDefinitions = Object.freeze([
  sideQuestOneReward,
  sideQuestTwoReward,
  sideQuestThreeReward,
  sideQuestFourReward,
  sideQuestFiveReward,
  sideQuestSixReward,
  sideQuestSevenReward,
  sideQuestEightReward,
  sideQuestNineReward,
  sideQuestTenReward
]);

/** @param {string} id */
export function getSideQuestDefinition(id) {
  return sideQuestDefinitions.find((quest) => quest.id === id) ?? null;
}
