import { createActivityDefinition } from "../systems/curriculum/activityDefinitions.js";
import { createChapterDefinition } from "../gameplay/chapter-runtime/chapterCatalog.js";
import { createRewardDefinition } from "../systems/economy/economyCatalogs.js";

const supportedTiers = ["foundation", "core", "stretch"];

function createGeometryActivity({ id, title, skillId, objective, generatorId, generatorConstraints, answerType = "exact" }) {
  return createActivityDefinition({
    id, title, skillIds: [skillId], objectives: [objective], supportedTiers,
    answerRules: answerType === "numeric" ? { type: "numeric", tolerance: 0 } : { type: "exact", caseSensitive: false },
    generatorId, generatorConstraints
  });
}

const shapeConstraints = {
  foundation: { shapeSet: "foundation", choiceCount: 4 },
  core: { shapeSet: "core", choiceCount: 4 },
  stretch: { shapeSet: "stretch", choiceCount: 4 }
};
const measurementConstraints = {
  foundation: { widthMin: 2, widthMax: 6, heightMin: 2, heightMax: 5, choiceCount: 4 },
  core: { widthMin: 3, widthMax: 10, heightMin: 2, heightMax: 8, choiceCount: 4 },
  stretch: { widthMin: 5, widthMax: 14, heightMin: 3, heightMax: 12, choiceCount: 4 }
};

export const chapterFourActivityDefinitions = Object.freeze([
  createGeometryActivity({
    id: "chapter-04.shape-studio", title: "The Shape Sketchbook", skillId: "math.shape-recognition",
    objective: "Identify two-dimensional shapes by their sides, corners, and angle properties.",
    generatorId: "geometry.shape-properties", generatorConstraints: shapeConstraints
  }),
  createGeometryActivity({
    id: "chapter-04.symmetry-mirror", title: "The Mirror Garden", skillId: "math.symmetry",
    objective: "Recognize how many lines can divide a shape into matching reflected halves.",
    generatorId: "geometry.symmetry", generatorConstraints: shapeConstraints, answerType: "numeric"
  }),
  createGeometryActivity({
    id: "chapter-04.angle-turn", title: "The Angle Turnstile", skillId: "math.angles",
    objective: "Classify acute, right, obtuse, and straight angles by their measurements.",
    generatorId: "geometry.angles",
    generatorConstraints: {
      foundation: { choiceCount: 4 }, core: { choiceCount: 4 }, stretch: { choiceCount: 4 }
    }
  }),
  createGeometryActivity({
    id: "chapter-04.perimeter", title: "The Perimeter Balance Beam", skillId: "math.perimeter",
    objective: "Find the distance around a rectangle by adding the lengths of all four sides.",
    generatorId: "geometry.perimeter", generatorConstraints: measurementConstraints, answerType: "numeric"
  }),
  createGeometryActivity({
    id: "chapter-04.area", title: "The Area Landing Platform", skillId: "math.area",
    objective: "Find the square units covering a rectangle by multiplying its side lengths.",
    generatorId: "geometry.area", generatorConstraints: measurementConstraints, answerType: "numeric"
  })
]);

const shapeDemonstration = {
  title: "Read the sides and corners",
  introduction: "A shape's properties help you recognize it, even when it is turned a different way.",
  steps: [
    { label: "Count the sides", explanation: "A square has four straight sides. All four sides have the same length.", visual: { kind: "diagram", content: "4 equal sides", ariaLabel: "A square has four equal sides" } },
    { label: "Check the corners", explanation: "Each corner of a square is a right angle.", visual: { kind: "diagram", content: "4 right angles", ariaLabel: "A square has four right angles" } },
    { label: "Name the shape", explanation: "Four equal sides and four right angles identify a square.", visual: { kind: "equation", content: "4 equal sides + 4 right angles = square", ariaLabel: "Four equal sides and four right angles make a square" } }
  ],
  summary: "Use more than one property when shapes can look similar."
};
const symmetryDemonstration = {
  title: "Find the fold line",
  introduction: "A line of symmetry splits a shape into two matching mirror-image halves.",
  steps: [
    { label: "Imagine folding", explanation: "Picture folding a square down its middle. The left and right edges match.", visual: { kind: "diagram", content: "One vertical fold line", ariaLabel: "A square can fold into matching left and right halves" } },
    { label: "Try another direction", explanation: "A square also matches when folded across its middle from top to bottom.", visual: { kind: "diagram", content: "A second horizontal fold line", ariaLabel: "A square also has a horizontal line of symmetry" } },
    { label: "Count every matching fold", explanation: "The two diagonals also make matching halves, so a square has four lines of symmetry.", visual: { kind: "equation", content: "2 middle lines + 2 diagonal lines = 4", ariaLabel: "A square has four lines of symmetry" } }
  ],
  summary: "Count only lines that make both sides match exactly."
};
const angleDemonstration = {
  title: "Compare the angle with a square corner",
  introduction: "Angle size is measured in degrees. A right angle is exactly 90 degrees.",
  steps: [
    { label: "Less than a right angle", explanation: "An angle smaller than 90 degrees is acute.", visual: { kind: "diagram", content: "45° is acute", ariaLabel: "Forty-five degrees is an acute angle" } },
    { label: "Exactly a right angle", explanation: "An angle measuring 90 degrees is a right angle.", visual: { kind: "diagram", content: "90° is right", ariaLabel: "Ninety degrees is a right angle" } },
    { label: "Greater than a right angle", explanation: "An angle greater than 90 but less than 180 degrees is obtuse. A straight angle is 180 degrees.", visual: { kind: "equation", content: "120° = obtuse · 180° = straight", ariaLabel: "One hundred twenty degrees is obtuse and one hundred eighty degrees is straight" } }
  ],
  summary: "Compare the degree measure with 90 and 180 to name the angle."
};
const perimeterDemonstration = {
  title: "Walk all the way around",
  introduction: "Perimeter is the distance around the outside edge of a shape.",
  steps: [
    { label: "Read both side lengths", explanation: "A rectangle has two sides of each length. Opposite sides match.", visual: { kind: "diagram", content: "6 cm across · 3 cm tall", ariaLabel: "A rectangle is six centimeters by three centimeters" } },
    { label: "Add every outside side", explanation: "Add 6 + 3 + 6 + 3, or double the sum of the length and width.", visual: { kind: "equation", content: "6 + 3 + 6 + 3 = 18", ariaLabel: "Six plus three plus six plus three equals eighteen" } },
    { label: "Include the unit", explanation: "Perimeter is a length, so the answer is measured in centimeters.", visual: { kind: "diagram", content: "Perimeter = 18 cm", ariaLabel: "The perimeter is eighteen centimeters" } }
  ],
  summary: "Perimeter measures around the outside, not the space inside."
};
const areaDemonstration = {
  title: "Count the square units inside",
  introduction: "Area measures how much flat surface a shape covers.",
  steps: [
    { label: "Count across", explanation: "There are six equal unit squares across the rectangle.", visual: { kind: "diagram", content: "6 squares across", ariaLabel: "Six unit squares across" } },
    { label: "Count the rows", explanation: "There are three equal rows of unit squares.", visual: { kind: "diagram", content: "3 rows", ariaLabel: "Three rows of unit squares" } },
    { label: "Multiply rows and columns", explanation: "Six columns times three rows gives eighteen square units.", visual: { kind: "equation", content: "6 × 3 = 18 square units", ariaLabel: "Six times three equals eighteen square units" } }
  ],
  summary: "Area counts the unit squares that cover the inside of a shape."
};

export const chapterFourHintDefinitions = Object.freeze([
  {
    activityId: "chapter-04.shape-studio", title: "Professor Hoot's shape clues", skillIds: ["math.shape-recognition"],
    stages: [
      { attempt: 1, kind: "nudge", message: "Count the straight sides and corners. Then look for equal sides or right angles." },
      { attempt: 2, kind: "strategy", message: "Use two properties together. A square has four equal sides and four right angles; a rectangle has four right angles but only opposite sides are equal." },
      { attempt: 3, kind: "demonstration", message: "Professor Hoot will check a shape's sides and corners.", demonstration: shapeDemonstration }
    ]
  },
  {
    activityId: "chapter-04.symmetry-mirror", title: "Professor Hoot's mirror clues", skillIds: ["math.symmetry"],
    stages: [
      { attempt: 1, kind: "nudge", message: "Imagine folding the shape along a line. Would both halves match exactly?" },
      { attempt: 2, kind: "strategy", message: "Count each different fold line once. A diagonal can be a line of symmetry too." },
      { attempt: 3, kind: "demonstration", message: "Professor Hoot will fold a square in more than one direction.", demonstration: symmetryDemonstration }
    ]
  },
  {
    activityId: "chapter-04.angle-turn", title: "Professor Hoot's angle clues", skillIds: ["math.angles"],
    stages: [
      { attempt: 1, kind: "nudge", message: "Compare the angle with a square corner. A square corner measures 90 degrees." },
      { attempt: 2, kind: "strategy", message: "Acute is less than 90 degrees, right is 90 degrees, obtuse is between 90 and 180 degrees, and straight is 180 degrees." },
      { attempt: 3, kind: "demonstration", message: "Professor Hoot will compare three angle sizes.", demonstration: angleDemonstration }
    ]
  },
  {
    activityId: "chapter-04.perimeter", title: "Professor Hoot's perimeter clues", skillIds: ["math.perimeter"],
    stages: [
      { attempt: 1, kind: "nudge", message: "Perimeter means the distance around the outside. Trace all four sides." },
      { attempt: 2, kind: "strategy", message: "Opposite sides of a rectangle match. Add length + width + length + width." },
      { attempt: 3, kind: "demonstration", message: "Professor Hoot will walk around a rectangle.", demonstration: perimeterDemonstration }
    ]
  },
  {
    activityId: "chapter-04.area", title: "Professor Hoot's area clues", skillIds: ["math.area"],
    stages: [
      { attempt: 1, kind: "nudge", message: "Area is the space inside the outline. Imagine covering it with equal square tiles." },
      { attempt: 2, kind: "strategy", message: "Count the squares in one row, then multiply by the number of rows." },
      { attempt: 3, kind: "demonstration", message: "Professor Hoot will count a rectangle's unit squares.", demonstration: areaDemonstration }
    ]
  }
]);

export const chapterFourReward = createRewardDefinition({
  id: "reward.chapter-04-geometry-star-pin", sourceId: "chapter-04",
  title: "Geometry Star Pin", starGems: 70, starlightSparkles: 5, replayPolicy: { type: "once" }
});

export const chapterFourDefinition = createChapterDefinition({
  id: "chapter-04",
  title: "Geometry on the Balance Beam",
  description: "Follow the shape trail, find mirror lines and angles, then use perimeter and area to guide the academy's balance-beam course.",
  objectives: [
    "Recognize shapes through their side, corner, and symmetry properties.",
    "Classify acute, right, obtuse, and straight angles.",
    "Calculate the perimeter and area of rectangles using labeled measurements."
  ],
  prerequisiteChapterIds: ["chapter-03"],
  activities: [
    {
      id: "chapter-04.beam-gate-opens", title: "The path to the Sky Gallery", type: "story",
      description: "A geometry trail has appeared across the academy's balance-beam gallery.",
      metadata: { paragraphs: [
        "A silver balance beam stretches across the Sky Gallery. Its surface is marked with triangles, squares, mirror lines, and bright angle symbols.",
        "Mira explains that the beam's stepping platforms have lost their measurements. “We need to recognize each shape, find its lines of symmetry, and read the angles before we can safely map the course.”",
        "Professor Hoot points toward a sketchbook, a garden of mirrors, and two measuring platforms. “Geometry helps us describe shapes and measure the space around and inside them. Let's solve each station one careful step at a time.”"
      ] }
    },
    {
      id: "chapter-04.shape-sketchbook", title: "The Shape Sketchbook", type: "learning",
      description: "Study the side and corner clues, then identify the shape shown in the sketchbook.",
      activityId: "chapter-04.shape-studio", skillIds: ["math.shape-recognition"],
      metadata: { questionCount: 1, lessonLabel: "Shape properties", successText: "The sketchbook labels the shape correctly. Its sides and corners are clear!" }
    },
    {
      id: "chapter-04.mirror-garden", title: "The Mirror Garden", type: "learning",
      description: "Imagine folding each shape to find how many lines make matching mirror-image halves.",
      activityId: "chapter-04.symmetry-mirror", skillIds: ["math.symmetry"],
      metadata: { questionCount: 1, lessonLabel: "Lines of symmetry", successText: "The mirror lines match. Both halves fit together perfectly!" }
    },
    {
      id: "chapter-04.angle-turnstile", title: "The Angle Turnstile", type: "learning",
      description: "Compare each angle with a right angle and choose its name.",
      activityId: "chapter-04.angle-turn", skillIds: ["math.angles"],
      metadata: { questionCount: 1, lessonLabel: "Angle measures", successText: "The turnstile points the right way. You read the angle correctly!" }
    },
    {
      id: "chapter-04.perimeter-beam", title: "The Perimeter Balance Beam", type: "challenge",
      description: "Measure the outside edge of each rectangular beam platform. Add all four sides to find its perimeter.",
      activityId: "chapter-04.perimeter", skillIds: ["math.perimeter"],
      metadata: { questionCount: 3, challengeLabel: "Perimeter beam steps", successText: "Every outside edge is measured. The balance beam route is ready!" }
    },
    {
      id: "chapter-04.area-platform", title: "The Area Landing Platform", type: "challenge",
      description: "Count the square units covering each platform. Multiply the number across by the number of rows.",
      activityId: "chapter-04.area", skillIds: ["math.area"],
      metadata: { questionCount: 3, challengeLabel: "Area platform tiles", successText: "The platform is covered with the right number of square tiles. The course is complete!" }
    },
    {
      id: "chapter-04.geometry-complete", title: "The Sky Gallery shines", type: "story",
      description: "The geometry trail is restored and the balance-beam gallery is ready.",
      metadata: { paragraphs: [
        "The last platform lights up as the final square tile settles into place. A bright line travels along the balance beam and around the gallery's geometric decorations.",
        "Mira smiles. “You used shape properties, mirror lines, and angle measures. Then you measured around the platforms and counted the space they cover.”",
        "Professor Hoot presents a Geometry Star Pin. Beyond the Sky Gallery, a new passage glimmers in the distance."
      ] }
    }
  ],
  majorRewardIds: [chapterFourReward.id]
});
