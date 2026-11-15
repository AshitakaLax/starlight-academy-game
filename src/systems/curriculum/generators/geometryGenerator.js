import { QuestionGenerator, seededRng } from "../questionGenerator.js";
import { SKILL_IDS } from "../skillRegistry.js";

export class GeometryGenerator extends QuestionGenerator {
  constructor() {
    super({ skillId: SKILL_IDS.MATH_GEOMETRY_SHAPES, supportedTiers: ["Foundation","Developing","Core","Stretch"], objective: "Shapes, symmetry, angles, perimeter, area", type: "mc" });
  }
  generate(seed, params = {}) {
    const rng = seededRng(seed);
    const kind = Math.floor(rng() * 4);
    if (kind === 0) {
      const w = Math.floor(rng() * 6) + 2;
      const h = Math.floor(rng() * 6) + 2;
      const area = w * h;
      const choices = new Set([area]);
      while (choices.size < 4) choices.add(area + Math.floor(rng() * 7) - 3);
      const arr = [...choices];
      for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
      return { prompt: `Rectangle ${w} by ${h}. What is the area?`, choices: arr, answer: area, hints: [{type:"gentle",text:"Area = width × height"},{type:"clue",text:`${w} × ${h}`},{type:"demonstration",text:`Area = ${area}.`,narrate:`The area is ${area}.`}] };
    }
    if (kind === 1) {
      const w = Math.floor(rng() * 6) + 2;
      const h = Math.floor(rng() * 6) + 2;
      const perim = 2 * (w + h);
      const choices = new Set([perim]);
      while (choices.size < 4) choices.add(perim + Math.floor(rng() * 7) - 3);
      const arr = [...choices];
      for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
      return { prompt: `Rectangle ${w} by ${h}. What is the perimeter?`, choices: arr, answer: perim, hints: [{type:"gentle",text:"Perimeter = 2×(w+h)"},{type:"clue",text:`2×(${w}+${h})`},{type:"demonstration",text:`Perimeter = ${perim}.`,narrate:`The perimeter is ${perim}.`}] };
    }
    if (kind === 2) {
      const sides = [3,4,5,6][Math.floor(rng()*4)];
      const names = {3:"Triangle",4:"Quadrilateral",5:"Pentagon",6:"Hexagon"};
      const answer = names[sides];
      const choices = ["Triangle","Quadrilateral","Pentagon","Hexagon"];
      return { prompt: `A polygon has ${sides} sides. What is it called?`, choices, answer, hints: [{type:"gentle",text:"Count the sides."},{type:"clue",text:`${sides} sides`},{type:"demonstration",text:`${sides} sides = ${answer}.`,narrate:`It is a ${answer}.`}] };
    }
    // symmetry
    const answer = rng() > 0.5 ? "Yes" : "No";
    return { prompt: "Does a square have a line of symmetry?", choices: ["Yes","No"], answer, hints: [{type:"gentle",text:"Fold it in half."},{type:"clue",text:"Squares are symmetric."},{type:"demonstration",text:"Yes, many lines.",narrate:"Yes."}] };
  }
  validate(q) { return !!q && Array.isArray(q.choices) && new Set(q.choices).size === q.choices.length && q.choices.includes(q.answer); }
}
export default GeometryGenerator;
