import { chapterDefinitions, createChapterCatalog } from "../chapters/registry.js";
import {
  chapterOneActivityDefinitions, chapterOneHintDefinitions, chapterOneReward
} from "../chapters/chapterOne.js";
import {
  chapterTwoActivityDefinitions, chapterTwoHintDefinitions, chapterTwoReward
} from "../chapters/chapterTwo.js";
import {
  chapterThreeActivityDefinitions, chapterThreeHintDefinitions, chapterThreeReward
} from "../chapters/chapterThree.js";
import {
  chapterFourActivityDefinitions, chapterFourHintDefinitions, chapterFourReward
} from "../chapters/chapterFour.js";
import {
  chapterFiveActivityDefinitions, chapterFiveHintDefinitions, chapterFiveReward
} from "../chapters/chapterFive.js";
import {
  chapterSixActivityDefinitions, chapterSixHintDefinitions, chapterSixReward
} from "../chapters/chapterSix.js";
import {
  chapterSevenActivityDefinitions, chapterSevenHintDefinitions, chapterSevenReward
} from "../chapters/chapterSeven.js";
import {
  chapterEightActivityDefinitions, chapterEightHintDefinitions, chapterEightReward
} from "../chapters/chapterEight.js";
import {
  chapterNineActivityDefinitions, chapterNineHintDefinitions, chapterNineReward
} from "../chapters/chapterNine.js";
import { chapterTenReward } from "../chapters/chapterTen.js";
import {
  sideQuestDefinitions, sideQuestActivityDefinitions, sideQuestHintDefinitions,
  sideQuestRewardDefinitions
} from "../side-quests/registry.js";
import { createActivityRegistry } from "../systems/curriculum/activityDefinitions.js";
import { createQuestionGeneratorRegistry } from "../systems/curriculum/questionGenerators.js";
import { createHintRegistry } from "../systems/hints/createHintRegistry.js";
import { createRewardRegistry } from "../systems/economy/economyCatalogs.js";
import { validateAcademyContent } from "./contentValidation.js";

/** Construct and validate the exact content registries used by the browser app. */
export function createAcademyContentRegistries() {
  const rewardRegistry = createRewardRegistry([
    chapterOneReward, chapterTwoReward, chapterThreeReward, chapterFourReward,
    chapterFiveReward, chapterSixReward, chapterSevenReward, chapterEightReward,
    chapterNineReward, chapterTenReward, ...sideQuestRewardDefinitions
  ]);
  const activityRegistry = createActivityRegistry([
    ...chapterOneActivityDefinitions, ...chapterTwoActivityDefinitions,
    ...chapterThreeActivityDefinitions, ...chapterFourActivityDefinitions,
    ...chapterFiveActivityDefinitions, ...chapterSixActivityDefinitions,
    ...chapterSevenActivityDefinitions, ...chapterEightActivityDefinitions,
    ...chapterNineActivityDefinitions, ...sideQuestActivityDefinitions
  ]);
  const questionGeneratorRegistry = createQuestionGeneratorRegistry();
  const hintRegistry = createHintRegistry({
    activityRegistry,
    initialDefinitions: [
      ...chapterOneHintDefinitions, ...chapterTwoHintDefinitions,
      ...chapterThreeHintDefinitions, ...chapterFourHintDefinitions,
      ...chapterFiveHintDefinitions, ...chapterSixHintDefinitions,
      ...chapterSevenHintDefinitions, ...chapterEightHintDefinitions,
      ...chapterNineHintDefinitions, ...sideQuestHintDefinitions
    ]
  });
  const chapterCatalog = createChapterCatalog([...chapterDefinitions, ...sideQuestDefinitions]);

  const validation = validateAcademyContent({
    chapterCatalog,
    sideQuestDefinitions,
    activityRegistry,
    questionGeneratorRegistry,
    hintRegistry,
    rewardRegistry
  });

  return Object.freeze({
    chapterCatalog,
    activityRegistry,
    questionGeneratorRegistry,
    hintRegistry,
    rewardRegistry,
    sideQuestDefinitions,
    validation
  });
}
