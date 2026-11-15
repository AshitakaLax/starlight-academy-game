import { QuestionGenerator, seededRng } from "../questionGenerator.js";
import { SKILL_IDS } from "../skillRegistry.js";

export class MeasurementGenerator extends QuestionGenerator {
  constructor() {
    super({ skillId: SKILL_IDS.MATH_MEASUREMENT_VOLUME, supportedTiers: ["Foundation","Developing","Core","Stretch"], objective: "Volume, mass, units, elapsed time", type: "mc" });
  }
  generate(seed, params = {}) {
    const rng = seededRng(seed);
    const kind = Math.floor(rng() * 3);
    if (kind === 0) {
      const l = Math.floor(rng() * 5) + 2;
      const w = Math.floor(rng() * 5) + 2;
      const h = Math.floor(rng() * 5) + 2;
      const vol = l * w * h;
      const choices = new Set([vol]);
      while (choices.size < 4) choices.add(vol + Math.floor(rng() * 9) - 4);
      const arr = [...choices];
      for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
      return { prompt: `Rectangular prism ${l}×${w}×${h}. Volume?`, choices: arr, answer: vol, hints: [{type:"gentle",text:"Volume = l×w×h"},{type:"clue",text:`${l}×${w}×${h}`},{type:"demonstration",text:`Volume = ${vol}.`,narrate:`Volume is ${vol}.`}] };
    }
    if (kind === 1) {
      // unit conversion cm to m? simple
      const cm = (Math.floor(rng() * 9) + 1) * 100;
      const m = cm / 100;
      const choices = [m, cm, m*10, m/10].map(String);
      // dedupe
      const uniq = [...new Set(choices)];
      return { prompt: `Convert ${cm} cm to meters.`, choices: uniq, answer: String(m), hints: [{type:"gentle",text:"100 cm = 1 m."},{type:"clue",text:"Divide by 100."},{type:"demonstration",text:`${cm} cm = ${m} m.`,narrate:`${cm} centimeters equals ${m} meters.`}] };
    }
    // elapsed time
    const start = Math.floor(rng() * 8) + 1;
    const dur = Math.floor(rng() * 5) + 1;
    const end = start + dur;
    const choices = [end, start, dur, end + 1].map(String);
    const uniq = [...new Set(choices)];
    return { prompt: `Start at ${start}:00, duration ${dur} hours. End time?`, choices: uniq, answer: String(end), hints: [{type:"gentle",text:"Add duration to start."},{type:"clue",text:`${start}+${dur}`},{type:"demonstration",text:`Ends at ${end}:00.`,narrate:`Ends at ${end} o'clock.`}] };
  }
  validate(q) { return !!q && Array.isArray(q.choices) && q.choices.includes(q.answer) && new Set(q.choices).size === q.choices.length; }
}
export default MeasurementGenerator;
