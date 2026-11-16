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
import { sideQuestElevenDefinition, sideQuestElevenActivityDefinitions, sideQuestElevenHintDefinitions, sideQuestElevenReward } from "./sideQuestEleven.js";
import { sideQuestTwelveDefinition, sideQuestTwelveActivityDefinitions, sideQuestTwelveHintDefinitions, sideQuestTwelveReward } from "./sideQuestTwelve.js";
import { sideQuestThirteenDefinition, sideQuestThirteenActivityDefinitions, sideQuestThirteenHintDefinitions, sideQuestThirteenReward } from "./sideQuestThirteen.js";
import { sideQuestFourteenDefinition, sideQuestFourteenActivityDefinitions, sideQuestFourteenHintDefinitions, sideQuestFourteenReward } from "./sideQuestFourteen.js";
import { sideQuestFifteenDefinition, sideQuestFifteenActivityDefinitions, sideQuestFifteenHintDefinitions, sideQuestFifteenReward } from "./sideQuestFifteen.js";
import { sideQuestSixteenDefinition, sideQuestSixteenActivityDefinitions, sideQuestSixteenHintDefinitions, sideQuestSixteenReward } from "./sideQuestSixteen.js";
import { sideQuestSeventeenDefinition, sideQuestSeventeenActivityDefinitions, sideQuestSeventeenHintDefinitions, sideQuestSeventeenReward } from "./sideQuestSeventeen.js";
import { sideQuestEighteenDefinition, sideQuestEighteenActivityDefinitions, sideQuestEighteenHintDefinitions, sideQuestEighteenReward } from "./sideQuestEighteen.js";

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
  sideQuestTenDefinition,
  sideQuestElevenDefinition,
  sideQuestTwelveDefinition,
  sideQuestThirteenDefinition,
  sideQuestFourteenDefinition,
  sideQuestFifteenDefinition,
  sideQuestSixteenDefinition,
  sideQuestSeventeenDefinition,
  sideQuestEighteenDefinition
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
  ...sideQuestTenActivityDefinitions,
  ...sideQuestElevenActivityDefinitions,
  ...sideQuestTwelveActivityDefinitions,
  ...sideQuestThirteenActivityDefinitions,
  ...sideQuestFourteenActivityDefinitions,
  ...sideQuestFifteenActivityDefinitions,
  ...sideQuestSixteenActivityDefinitions,
  ...sideQuestSeventeenActivityDefinitions,
  ...sideQuestEighteenActivityDefinitions
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
  ...sideQuestTenHintDefinitions,
  ...sideQuestElevenHintDefinitions,
  ...sideQuestTwelveHintDefinitions,
  ...sideQuestThirteenHintDefinitions,
  ...sideQuestFourteenHintDefinitions,
  ...sideQuestFifteenHintDefinitions,
  ...sideQuestSixteenHintDefinitions,
  ...sideQuestSeventeenHintDefinitions,
  ...sideQuestEighteenHintDefinitions
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
  sideQuestTenReward,
  sideQuestElevenReward,
  sideQuestTwelveReward,
  sideQuestThirteenReward,
  sideQuestFourteenReward,
  sideQuestFifteenReward,
  sideQuestSixteenReward,
  sideQuestSeventeenReward,
  sideQuestEighteenReward
]);

/** @param {string} id */
export function getSideQuestDefinition(id) {
  return sideQuestDefinitions.find((quest) => quest.id === id) ?? null;
}
