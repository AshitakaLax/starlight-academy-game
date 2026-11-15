import { QuestionGenerator, seededRng } from "../questionGenerator.js";
import { SKILL_IDS } from "../skillRegistry.js";

const SENTENCES = [
  { sentence: "The cat sleeps.", target: "cat", answer: "noun" },
  { sentence: "She runs fast.", target: "runs", answer: "verb" },
  { sentence: "The blue bird sings.", target: "blue", answer: "adjective" },
];

const PASSAGES = [
  { text: "Bees make honey from flowers. Honey is sweet and used in food.", question: "What is the main idea?", answer: "Bees make honey.", choices: ["Bees make honey.", "Flowers are red.", "Honey is sour.", "Bees live in water."] },
];

export class GrammarGenerator extends QuestionGenerator {
  constructor() {
    super({ skillId: SKILL_IDS.ELA_GRAMMAR_POS, supportedTiers: ["Foundation","Developing","Core","Stretch"], objective: "Parts of speech", type: "mc" });
  }
  generate(seed, params = {}) {
    const rng = seededRng(seed);
    if (rng() > 0.5) {
      const item = SENTENCES[Math.floor(rng() * SENTENCES.length)];
      const choices = ["noun","verb","adjective","adverb"];
      return {
        prompt: `In "${item.sentence}", what part of speech is "${item.target}"?`,
        choices,
        answer: item.answer,
        hints: [{type:"gentle",text:"Identify the word's job."},{type:"clue",text:"Noun names, verb acts, adjective describes."},{type:"demonstration",text:`${item.target} is a ${item.answer}.`,narrate:`${item.target} is a ${item.answer}.`}],
      };
    }
    const p = PASSAGES[Math.floor(rng() * PASSAGES.length)];
    const arr = [...p.choices];
    for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
    return {
      prompt: `${p.text} ${p.question}`,
      choices: arr,
      answer: p.answer,
      hints: [{type:"gentle",text:"Find the overall point."},{type:"clue",text:"Focus on what the passage is mostly about."},{type:"demonstration",text:`Main idea: ${p.answer}.`,narrate:`The main idea is ${p.answer}.`}],
    };
  }
  validate(q) { return !!q && Array.isArray(q.choices) && q.choices.includes(q.answer) && new Set(q.choices).size === q.choices.length; }
}
export default GrammarGenerator;
