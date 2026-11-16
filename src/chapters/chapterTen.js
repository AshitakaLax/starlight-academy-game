import { createChapterDefinition } from "../gameplay/chapter-runtime/chapterCatalog.js";
import { createRewardDefinition } from "../systems/economy/economyCatalogs.js";
import { grandStarlightSampler } from "../data/championshipSampler.js";

const championshipEvents = grandStarlightSampler.map((event) => ({
  id: event.id,
  title: event.title,
  type: "learning",
  description: event.description,
  activityId: event.activityId,
  skillIds: [event.skillId],
  metadata: {
    questionCount: 1,
    lessonLabel: event.lessonLabel,
    successText: "Your star joins the constellation. Every subject has a place in the championship!"
  }
}));

export const chapterTenReward = createRewardDefinition({
  id: "reward.chapter-10-grand-starlight-crown",
  sourceId: "chapter-10",
  title: "Grand Starlight Crown",
  starGems: 150,
  starlightSparkles: 12,
  replayPolicy: { type: "once" }
});

export const chapterTenDefinition = createChapterDefinition({
  id: "chapter-10",
  title: "The Grand Starlight Championship",
  description: "Bring together the discoveries of nine adventures in a balanced celebration of mathematics, science, language arts, movement, creativity, and friendship.",
  prerequisiteChapterIds: ["chapter-09"],
  objectives: [
    "Recall and apply a balanced selection of skills from mathematics, science, and language arts.",
    "Celebrate the academy character, chosen outfit, companion, and gymnastics progress.",
    "Complete the final championship and earn the Grand Starlight Crown."
  ],
  activities: [
    {
      id: "chapter-10.championship-opens",
      title: "The Grand Starlight gates",
      type: "story",
      description: "The academy's final celebration is ready to begin.",
      metadata: {
        paragraphs: [
          "The silver gates of the Grand Starlight Arena swing open. Above the floor, twelve empty stars form a wide constellation. Each one represents a different kind of discovery from your academy adventures.",
          "Professor Hoot unfurls the championship program. “There are four stars for mathematics, four for science, and four for language arts. Every skill gets its own moment. Take your time, ask for a clue, and let your earlier discoveries help you.”",
          "When the learning constellation is complete, the arena will make room for a ribbon performance and a celebration of the character, outfit, and companion who have traveled with you."
        ]
      }
    },
    ...championshipEvents,
    {
      id: "chapter-10.ribbon-performance",
      title: "The Starlight Ribbon showcase",
      type: "gymnastics",
      description: "Bring your movement progress to the championship floor with a familiar ribbon routine. Practice is personal, missed beats never stop the routine, and skipping remains a safe choice.",
      metadata: {
        routineId: "routine.starlight-ribbon",
        successText: "Your ribbon draws the final arc of the championship constellation."
      }
    },
    {
      id: "chapter-10.academy-showcase",
      title: "Your academy story",
      type: "reflection",
      description: "Take a moment to see the character, outfit, companion, and gymnastics progress that make this journey yours.",
      metadata: {
        showcase: "grand-starlight",
        routineId: "routine.starlight-ribbon",
        paragraphs: [
          "The arena grows quiet, and a soft light settles over your academy explorer. Every completed adventure has added another part to this story.",
          "Here are a few of the details that traveled with you: the outfit you have equipped, your active companion and its care journey, and the saved best score from your ribbon routine.",
          "There is no single right way to personalize an academy adventure. Your choices, creativity, and practice make this celebration your own."
        ]
      }
    },
    {
      id: "chapter-10.crown-awarded",
      title: "A constellation of discoveries",
      type: "story",
      description: "The twelve stars shine together, and the Grand Starlight Crown is ready to be yours.",
      metadata: {
        paragraphs: [
          "The final star rises into place. Mathematics, science, and language arts shine in a balanced constellation, while the ribbon's trail curves gently around the arena.",
          "The academy character bows beside your chosen outfit and companion. Professor Hoot smiles: “A champion is not someone who knows everything already. A champion stays curious, tries a strategy, asks for help, and keeps learning.”",
          "The Grand Starlight Championship is complete. Your crown is a reminder of all the skills, stories, friendships, and small brave steps that brought you here."
        ]
      }
    }
  ],
  majorRewardIds: [chapterTenReward.id]
});
