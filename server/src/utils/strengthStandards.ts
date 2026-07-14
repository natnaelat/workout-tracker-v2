// Strength standards based on Strength Level data
// Source: strengthlevel.com (48M+ bench, 24M+ squat, 22M+ deadlift lifts)
// Percentile mapping: Beginner=5%, Novice=20%, Intermediate=50%, Advanced=80%, Elite=95%

// Bodyweight brackets in lbs with corresponding 1RM standards
interface BodyweightStandard {
  bw: number;
  beginner: number;
  novice: number;
  intermediate: number;
  advanced: number;
  elite: number;
}

const PERCENTILE_POINTS = [5, 20, 50, 80, 95];

// Male Bench Press standards (lb) from Strength Level
const MALE_BENCH: BodyweightStandard[] = [
  { bw: 110, beginner: 53, novice: 84, intermediate: 125, advanced: 173, elite: 226 },
  { bw: 120, beginner: 63, novice: 97, intermediate: 140, advanced: 191, elite: 247 },
  { bw: 130, beginner: 73, novice: 109, intermediate: 154, advanced: 208, elite: 266 },
  { bw: 140, beginner: 83, novice: 121, intermediate: 169, advanced: 224, elite: 285 },
  { bw: 150, beginner: 93, novice: 133, intermediate: 182, advanced: 240, elite: 302 },
  { bw: 160, beginner: 102, novice: 144, intermediate: 196, advanced: 255, elite: 319 },
  { bw: 170, beginner: 112, novice: 155, intermediate: 209, advanced: 270, elite: 336 },
  { bw: 180, beginner: 121, novice: 166, intermediate: 221, advanced: 284, elite: 352 },
  { bw: 190, beginner: 130, novice: 177, intermediate: 234, advanced: 298, elite: 367 },
  { bw: 200, beginner: 139, novice: 187, intermediate: 246, advanced: 312, elite: 382 },
  { bw: 220, beginner: 156, novice: 207, intermediate: 269, advanced: 338, elite: 411 },
  { bw: 250, beginner: 181, novice: 236, intermediate: 301, advanced: 374, elite: 451 },
];

// Female Bench Press standards (lb)
const FEMALE_BENCH: BodyweightStandard[] = [
  { bw: 100, beginner: 23, novice: 46, intermediate: 79, advanced: 121, elite: 169 },
  { bw: 110, beginner: 27, novice: 52, intermediate: 87, advanced: 130, elite: 180 },
  { bw: 120, beginner: 32, novice: 58, intermediate: 94, advanced: 139, elite: 190 },
  { bw: 130, beginner: 36, novice: 63, intermediate: 101, advanced: 148, elite: 200 },
  { bw: 140, beginner: 40, novice: 69, intermediate: 108, advanced: 156, elite: 209 },
  { bw: 150, beginner: 43, novice: 74, intermediate: 114, advanced: 163, elite: 218 },
  { bw: 160, beginner: 47, novice: 79, intermediate: 120, advanced: 170, elite: 227 },
  { bw: 170, beginner: 51, novice: 83, intermediate: 126, advanced: 177, elite: 235 },
  { bw: 180, beginner: 55, novice: 88, intermediate: 132, advanced: 184, elite: 242 },
  { bw: 200, beginner: 62, novice: 97, intermediate: 143, advanced: 197, elite: 257 },
  { bw: 230, beginner: 72, novice: 109, intermediate: 157, advanced: 214, elite: 277 },
];

// Male Squat standards (lb)
const MALE_SQUAT: BodyweightStandard[] = [
  { bw: 110, beginner: 74, novice: 114, intermediate: 167, advanced: 229, elite: 298 },
  { bw: 120, beginner: 87, novice: 131, intermediate: 187, advanced: 252, elite: 324 },
  { bw: 130, beginner: 100, novice: 147, intermediate: 206, advanced: 274, elite: 349 },
  { bw: 140, beginner: 113, novice: 162, intermediate: 224, advanced: 295, elite: 373 },
  { bw: 150, beginner: 125, novice: 177, intermediate: 242, advanced: 316, elite: 396 },
  { bw: 160, beginner: 138, novice: 192, intermediate: 259, advanced: 336, elite: 418 },
  { bw: 170, beginner: 150, novice: 207, intermediate: 276, advanced: 355, elite: 439 },
  { bw: 180, beginner: 162, novice: 221, intermediate: 292, advanced: 373, elite: 460 },
  { bw: 190, beginner: 174, novice: 235, intermediate: 308, advanced: 391, elite: 479 },
  { bw: 200, beginner: 186, novice: 248, intermediate: 323, advanced: 408, elite: 499 },
  { bw: 220, beginner: 209, novice: 274, intermediate: 353, advanced: 442, elite: 535 },
  { bw: 250, beginner: 241, novice: 311, intermediate: 395, advanced: 488, elite: 586 },
];

// Female Squat standards (lb)
const FEMALE_SQUAT: BodyweightStandard[] = [
  { bw: 100, beginner: 46, novice: 79, intermediate: 124, advanced: 179, elite: 241 },
  { bw: 110, beginner: 51, novice: 87, intermediate: 134, advanced: 191, elite: 254 },
  { bw: 120, beginner: 57, novice: 94, intermediate: 143, advanced: 201, elite: 267 },
  { bw: 130, beginner: 63, novice: 101, intermediate: 152, advanced: 212, elite: 279 },
  { bw: 140, beginner: 68, novice: 108, intermediate: 160, advanced: 222, elite: 290 },
  { bw: 150, beginner: 73, novice: 115, intermediate: 168, advanced: 231, elite: 301 },
  { bw: 160, beginner: 78, novice: 121, intermediate: 175, advanced: 240, elite: 311 },
  { bw: 170, beginner: 83, novice: 127, intermediate: 183, advanced: 248, elite: 320 },
  { bw: 180, beginner: 88, novice: 133, intermediate: 190, advanced: 256, elite: 329 },
  { bw: 200, beginner: 97, novice: 144, intermediate: 203, advanced: 272, elite: 347 },
  { bw: 230, beginner: 110, novice: 159, intermediate: 221, advanced: 293, elite: 371 },
];

// Male Deadlift standards (lb)
const MALE_DEADLIFT: BodyweightStandard[] = [
  { bw: 110, beginner: 96, novice: 144, intermediate: 204, advanced: 275, elite: 352 },
  { bw: 120, beginner: 111, novice: 162, intermediate: 225, advanced: 300, elite: 380 },
  { bw: 130, beginner: 126, novice: 179, intermediate: 246, advanced: 323, elite: 407 },
  { bw: 140, beginner: 140, novice: 197, intermediate: 266, advanced: 346, elite: 433 },
  { bw: 150, beginner: 154, novice: 213, intermediate: 286, advanced: 368, elite: 457 },
  { bw: 160, beginner: 168, novice: 229, intermediate: 304, advanced: 389, elite: 481 },
  { bw: 170, beginner: 181, novice: 245, intermediate: 322, advanced: 410, elite: 503 },
  { bw: 180, beginner: 195, novice: 261, intermediate: 340, advanced: 430, elite: 525 },
  { bw: 190, beginner: 208, novice: 275, intermediate: 357, advanced: 449, elite: 546 },
  { bw: 200, beginner: 220, novice: 290, intermediate: 373, advanced: 467, elite: 567 },
  { bw: 220, beginner: 245, novice: 318, intermediate: 405, advanced: 503, elite: 606 },
  { bw: 250, beginner: 280, novice: 358, intermediate: 450, advanced: 552, elite: 660 },
];

// Female Deadlift standards (lb)
const FEMALE_DEADLIFT: BodyweightStandard[] = [
  { bw: 100, beginner: 61, novice: 99, intermediate: 150, advanced: 211, elite: 279 },
  { bw: 110, beginner: 67, novice: 108, intermediate: 161, advanced: 224, elite: 294 },
  { bw: 120, beginner: 74, novice: 116, intermediate: 171, advanced: 235, elite: 307 },
  { bw: 130, beginner: 80, novice: 124, intermediate: 180, advanced: 246, elite: 319 },
  { bw: 140, beginner: 86, novice: 131, intermediate: 189, advanced: 257, elite: 331 },
  { bw: 150, beginner: 92, novice: 138, intermediate: 197, advanced: 267, elite: 343 },
  { bw: 160, beginner: 97, novice: 145, intermediate: 205, advanced: 276, elite: 353 },
  { bw: 170, beginner: 103, novice: 152, intermediate: 213, advanced: 285, elite: 363 },
  { bw: 180, beginner: 108, novice: 158, intermediate: 221, advanced: 294, elite: 373 },
  { bw: 200, beginner: 118, novice: 170, intermediate: 235, advanced: 310, elite: 391 },
  { bw: 230, beginner: 132, novice: 186, intermediate: 254, advanced: 332, elite: 416 },
];

const STANDARDS: Record<string, Record<string, BodyweightStandard[]>> = {
  "Bench Press": { male: MALE_BENCH, female: FEMALE_BENCH },
  "Squat": { male: MALE_SQUAT, female: FEMALE_SQUAT },
  "Deadlift": { male: MALE_DEADLIFT, female: FEMALE_DEADLIFT },
};

function interpolate(x: number, x0: number, x1: number, y0: number, y1: number): number {
  return y0 + (y1 - y0) * (x - x0) / (x1 - x0);
}

function getStandardsAtBodyweight(table: BodyweightStandard[], bodyweightLbs: number): number[] {
  // Clamp to table range
  if (bodyweightLbs <= table[0].bw) {
    const s = table[0];
    return [s.beginner, s.novice, s.intermediate, s.advanced, s.elite];
  }
  if (bodyweightLbs >= table[table.length - 1].bw) {
    const s = table[table.length - 1];
    return [s.beginner, s.novice, s.intermediate, s.advanced, s.elite];
  }
  // Find surrounding rows and interpolate
  for (let i = 0; i < table.length - 1; i++) {
    if (bodyweightLbs >= table[i].bw && bodyweightLbs <= table[i + 1].bw) {
      const s0 = table[i];
      const s1 = table[i + 1];
      return [
        interpolate(bodyweightLbs, s0.bw, s1.bw, s0.beginner, s1.beginner),
        interpolate(bodyweightLbs, s0.bw, s1.bw, s0.novice, s1.novice),
        interpolate(bodyweightLbs, s0.bw, s1.bw, s0.intermediate, s1.intermediate),
        interpolate(bodyweightLbs, s0.bw, s1.bw, s0.advanced, s1.advanced),
        interpolate(bodyweightLbs, s0.bw, s1.bw, s0.elite, s1.elite),
      ];
    }
  }
  return [0, 0, 0, 0, 0];
}

function getPercentileFromStandards(e1rmLbs: number, standards: number[]): number {
  // standards = [beginner(5%), novice(20%), intermediate(50%), advanced(80%), elite(95%)]
  if (e1rmLbs <= standards[0]) return Math.round(e1rmLbs / standards[0] * 5);
  if (e1rmLbs >= standards[4]) return Math.min(99, Math.round(95 + (e1rmLbs - standards[4]) / standards[4] * 4));

  for (let i = 0; i < standards.length - 1; i++) {
    if (e1rmLbs >= standards[i] && e1rmLbs <= standards[i + 1]) {
      return Math.round(interpolate(e1rmLbs, standards[i], standards[i + 1], PERCENTILE_POINTS[i], PERCENTILE_POINTS[i + 1]));
    }
  }
  return 50;
}

export function calculateStrengthPercentile(
  exercise: string,
  sex: string,
  e1rmKg: number,
  bodyweightKg: number,
  weightAdjusted: boolean
): number | null {
  const exerciseStandards = STANDARDS[exercise];
  if (!exerciseStandards) return null;

  const table = exerciseStandards[sex];
  if (!table) return null;

  // Convert to lbs for lookup
  const e1rmLbs = e1rmKg * 2.20462;
  const bodyweightLbs = bodyweightKg * 2.20462;

  if (weightAdjusted) {
    // Use bodyweight-specific standards
    const standards = getStandardsAtBodyweight(table, bodyweightLbs);
    return getPercentileFromStandards(e1rmLbs, standards);
  } else {
    // Overall: use the middle bodyweight row as reference (180 lbs for men, 150 lbs for women)
    const refBw = sex === "male" ? 180 : 150;
    const standards = getStandardsAtBodyweight(table, refBw);
    return getPercentileFromStandards(e1rmLbs, standards);
  }
}