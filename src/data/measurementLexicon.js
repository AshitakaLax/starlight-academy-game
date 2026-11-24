function deepFreeze(value) {
  if (!value || typeof value !== "object") return value;
  for (const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
}

const VOLUME_CONFIG = Object.freeze({
  foundation: Object.freeze({ capacityMl: 200, graduationMl: 50, labelEveryMl: 50 }),
  core: Object.freeze({ capacityMl: 500, graduationMl: 100, labelEveryMl: 100 }),
  stretch: Object.freeze({ capacityMl: 600, graduationMl: 50, labelEveryMl: 100 })
});

export function getVolumeScale(tier = "core") {
  const config = VOLUME_CONFIG[tier];
  if (!config) throw new RangeError("Unknown volume difficulty tier: " + tier);
  const graduations = [];
  for (let value = 0; value <= config.capacityMl; value += config.graduationMl) {
    graduations.push({
      value,
      major: value % config.labelEveryMl === 0,
      label: value % config.labelEveryMl === 0 ? String(value) : null
    });
  }
  return {
    ...config,
    graduations,
    availableReadings: graduations.filter((entry) => entry.value > 0 && entry.value < config.capacityMl).map((entry) => entry.value)
  };
}

/**
 * Each balance problem shows the standard masses on one pan. A level beam
 * means the unknown object on the opposite pan has the same combined mass.
 */
export const massBalanceProblems = deepFreeze([
  { id: "shell-box", tier: "foundation", object: "A box of seashells", weights: [100, 100], massGrams: 200, explanation: "The balance is level, so the box has the same mass as the two weights: 100 g + 100 g." },
  { id: "pearl-pouch", tier: "foundation", object: "A pouch of smooth stones", weights: [100, 200], massGrams: 300, explanation: "The balance is level, so add the two masses: 100 g + 200 g = 300 g." },
  { id: "coral-case", tier: "foundation", object: "A case of coral samples", weights: [200, 200], massGrams: 400, explanation: "The balance is level, so the case matches 200 g + 200 g = 400 g." },
  { id: "message-tin", tier: "foundation", object: "A small message tin", weights: [100, 300], massGrams: 400, explanation: "The balance is level, so the tin matches 100 g + 300 g = 400 g." },

  { id: "shell-collection", tier: "core", object: "A shell collection", weights: [150, 250], massGrams: 400, explanation: "The balanced pans have equal mass: 150 g + 250 g = 400 g." },
  { id: "anchor-model", tier: "core", object: "A model anchor", weights: [225, 175], massGrams: 400, explanation: "The balanced pans have equal mass: 225 g + 175 g = 400 g." },
  { id: "diving-bell", tier: "core", object: "A brass diving-bell model", weights: [300, 250], massGrams: 550, explanation: "The balanced pans have equal mass: 300 g + 250 g = 550 g." },
  { id: "glass-orb", tier: "core", object: "A glass tide orb", weights: [125, 225], massGrams: 350, explanation: "The balanced pans have equal mass: 125 g + 225 g = 350 g." },

  { id: "compass-case", tier: "stretch", object: "A waterproof compass case", weights: [225, 175, 150], massGrams: 550, explanation: "The balanced pans have equal mass: 225 g + 175 g + 150 g = 550 g." },
  { id: "bronze-plaque", tier: "stretch", object: "A bronze sea plaque", weights: [275, 325], massGrams: 600, explanation: "The balanced pans have equal mass: 275 g + 325 g = 600 g." },
  { id: "instrument-kit", tier: "stretch", object: "A set of tide instruments", weights: [125, 225, 275], massGrams: 625, explanation: "The balanced pans have equal mass: 125 g + 225 g + 275 g = 625 g." },
  { id: "crystal-lantern", tier: "stretch", object: "A crystal lantern", weights: [350, 175, 125], massGrams: 650, explanation: "The balanced pans have equal mass: 350 g + 175 g + 125 g = 650 g." }
]);

const TIER_ORDER = Object.freeze({ foundation: 0, core: 1, stretch: 2 });

function tierLevel(tier, label) {
  if (!Object.hasOwn(TIER_ORDER, tier)) throw new RangeError("Unknown " + label + " difficulty tier: " + tier);
  return TIER_ORDER[tier];
}

export function getMassBalanceProblems(tier = "core") {
  const level = tierLevel(tier, "mass");
  return massBalanceProblems.filter((problem) => TIER_ORDER[problem.tier] <= level);
}

export const unitConversionProblems = deepFreeze([
  { id: "centimeters-to-meters", tier: "foundation", sourceValue: 100, fromUnit: "cm", resultValue: 1, toUnit: "m", choices: ["1 m", "10 m", "100 m", "0.1 m"], explanation: "There are 100 centimeters in 1 meter, so 100 cm = 1 m." },
  { id: "meters-to-centimeters", tier: "foundation", sourceValue: 2, fromUnit: "m", resultValue: 200, toUnit: "cm", choices: ["20 cm", "200 cm", "2,000 cm", "100 cm"], explanation: "Each meter contains 100 centimeters, so 2 m = 200 cm." },
  { id: "three-meters-to-centimeters", tier: "foundation", sourceValue: 3, fromUnit: "m", resultValue: 300, toUnit: "cm", choices: ["30 cm", "300 cm", "3,000 cm", "103 cm"], explanation: "Multiply meters by 100 to convert to centimeters: 3 m = 300 cm." },
  { id: "four-hundred-centimeters", tier: "foundation", sourceValue: 400, fromUnit: "cm", resultValue: 4, toUnit: "m", choices: ["4 m", "40 m", "0.4 m", "400 m"], explanation: "Divide centimeters by 100 to convert to meters: 400 cm = 4 m." },

  { id: "liters-to-milliliters", tier: "core", sourceValue: 2, fromUnit: "L", resultValue: 2000, toUnit: "mL", choices: ["200 mL", "2,000 mL", "20,000 mL", "1,002 mL"], explanation: "There are 1,000 milliliters in 1 liter, so 2 L = 2,000 mL." },
  { id: "milliliters-to-liters", tier: "core", sourceValue: 750, fromUnit: "mL", resultValue: 0.75, toUnit: "L", choices: ["7.5 L", "0.075 L", "0.75 L", "75 L"], explanation: "Divide milliliters by 1,000 to convert to liters: 750 mL = 0.75 L." },
  { id: "five-liters-to-milliliters", tier: "core", sourceValue: 5, fromUnit: "L", resultValue: 5000, toUnit: "mL", choices: ["500 mL", "5,000 mL", "50,000 mL", "1,005 mL"], explanation: "Multiply liters by 1,000 to convert to milliliters: 5 L = 5,000 mL." },
  { id: "three-thousand-milliliters", tier: "core", sourceValue: 3000, fromUnit: "mL", resultValue: 3, toUnit: "L", choices: ["30 L", "0.3 L", "300 L", "3 L"], explanation: "Divide milliliters by 1,000 to convert to liters: 3,000 mL = 3 L." },

  { id: "kilograms-to-grams", tier: "stretch", sourceValue: 2.5, fromUnit: "kg", resultValue: 2500, toUnit: "g", choices: ["250 g", "2,500 g", "25,000 g", "2,050 g"], explanation: "There are 1,000 grams in 1 kilogram, so 2.5 kg = 2,500 g." },
  { id: "grams-to-kilograms", tier: "stretch", sourceValue: 1750, fromUnit: "g", resultValue: 1.75, toUnit: "kg", choices: ["17.5 kg", "0.175 kg", "1.75 kg", "175 kg"], explanation: "Divide grams by 1,000 to convert to kilograms: 1,750 g = 1.75 kg." },
  { id: "meters-to-centimeters-stretch", tier: "stretch", sourceValue: 4.6, fromUnit: "m", resultValue: 460, toUnit: "cm", choices: ["46 cm", "460 cm", "4,600 cm", "104 cm"], explanation: "Multiply meters by 100 to convert to centimeters: 4.6 m = 460 cm." },
  { id: "centimeters-to-meters-stretch", tier: "stretch", sourceValue: 235, fromUnit: "cm", resultValue: 2.35, toUnit: "m", choices: ["23.5 m", "0.235 m", "2.35 m", "2350 m"], explanation: "Divide centimeters by 100 to convert to meters: 235 cm = 2.35 m." }
]);

export function getUnitConversionProblems(tier = "core") {
  const level = tierLevel(tier, "unit-conversion");
  return unitConversionProblems.filter((problem) => TIER_ORDER[problem.tier] <= level);
}

const ELAPSED_TIME_OPTIONS = Object.freeze({
  foundation: Object.freeze({
    startStep: 60,
    durationChoices: [30, 60, 90, 120],
    minimumStart: 8 * 60,
    maximumStart: 14 * 60
  }),
  core: Object.freeze({
    startStep: 15,
    durationChoices: [15, 30, 45, 60, 75, 90],
    minimumStart: 8 * 60,
    maximumStart: 15 * 60
  }),
  stretch: Object.freeze({
    startStep: 5,
    durationChoices: [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 70, 75, 80, 90, 95, 100],
    minimumStart: 8 * 60,
    maximumStart: 15 * 60
  })
});

export function getElapsedTimeOptions(tier = "core") {
  const config = ELAPSED_TIME_OPTIONS[tier];
  if (!config) throw new RangeError("Unknown elapsed-time difficulty tier: " + tier);
  return { ...config, durationChoices: [...config.durationChoices] };
}
