import { createActivityDefinition } from "../systems/curriculum/activityDefinitions.js";
import { createSideQuestDefinition } from "./sideQuestCatalog.js";
import { createRewardDefinition } from "../systems/economy/economyCatalogs.js";

const supportedTiers = ["foundation", "core", "stretch"];
const habitatSkills = ["science.habitats"];

export const sideQuestTenActivityDefinitions = Object.freeze([
  createActivityDefinition({
    id: "quest-10.ecosystem-cause-tracker",
    title: "The Ecosystem Cause Tracker",
    skillIds: habitatSkills,
    objectives: [
      "Infer an animal action from an observed ecosystem effect.",
      "Connect a habitat change to a plausible cause recorded in the curated field guide."
    ],
    supportedTiers,
    answerRules: { type: "exact", caseSensitive: false },
    generatorId: "quests.ecosystem-cause-tracker",
    generatorConstraints: {
      foundation: { choiceCount: 4 },
      core: { choiceCount: 4 },
      stretch: { choiceCount: 4 }
    }
  })
]);

const causeTrackerDemonstration = {
  title: "Trace an ecosystem effect back to its cause",
  introduction: "A field ranger can investigate a change in the habitat and look for an animal action that could explain it.",
  steps: [
    { label: "Notice the effect", explanation: "A new pond and wetland habitat has appeared beside a wooded stream.", visual: { kind: "diagram", content: "Stream → pond and wetland", ariaLabel: "A pond and wetland have formed beside a stream" } },
    { label: "Think about what could cause it", explanation: "A beaver gathers branches and builds a dam that slows the stream.", visual: { kind: "diagram", content: "Beaver builds a dam", ariaLabel: "A beaver builds a dam across a stream" } },
    { label: "Connect cause and effect", explanation: "The dam can slow the water and form a pond that provides habitat for other wildlife.", visual: { kind: "equation", content: "Dam → slower water → wetland habitat", ariaLabel: "A beaver dam can slow water and form wetland habitat" } }
  ],
  summary: "Use the observed effect and habitat context to infer which recorded animal action could have caused it."
};

export const sideQuestTenHintDefinitions = Object.freeze([
  {
    activityId: "quest-10.ecosystem-cause-tracker",
    title: "Professor Hoot's ecosystem investigation clues",
    skillIds: habitatSkills,
    stages: [
      { attempt: 1, kind: "nudge", message: "Start with the effect that the ranger observed. What kind of animal action could lead to that change?" },
      { attempt: 2, kind: "strategy", message: "Use the habitat context to narrow the choices. Then check which action could reasonably produce the described effect." },
      { attempt: 3, kind: "demonstration", message: "Professor Hoot will trace a beaver's dam-building action back from a new wetland.", demonstration: causeTrackerDemonstration }
    ]
  }
]);

export const sideQuestTenReward = createRewardDefinition({
  id: "reward.quest-10-ecosystem-field-lens",
  sourceId: "quest-10",
  title: "Ecosystem Field Lens",
  starGems: 65,
  starlightSparkles: 4,
  replayPolicy: { type: "once" }
});

export const sideQuestTenDefinition = createSideQuestDefinition({
  id: "quest-10",
  questType: "application",
  sourceChapterId: "chapter-05",
  title: "The Ecosystem Cause Tracker",
  description: "Follow the sanctuary rangers' field notes and discover which animal actions could explain changes in the habitats around them.",
  objectives: [
    "Interpret a described habitat effect using the surrounding ecosystem context.",
    "Infer a plausible animal action from an observed result."
  ],
  activities: [{
    id: "quest-10.follow-the-field-effects",
    title: "The Ecosystem Cause Tracker",
    type: "challenge",
    description: "Read an observed ecosystem effect and its habitat context, then choose the animal action that could have caused the change.",
    activityId: "quest-10.ecosystem-cause-tracker",
    skillIds: habitatSkills,
    metadata: {
      questionCount: 5,
      challengeLabel: "Ecosystem mysteries solved",
      successText: "The field notes now reveal the causes behind the sanctuary's habitat changes!"
    }
  }],
  majorRewardIds: [sideQuestTenReward.id]
});
