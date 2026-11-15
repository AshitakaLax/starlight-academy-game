import { SKILL_IDS } from "../systems/curriculum/skillRegistry.js";

export const chapter4Definition = {
  id: "chapter4",
  title: "Geometry on the Balance Beam",
  theme: "Geometry studio",
  learningFocus: "Shapes, symmetry, angles, perimeter, area",
  skillIds: [SKILL_IDS.MATH_GEOMETRY_SHAPES],
  reward: { id: "reward_chapter4_beam", type: "item", itemId: "chapter4_beam", repeatPolicy: "once" },
  scenes: [
    { id: "intro", type: "story", text: "Geometry studio: trace and construct shapes." },
    { id: "practice", type: "practice", skillId: SKILL_IDS.MATH_GEOMETRY_SHAPES, count: 3 },
    { id: "reward", type: "reward", text: "You earned the Balance Beam Badge!" },
  ],
};

export default chapter4Definition;
