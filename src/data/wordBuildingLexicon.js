/**
 * Curated spelling and morphology examples for Chapter 3.
 * Every entry is a standard English word with a checked, player-friendly
 * component breakdown, concise meaning, and an unambiguous context sentence.
 */
function defineWord(entry) {
  return Object.freeze({
    ...entry,
    prefixes: Object.freeze((entry.prefixes ?? []).map((part) => Object.freeze({ ...part }))),
    suffixes: Object.freeze((entry.suffixes ?? []).map((part) => Object.freeze({ ...part })))
  });
}

export const chapterThreeWordBank = Object.freeze([
  defineWord({
    tier: "foundation",
    word: "replay",
    prefixes: [{ text: "re", display: "re-", meaning: "again" }],
    root: { text: "play", meaning: "to take part in a game or activity" },
    suffixes: [],
    meaning: "to play something again",
    sentence: "After the song ended, I asked the musician to replay it from the beginning."
  }),
  defineWord({
    tier: "foundation",
    word: "refill",
    prefixes: [{ text: "re", display: "re-", meaning: "again" }],
    root: { text: "fill", meaning: "to put something into a container" },
    suffixes: [],
    meaning: "to fill a container again",
    sentence: "The helper had to refill the glass after everyone drank the water."
  }),
  defineWord({
    tier: "foundation",
    word: "unkind",
    prefixes: [{ text: "un", display: "un-", meaning: "not" }],
    root: { text: "kind", meaning: "caring and thoughtful" },
    suffixes: [],
    meaning: "not caring or considerate",
    sentence: "The unkind remark hurt his friend's feelings."
  }),
  defineWord({
    tier: "foundation",
    word: "helpful",
    prefixes: [],
    root: { text: "help", meaning: "to give assistance" },
    suffixes: [{ text: "ful", display: "-ful", meaning: "full of" }],
    meaning: "giving help or making a task easier",
    sentence: "The helpful note showed me which door to use."
  }),
  defineWord({
    tier: "foundation",
    word: "teacher",
    prefixes: [],
    root: { text: "teach", meaning: "to help someone learn" },
    suffixes: [{ text: "er", display: "-er", meaning: "a person who does something" }],
    meaning: "a person who helps others learn",
    sentence: "Our teacher showed us how to solve the puzzle."
  }),
  defineWord({
    tier: "core",
    word: "preview",
    prefixes: [{ text: "pre", display: "pre-", meaning: "before" }],
    root: { text: "view", meaning: "to look at" },
    suffixes: [],
    meaning: "an early look before something is finished or shown",
    sentence: "The artist gave us a preview of the painting before the gallery opened."
  }),
  defineWord({
    tier: "core",
    word: "misplace",
    prefixes: [{ text: "mis", display: "mis-", meaning: "wrongly" }],
    root: { text: "place", meaning: "to put something somewhere" },
    suffixes: [],
    meaning: "to put an object in the wrong place",
    sentence: "I sometimes misplace my pencil, so I keep it in a bright case."
  }),
  defineWord({
    tier: "core",
    word: "disagree",
    prefixes: [{ text: "dis", display: "dis-", meaning: "not or the opposite of" }],
    root: { text: "agree", meaning: "to have the same opinion" },
    suffixes: [],
    meaning: "to have a different opinion",
    sentence: "The friends disagree about which route is safest, so they compare the map."
  }),
  defineWord({
    tier: "core",
    word: "careless",
    prefixes: [],
    root: { text: "care", meaning: "attention and thought" },
    suffixes: [{ text: "less", display: "-less", meaning: "without" }],
    meaning: "not careful; paying too little attention",
    sentence: "A careless spill left blue paint across the table."
  }),
  defineWord({
    tier: "core",
    word: "joyful",
    prefixes: [],
    root: { text: "joy", meaning: "great happiness" },
    suffixes: [{ text: "ful", display: "-ful", meaning: "full of" }],
    meaning: "full of joy; very happy",
    sentence: "The joyful children cheered when the garden lights appeared."
  }),
  defineWord({
    tier: "core",
    word: "kindness",
    prefixes: [],
    root: { text: "kind", meaning: "caring and thoughtful" },
    suffixes: [{ text: "ness", display: "-ness", meaning: "a state or quality" }],
    meaning: "the quality of being kind",
    sentence: "Her kindness made the new student feel welcome."
  }),
  defineWord({
    tier: "stretch",
    word: "unhelpful",
    prefixes: [{ text: "un", display: "un-", meaning: "not" }],
    root: { text: "help", meaning: "to give assistance" },
    suffixes: [{ text: "ful", display: "-ful", meaning: "full of" }],
    meaning: "not helpful or not useful",
    sentence: "The unhelpful directions sent us in circles instead of toward the garden."
  }),
  defineWord({
    tier: "stretch",
    word: "disagreement",
    prefixes: [{ text: "dis", display: "dis-", meaning: "not or the opposite of" }],
    root: { text: "agree", meaning: "to have the same opinion" },
    suffixes: [{ text: "ment", display: "-ment", meaning: "an action, result, or state" }],
    meaning: "a state or instance of having different opinions",
    sentence: "Their disagreement ended when they listened to each other's reasons."
  }),
  defineWord({
    tier: "stretch",
    word: "carelessness",
    prefixes: [],
    root: { text: "care", meaning: "attention and thought" },
    suffixes: [
      { text: "less", display: "-less", meaning: "without" },
      { text: "ness", display: "-ness", meaning: "a state or quality" }
    ],
    meaning: "the state of not taking enough care",
    sentence: "Carelessness with the ingredients made the potion fizz over."
  }),
  defineWord({
    tier: "stretch",
    word: "reusable",
    prefixes: [{ text: "re", display: "re-", meaning: "again" }],
    root: { text: "use", meaning: "to put something to work" },
    suffixes: [{ text: "able", display: "-able", meaning: "able or suitable to be" }],
    meaning: "able to be used again",
    sentence: "The reusable bottle can be washed and filled tomorrow."
  }),
  defineWord({
    tier: "stretch",
    word: "misinterpret",
    prefixes: [{ text: "mis", display: "mis-", meaning: "wrongly" }],
    root: { text: "interpret", meaning: "to explain or understand meaning" },
    suffixes: [],
    meaning: "to understand something incorrectly",
    sentence: "He did not want to misinterpret the message, so he asked what it meant."
  }),
  defineWord({
    tier: "stretch",
    word: "movement",
    prefixes: [],
    root: { text: "move", meaning: "to change position" },
    suffixes: [{ text: "ment", display: "-ment", meaning: "an action or process" }],
    meaning: "the act or process of moving",
    sentence: "The slow movement of the moon across the sky took all evening."
  })
]);

export function getChapterThreeWords(tier) {
  return chapterThreeWordBank.filter((entry) => entry.tier === tier);
}
