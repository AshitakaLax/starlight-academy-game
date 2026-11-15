/**
 * Skill registry: declares skill metadata and helpers.
 */
export const SKILL_IDS = Object.freeze({
  MATH_MULT_FACTS_1_5: "math.multiplication.facts_1_to_5",
  MATH_FRACTIONS_PARTS: "math.fractions.identify_parts",
  MATH_FRACTIONS_EQUIV: "math.fractions.equivalent",
  ELA_SPELLING_PREFIXES: "ela.spelling.prefixes",
  ELA_SPELLING_ROOTS: "ela.spelling.roots",
  ELA_SPELLING_SUFFIXES: "ela.spelling.suffixes",
  ELA_GRAMMAR_POS: "ela.grammar.parts_of_speech",
  ELA_READING_MAIN_IDEA: "ela.reading.main_idea",
  SCIENCE_HABITATS: "science.habitats.adaptations",
  SCIENCE_BOTANY_LIFECYCLE: "science.botany.plant_lifecycle",
  MATH_MEASUREMENT_VOLUME: "math.measurement.volume",
  MATH_MEASUREMENT_ELAPSED_TIME: "math.measurement.elapsed_time",
  MATH_MULTISTEP: "math.multistep.reasoning",
  MATH_GEOMETRY_SHAPES: "math.geometry.shapes",
});

export function registerSkill(registry, skillId, meta) {
  registry[skillId] = { ...(registry[skillId] || {}), ...meta };
}

export class SkillRegistry {
  constructor() {
    this.skills = {};
  }
  define(skillId, meta) {
    this.skills[skillId] = { skillId, ...meta };
  }
  get(skillId) {
    return this.skills[skillId] || null;
  }
  list() {
    return Object.keys(this.skills);
  }
}
export default SkillRegistry;
