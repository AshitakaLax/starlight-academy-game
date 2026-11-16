function deepFreeze(value) {
  if (!value || typeof value !== "object") return value;
  for (const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
}

/**
 * Curated sentences use one explicitly marked target word. Each target has
 * one clear grammatical role in its sentence; examples grow in length by tier.
 */
export const grammarSentenceBank = deepFreeze([
  { id: "noun-kitten", tier: "foundation", sentence: "The sleepy kitten curled beside the window.", targetWord: "kitten", partOfSpeech: "noun", explanation: "Kitten names an animal, so it is a noun." },
  { id: "verb-glowed", tier: "foundation", sentence: "The bright lantern glowed in the hallway.", targetWord: "glowed", partOfSpeech: "verb", explanation: "Glowed tells what the lantern did, so it is a verb." },
  { id: "adjective-gentle", tier: "foundation", sentence: "A gentle breeze moved the curtains.", targetWord: "gentle", partOfSpeech: "adjective", explanation: "Gentle describes the breeze, so it is an adjective." },
  { id: "adverb-quietly", tier: "foundation", sentence: "The small mouse tiptoed quietly past the cat.", targetWord: "quietly", partOfSpeech: "adverb", explanation: "Quietly tells how the mouse tiptoed, so it is an adverb." },
  { id: "noun-stars", tier: "foundation", sentence: "Three silver stars shimmered above the tower.", targetWord: "stars", partOfSpeech: "noun", explanation: "Stars names things in the sky, so it is a noun." },
  { id: "verb-opened", tier: "foundation", sentence: "Mira opened the heavy book.", targetWord: "opened", partOfSpeech: "verb", explanation: "Opened tells what Mira did, so it is a verb." },
  { id: "adjective-curious", tier: "foundation", sentence: "The curious child studied a map.", targetWord: "curious", partOfSpeech: "adjective", explanation: "Curious describes the child, so it is an adjective." },
  { id: "adverb-softly", tier: "foundation", sentence: "The owl called softly at dusk.", targetWord: "softly", partOfSpeech: "adverb", explanation: "Softly tells how the owl called, so it is an adverb." },

  { id: "noun-librarian", tier: "core", sentence: "The librarian patiently explained the quiet reading rules.", targetWord: "librarian", partOfSpeech: "noun", explanation: "Librarian names a person, so it is a noun." },
  { id: "verb-fluttered", tier: "core", sentence: "Golden leaves fluttered across the stone path.", targetWord: "fluttered", partOfSpeech: "verb", explanation: "Fluttered tells what the leaves did, so it is a verb." },
  { id: "adjective-polished", tier: "core", sentence: "The polished telescope revealed a distant moon.", targetWord: "polished", partOfSpeech: "adjective", explanation: "Polished describes the telescope, so it is an adjective." },
  { id: "adverb-neatly", tier: "core", sentence: "After lunch, the careful student neatly arranged the cards.", targetWord: "neatly", partOfSpeech: "adverb", explanation: "Neatly tells how the student arranged the cards, so it is an adverb." },
  { id: "noun-journey", tier: "core", sentence: "During the lesson, Athena described her journey through the old library.", targetWord: "journey", partOfSpeech: "noun", explanation: "Journey names an experience, so it is a noun." },
  { id: "verb-compared", tier: "core", sentence: "Athena thoughtfully compared two clever solutions.", targetWord: "compared", partOfSpeech: "verb", explanation: "Compared tells what Athena did, so it is a verb." },
  { id: "adjective-ancient", tier: "core", sentence: "The careful reader opened an ancient book of myths.", targetWord: "ancient", partOfSpeech: "adjective", explanation: "Ancient describes the book, so it is an adjective." },
  { id: "adverb-patiently", tier: "core", sentence: "The young inventor patiently tested each paper model.", targetWord: "patiently", partOfSpeech: "adverb", explanation: "Patiently tells how the inventor tested the models, so it is an adverb." },

  { id: "noun-observation", tier: "stretch", sentence: "After several careful observations, the astronomer recorded a pattern in the stars.", targetWord: "observations", partOfSpeech: "noun", explanation: "Observations names things the astronomer made, so it is a noun." },
  { id: "verb-assembled", tier: "stretch", sentence: "Before sunrise, the experienced guide assembled the supplies for the expedition.", targetWord: "assembled", partOfSpeech: "verb", explanation: "Assembled tells what the guide did, so it is a verb." },
  { id: "adjective-winding", tier: "stretch", sentence: "The determined students followed a winding path toward the observatory.", targetWord: "winding", partOfSpeech: "adjective", explanation: "Winding describes the path, so it is an adjective." },
  { id: "adverb-deliberately", tier: "stretch", sentence: "Although the puzzle looked difficult, Leila deliberately checked each clue.", targetWord: "deliberately", partOfSpeech: "adverb", explanation: "Deliberately tells how Leila checked each clue, so it is an adverb." },
  { id: "noun-mechanism", tier: "stretch", sentence: "The brass mechanism inside the clock required one small adjustment.", targetWord: "mechanism", partOfSpeech: "noun", explanation: "Mechanism names a thing, so it is a noun." },
  { id: "verb-illuminated", tier: "stretch", sentence: "At twilight, the lantern illuminated the narrow stone passage.", targetWord: "illuminated", partOfSpeech: "verb", explanation: "Illuminated tells what the lantern did, so it is a verb." },
  { id: "adjective-reliable", tier: "stretch", sentence: "The reliable compass helped the travelers choose a safe direction.", targetWord: "reliable", partOfSpeech: "adjective", explanation: "Reliable describes the compass, so it is an adjective." },
  { id: "adverb-accurately", tier: "stretch", sentence: "The student accurately summarized the evidence before sharing a conclusion.", targetWord: "accurately", partOfSpeech: "adverb", explanation: "Accurately tells how the student summarized the evidence, so it is an adverb." }
]);

const readingPassages = [
  {
    id: "lantern-library", tier: "foundation", title: "The Lantern Library",
    passage: "At the end of each school day, Mira returned the books that had been left on the reading tables. She placed picture books on low shelves and set a basket of story recommendations near the door. Soon, more students stopped to choose a book before heading home.",
    mainIdea: "Mira helps make the library welcoming and easy for students to use.",
    mainIdeaChoices: [
      "Mira helps make the library welcoming and easy for students to use.",
      "Mira wants students to leave their books on the reading tables.",
      "The library is closing before the end of the school day.",
      "Picture books should be kept on the highest shelves."
    ],
    mainIdeaExplanation: "The details about returning books, arranging shelves, and sharing recommendations all show Mira making the library inviting.",
    inference: "Mira hopes other students will enjoy finding books to read.",
    inferenceChoices: [
      "Mira hopes other students will enjoy finding books to read.",
      "Mira thinks students should stop borrowing books.",
      "Mira plans to remove the picture books from the library.",
      "Mira is preparing to close the library permanently."
    ],
    inferenceExplanation: "Mira organizes books and recommends stories, which suggests that she wants other students to enjoy reading.",
    evidenceClaim: "Mira is encouraging students to discover books they might enjoy.",
    inferenceEvidence: "set a basket of story recommendations near the door",
    inferenceEvidenceChoices: [
      "returned the books that had been left on the reading tables",
      "placed picture books on low shelves",
      "set a basket of story recommendations near the door",
      "At the end of each school day"
    ]
  },
  {
    id: "rainy-day-garden", tier: "foundation", title: "The Rainy-Day Garden",
    passage: "Noah looked across the garden and noticed a row of dark clouds moving toward the school. He carried the smallest seedling trays beneath the porch roof and set empty pots beside the wall. A few minutes later, the first large drops of rain tapped against the path.",
    mainIdea: "Noah protects the garden seedlings as stormy weather approaches.",
    mainIdeaChoices: [
      "Noah protects the garden seedlings as stormy weather approaches.",
      "Noah decides to plant every seedling in an empty pot.",
      "The school garden needs a new path.",
      "The rain has already stopped before Noah visits the garden."
    ],
    mainIdeaExplanation: "The clouds, moved trays, and first raindrops all support the idea that Noah is protecting the seedlings from approaching rain.",
    inference: "Noah expects rain and wants to keep the young seedlings sheltered.",
    inferenceChoices: [
      "Noah expects rain and wants to keep the young seedlings sheltered.",
      "Noah believes the seedlings no longer need water.",
      "Noah is moving the trays because the garden is too sunny.",
      "Noah plans to take the empty pots home."
    ],
    inferenceExplanation: "He notices dark clouds and moves the trays under a roof just before rain begins.",
    evidenceClaim: "Noah is moving the young seedlings to a sheltered place.",
    inferenceEvidence: "carried the smallest seedling trays beneath the porch roof",
    inferenceEvidenceChoices: [
      "looked across the garden",
      "noticed a row of dark clouds moving toward the school",
      "carried the smallest seedling trays beneath the porch roof",
      "set empty pots beside the wall"
    ]
  },
  {
    id: "missing-map", tier: "core", title: "The Missing Map",
    passage: "The wall pocket for the old star map hung open. A clean rectangle showed where the map tube had rested, and its ribbon lay across the desk. Lila followed a faint trail of paper dust to a reading table, where the tube sat beneath two atlases. She returned it to the wall pocket and tied the ribbon neatly around it.",
    mainIdea: "Lila follows clues to return a missing map to its proper place.",
    mainIdeaChoices: [
      "Lila follows clues to return a missing map to its proper place.",
      "Lila creates a new star map for the reading table.",
      "The library is replacing its atlases with map tubes.",
      "The wall pocket is too small to hold a map."
    ],
    mainIdeaExplanation: "The open pocket, desk ribbon, and trail lead Lila to the misplaced tube, which she returns.",
    inference: "Someone had recently moved the map tube from its wall pocket.",
    inferenceChoices: [
      "Someone had recently moved the map tube from its wall pocket.",
      "The map tube had never been stored in the wall pocket.",
      "Lila plans to leave the map beneath the atlases.",
      "The ribbon belongs to one of the atlases."
    ],
    inferenceExplanation: "The open pocket, clean rectangle, and ribbon on the desk are clues that the tube was moved recently.",
    evidenceClaim: "The map tube had been removed from its usual wall pocket.",
    inferenceEvidence: "A clean rectangle showed where the map tube had rested",
    inferenceEvidenceChoices: [
      "the old star map",
      "its ribbon lay across the desk",
      "A clean rectangle showed where the map tube had rested",
      "beneath two atlases"
    ]
  },
  {
    id: "rehearsal-adjustment", tier: "core", title: "A Quieter Rehearsal",
    passage: "During the first rehearsal, every spoken line echoed across the empty auditorium. The actors could hear one another, but the words became difficult to follow from the back row. The group moved the narrators closer to the audience and paused between scenes. At the next rehearsal, the story was much easier to understand.",
    mainIdea: "The group changes its rehearsal plan to make the performance easier to follow.",
    mainIdeaChoices: [
      "The group changes its rehearsal plan to make the performance easier to follow.",
      "The actors decide to perform only for people in the front row.",
      "The auditorium is too small for a school performance.",
      "The narrators forget the words to every scene."
    ],
    mainIdeaExplanation: "The passage describes a problem with the sound and the changes the group makes to improve the performance.",
    inference: "The group cares about helping every audience member understand the story.",
    inferenceChoices: [
      "The group cares about helping every audience member understand the story.",
      "The group wants the performance to have more echoes.",
      "The actors would rather stop rehearsing.",
      "The back row is empty during every performance."
    ],
    inferenceExplanation: "The group changes where narrators stand and adds pauses so the words are easier for the audience to understand.",
    evidenceClaim: "The group changed its plan to help the audience follow the performance.",
    inferenceEvidence: "The group moved the narrators closer to the audience and paused between scenes",
    inferenceEvidenceChoices: [
      "During the first rehearsal, every spoken line echoed across the empty auditorium",
      "the words became difficult to follow from the back row",
      "The group moved the narrators closer to the audience and paused between scenes",
      "At the next rehearsal, the story was much easier to understand"
    ]
  },
  {
    id: "conservatory-clock", tier: "stretch", title: "The Conservatory Clock",
    passage: "The clock in the conservatory ran several minutes slow on cold mornings but nearly matched the bell by afternoon. Rowan recorded the room temperature beside each time reading for a week. When she compared the entries, she noticed that the clock's hands moved more smoothly after the room warmed. She asked the caretaker to keep the shutters open during the day and to check the clock again the following week.",
    mainIdea: "Rowan uses repeated observations to investigate why the conservatory clock changes its timing.",
    mainIdeaChoices: [
      "Rowan uses repeated observations to investigate why the conservatory clock changes its timing.",
      "Rowan wants the caretaker to replace every clock in the academy.",
      "The conservatory is being closed because it is too cold.",
      "The bell rings at a different time every afternoon."
    ],
    mainIdeaExplanation: "Rowan records time and temperature, compares the results, and suggests a follow-up check.",
    inference: "Rowan suspects the room's temperature affects how the clock works.",
    inferenceChoices: [
      "Rowan suspects the room's temperature affects how the clock works.",
      "Rowan believes the clock is always accurate in cold weather.",
      "Rowan thinks the shutters should remain closed all day.",
      "Rowan has decided to stop recording observations."
    ],
    inferenceExplanation: "The clock behaves differently as the room warms, and Rowan responds by tracking temperature and changing the shutters.",
    evidenceClaim: "Rowan suspects that the room's temperature affects how the clock works.",
    inferenceEvidence: "the clock's hands moved more smoothly after the room warmed",
    inferenceEvidenceChoices: [
      "The clock in the conservatory ran several minutes slow on cold mornings",
      "Rowan recorded the room temperature beside each time reading for a week",
      "the clock's hands moved more smoothly after the room warmed",
      "She asked the caretaker to keep the shutters open during the day"
    ]
  },
  {
    id: "footbridge-journal", tier: "stretch", title: "The Footbridge Journal",
    passage: "For a month, Inez wrote the stream's height in a notebook each Friday. The pages showed a pattern: after heavy rain, the water reached the lower painted mark, then slowly dropped over the next few days. Before the bridge crew arrived, Inez copied the dates and water levels onto a chart so the crew could compare them with the bridge supports.",
    mainIdea: "Inez organizes stream observations to help the bridge crew review changing water levels.",
    mainIdeaChoices: [
      "Inez organizes stream observations to help the bridge crew review changing water levels.",
      "Inez plans to build a second bridge across the stream.",
      "The bridge crew asks Inez to stop keeping a notebook.",
      "The stream stays at exactly the same height all month."
    ],
    mainIdeaExplanation: "The notebook, pattern, and chart all show Inez collecting information for the bridge crew.",
    inference: "Heavy rain causes the stream to rise before its level gradually falls.",
    inferenceChoices: [
      "Heavy rain causes the stream to rise before its level gradually falls.",
      "The stream is deepest only on Fridays.",
      "The bridge supports cause the rain to begin.",
      "The water level rises each day without ever dropping."
    ],
    inferenceExplanation: "Inez's repeated notes show higher water after heavy rain and a gradual drop over the following days.",
    evidenceClaim: "Heavy rain is followed by a rise in the stream, then a gradual drop.",
    inferenceEvidence: "after heavy rain, the water reached the lower painted mark, then slowly dropped over the next few days",
    inferenceEvidenceChoices: [
      "For a month, Inez wrote the stream's height in a notebook each Friday",
      "The pages showed a pattern",
      "after heavy rain, the water reached the lower painted mark, then slowly dropped over the next few days",
      "Inez copied the dates and water levels onto a chart"
    ]
  }
];

export const readingPassageBank = deepFreeze(readingPassages);

const TIER_ORDER = Object.freeze({ foundation: 0, core: 1, stretch: 2 });

function validateTier(tier, label) {
  if (!Object.hasOwn(TIER_ORDER, tier)) {
    throw new RangeError("Unknown " + label + " difficulty tier: " + tier);
  }
  return TIER_ORDER[tier];
}

export function getGrammarExamples(tier = "core") {
  const level = validateTier(tier, "grammar");
  return grammarSentenceBank.filter((entry) => TIER_ORDER[entry.tier] <= level);
}

export function getReadingPassages(tier = "core") {
  const level = validateTier(tier, "reading");
  return readingPassageBank.filter((entry) => TIER_ORDER[entry.tier] <= level);
}
