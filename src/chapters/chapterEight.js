import { createActivityDefinition } from "../systems/curriculum/activityDefinitions.js";
import { createChapterDefinition } from "../gameplay/chapter-runtime/chapterCatalog.js";
import { createRewardDefinition } from "../systems/economy/economyCatalogs.js";

const supportedTiers = ["foundation", "core", "stretch"];
const fourChoices = Object.freeze({
  foundation: { choiceCount: 4 }, core: { choiceCount: 4 }, stretch: { choiceCount: 4 }
});

function createPoseidonActivity({ id, title, skillId, objective, generatorId }) {
  return createActivityDefinition({
    id, title, skillIds: [skillId], objectives: [objective], supportedTiers,
    answerRules: { type: "exact", caseSensitive: false },
    generatorId, generatorConstraints: fourChoices
  });
}

export const chapterEightActivityDefinitions = Object.freeze([
  createPoseidonActivity({
    id: "chapter-08.volume-reading",
    title: "The Tidepool Measuring Station",
    skillId: "math.volume",
    objective: "Read a graduated beaker scale to determine the volume of liquid in milliliters.",
    generatorId: "measurement.volume-reading"
  }),
  createPoseidonActivity({
    id: "chapter-08.mass-balance",
    title: "The Balanced Treasure Scales",
    skillId: "math.mass",
    objective: "Find an object's mass by combining standard gram weights on a balanced scale.",
    generatorId: "measurement.mass-balance"
  }),
  createPoseidonActivity({
    id: "chapter-08.unit-conversion",
    title: "The Metric Current Converter",
    skillId: "math.unit-conversion",
    objective: "Convert metric length, capacity, and mass measurements within the same unit system.",
    generatorId: "measurement.unit-conversion"
  }),
  createPoseidonActivity({
    id: "chapter-08.elapsed-time",
    title: "The Harbor Clock Challenge",
    skillId: "math.elapsed-time",
    objective: "Calculate the time that passes between a start time and a finish time.",
    generatorId: "measurement.elapsed-time"
  })
]);

const volumeDemonstration = {
  title: "Read a graduated beaker",
  introduction: "A graduation is a mark that shows a measured amount. Read the scale at the liquid level.",
  steps: [
    { label: "Find the unit", explanation: "This beaker measures milliliters, written mL.", visual: { kind: "diagram", content: "Volume → mL", ariaLabel: "Volume is measured in milliliters" } },
    { label: "Read the scale from zero", explanation: "Start at the zero mark and count the equal spaces. Each graduation represents the same amount.", visual: { kind: "diagram", content: "0 · 50 · 100 · 150 · 200 mL", ariaLabel: "Graduation labels show equal volume intervals" } },
    { label: "Match the liquid line", explanation: "Read the number at the graduation that lines up with the top of the liquid.", visual: { kind: "equation", content: "Liquid level → matching graduation", ariaLabel: "Read the beaker at the liquid level" } }
  ],
  summary: "Read the scale at the liquid level and include the unit mL."
};

const massDemonstration = {
  title: "Use a balanced scale",
  introduction: "When a balance is level, the mass on both pans is equal.",
  steps: [
    { label: "Notice the level beam", explanation: "The balanced beam tells us that the unknown object and the known weights have equal mass.", visual: { kind: "diagram", content: "Object pan = weight pan", ariaLabel: "A balanced scale means both pans have equal mass" } },
    { label: "Read each weight", explanation: "Look at the gram value written on every standard weight.", visual: { kind: "diagram", content: "100 g + 200 g", ariaLabel: "Example standard weights of 100 grams and 200 grams" } },
    { label: "Add the weights", explanation: "Add all the known weights to find the object's mass. Keep the unit grams.", visual: { kind: "equation", content: "100 g + 200 g = 300 g", ariaLabel: "Add the weights to find 300 grams" } }
  ],
  summary: "A level balance means the object's mass equals the sum of the weights on the other pan."
};

const conversionDemonstration = {
  title: "Choose the right conversion",
  introduction: "Metric conversions use groups of ten, one hundred, or one thousand.",
  steps: [
    { label: "Remember the relationship", explanation: "1 meter = 100 centimeters, 1 liter = 1,000 milliliters, and 1 kilogram = 1,000 grams.", visual: { kind: "diagram", content: "1 m = 100 cm · 1 L = 1,000 mL · 1 kg = 1,000 g", ariaLabel: "Metric unit equivalences" } },
    { label: "Check the direction", explanation: "Converting to a smaller unit makes the number larger. Converting to a larger unit makes the number smaller.", visual: { kind: "diagram", content: "Larger unit ↔ smaller unit", ariaLabel: "Conversion direction changes the number size" } },
    { label: "Keep the unit with the answer", explanation: "After converting, write the new number with the requested unit.", visual: { kind: "equation", content: "2 L = 2,000 mL", ariaLabel: "Two liters equals two thousand milliliters" } }
  ],
  summary: "Use the metric relationship, convert in the correct direction, and include the new unit."
};

const elapsedDemonstration = {
  title: "Find elapsed time",
  introduction: "Elapsed time is the amount of time between the start and finish.",
  steps: [
    { label: "Start at the first time", explanation: "Read the starting clock time and keep the hour and minutes together.", visual: { kind: "diagram", content: "Start → 9:15 AM", ariaLabel: "An example start time" } },
    { label: "Count forward", explanation: "Move forward in sensible jumps, such as to the next hour and then to the finish time.", visual: { kind: "diagram", content: "9:15 → 10:00 → 10:45", ariaLabel: "Count forward from the start time to the finish time" } },
    { label: "Combine the jumps", explanation: "Add the minutes in each jump. The total is the elapsed time.", visual: { kind: "equation", content: "45 minutes + 45 minutes = 90 minutes", ariaLabel: "Combine the time jumps to find ninety minutes" } }
  ],
  summary: "Count forward from the start to the finish and add the time intervals."
};

export const chapterEightHintDefinitions = Object.freeze([
  {
    activityId: "chapter-08.volume-reading",
    title: "Professor Hoot's beaker clues",
    skillIds: ["math.volume"],
    stages: [
      { attempt: 1, kind: "nudge", message: "Look at the unit and find the graduation that lines up with the top of the liquid." },
      { attempt: 2, kind: "strategy", message: "Start at zero, count equal spaces, and read the number at the liquid line. Include mL." },
      { attempt: 3, kind: "demonstration", message: "Professor Hoot will show how to read the graduated beaker.", demonstration: volumeDemonstration }
    ]
  },
  {
    activityId: "chapter-08.mass-balance",
    title: "Professor Hoot's balance clues",
    skillIds: ["math.mass"],
    stages: [
      { attempt: 1, kind: "nudge", message: "The beam is level. What does that tell you about the two pans?" },
      { attempt: 2, kind: "strategy", message: "A level balance means equal mass. Add the gram weights together to find the object's mass." },
      { attempt: 3, kind: "demonstration", message: "Professor Hoot will add the standard weights on the balanced scale.", demonstration: massDemonstration }
    ]
  },
  {
    activityId: "chapter-08.unit-conversion",
    title: "Professor Hoot's metric clues",
    skillIds: ["math.unit-conversion"],
    stages: [
      { attempt: 1, kind: "nudge", message: "Think of the relationship between the two units. Are you changing to a smaller or a larger unit?" },
      { attempt: 2, kind: "strategy", message: "Remember: 1 m = 100 cm, 1 L = 1,000 mL, and 1 kg = 1,000 g. Check which direction you are converting." },
      { attempt: 3, kind: "demonstration", message: "Professor Hoot will demonstrate metric conversion relationships.", demonstration: conversionDemonstration }
    ]
  },
  {
    activityId: "chapter-08.elapsed-time",
    title: "Professor Hoot's clock clues",
    skillIds: ["math.elapsed-time"],
    stages: [
      { attempt: 1, kind: "nudge", message: "Start at the first clock time and count forward to the finish." },
      { attempt: 2, kind: "strategy", message: "Break the time into friendly jumps, such as reaching the next hour and then counting the remaining minutes." },
      { attempt: 3, kind: "demonstration", message: "Professor Hoot will count forward from a start time to a finish time.", demonstration: elapsedDemonstration }
    ]
  }
]);

export const chapterEightReward = createRewardDefinition({
  id: "reward.chapter-08-poseidons-tideglass",
  sourceId: "chapter-08",
  title: "Poseidon's Tideglass",
  starGems: 110,
  starlightSparkles: 9,
  replayPolicy: { type: "once" }
});

export const chapterEightDefinition = createChapterDefinition({
  id: "chapter-08",
  title: "Poseidon's Volume & Measurement Lab",
  description: "Join Poseidon in the underwater lab to read beaker scales, balance mysterious treasures, convert metric measurements, and solve harbor clock puzzles.",
  prerequisiteChapterIds: ["chapter-07"],
  objectives: [
    "Read liquid volume from graduated beaker scales in milliliters.",
    "Find mass by combining standard gram weights on a balanced scale.",
    "Convert metric length, capacity, and mass measurements accurately.",
    "Calculate elapsed time between start and finish times."
  ],
  activities: [
    {
      id: "chapter-08.lab-arrival",
      title: "Poseidon's Underwater Laboratory",
      type: "story",
      description: "Poseidon welcomes the student to an underwater laboratory where the measuring tools and harbor clocks need careful attention.",
      metadata: { paragraphs: [
        "A pearl-blue doorway opens beyond Athena's library. Beneath the waves, Poseidon's laboratory glows with lanterns, glass beakers, and balanced brass scales.",
        "Poseidon points to a row of tide gauges. “The markings on these beakers show how much liquid they hold. Our treasure scales balance only when both sides have equal mass.”",
        "Professor Hoot turns a small clock toward the student. “Metric units follow consistent relationships, and elapsed time can be found by counting forward from the start to the finish.”"
      ] }
    },
    {
      id: "chapter-08.volume-station",
      title: "The Tidepool Measuring Station",
      type: "learning",
      description: "Read the graduated scale where the liquid level meets a marked line.",
      activityId: "chapter-08.volume-reading",
      skillIds: ["math.volume"],
      metadata: { questionCount: 4, lessonLabel: "Reading volume in milliliters" }
    },
    {
      id: "chapter-08.mass-scales",
      title: "The Balanced Treasure Scales",
      type: "learning",
      description: "Use the standard weights on a level balance to find the mass of each object.",
      activityId: "chapter-08.mass-balance",
      skillIds: ["math.mass"],
      metadata: { questionCount: 4, lessonLabel: "Finding mass in grams" }
    },
    {
      id: "chapter-08.metric-converter",
      title: "The Metric Current Converter",
      type: "learning",
      description: "Convert between metric units of length, capacity, and mass.",
      activityId: "chapter-08.unit-conversion",
      skillIds: ["math.unit-conversion"],
      metadata: { questionCount: 4, lessonLabel: "Metric unit conversion" }
    },
    {
      id: "chapter-08.harbor-clock",
      title: "The Harbor Clock Challenge",
      type: "challenge",
      description: "Find how much time passes between each start time and finish time.",
      activityId: "chapter-08.elapsed-time",
      skillIds: ["math.elapsed-time"],
      metadata: { questionCount: 4, challengeLabel: "Elapsed-time progress", successText: "You solved the harbor clock puzzles!" }
    },
    {
      id: "chapter-08.lab-restored",
      title: "The Laboratory in Balance",
      type: "story",
      description: "The beakers, balances, metric charts, and harbor clocks are working together again.",
      metadata: { paragraphs: [
        "The last beaker settles onto its shelf. Its liquid level lines up with the correct graduation, and the treasure scales rest perfectly level.",
        "Poseidon smiles. “You measured volume, found mass, converted metric units, and counted elapsed time with care.”",
        "Professor Hoot presents Poseidon's Tideglass. Beyond the laboratory, a mysterious multi-step challenge waits for the academy's next explorer."
      ] }
    }
  ],
  majorRewardIds: [chapterEightReward.id]
});
