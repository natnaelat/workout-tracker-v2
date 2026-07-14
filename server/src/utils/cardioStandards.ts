// Pace standards in seconds per mile by sex and age group
// Based on published average running data

interface PaceTable {
  paceSecs: number[]; // seconds per mile — lower is faster
  percentiles: number[];
}

// Note: faster pace = lower seconds = higher percentile
// So percentiles are ordered from slowest to fastest
const MALE_PACE: Record<string, PaceTable> = {
  "18-24": { paceSecs: [960, 840, 720, 630, 540, 480, 420, 360], percentiles: [5, 20, 40, 55, 70, 80, 90, 95] },
  "25-34": { paceSecs: [960, 840, 720, 630, 540, 480, 420, 360], percentiles: [5, 20, 40, 55, 70, 80, 90, 95] },
  "35-44": { paceSecs: [1020, 900, 780, 660, 570, 510, 450, 390], percentiles: [5, 20, 40, 55, 70, 80, 90, 95] },
  "45-54": { paceSecs: [1080, 960, 840, 720, 630, 570, 510, 450], percentiles: [5, 20, 40, 55, 70, 80, 90, 95] },
  "55-64": { paceSecs: [1140, 1020, 900, 780, 690, 630, 570, 510], percentiles: [5, 20, 40, 55, 70, 80, 90, 95] },
  "65+":   { paceSecs: [1200, 1080, 960, 840, 750, 690, 630, 570], percentiles: [5, 20, 40, 55, 70, 80, 90, 95] },
};

const FEMALE_PACE: Record<string, PaceTable> = {
  "18-24": { paceSecs: [1140, 1020, 900, 780, 690, 600, 540, 480], percentiles: [5, 20, 40, 55, 70, 80, 90, 95] },
  "25-34": { paceSecs: [1140, 1020, 900, 780, 690, 600, 540, 480], percentiles: [5, 20, 40, 55, 70, 80, 90, 95] },
  "35-44": { paceSecs: [1200, 1080, 960, 840, 750, 660, 600, 540], percentiles: [5, 20, 40, 55, 70, 80, 90, 95] },
  "45-54": { paceSecs: [1260, 1140, 1020, 900, 810, 720, 660, 600], percentiles: [5, 20, 40, 55, 70, 80, 90, 95] },
  "55-64": { paceSecs: [1320, 1200, 1080, 960, 870, 780, 720, 660], percentiles: [5, 20, 40, 55, 70, 80, 90, 95] },
  "65+":   { paceSecs: [1380, 1260, 1140, 1020, 930, 840, 780, 720], percentiles: [5, 20, 40, 55, 70, 80, 90, 95] },
};

function getAgeGroup(birthDate: string): string {
  const [year, month, day] = birthDate.split("-").map(Number);
  const today = new Date();
  let age = today.getFullYear() - year;
  if (today.getMonth() + 1 < month || (today.getMonth() + 1 === month && today.getDate() < day)) age--;
  if (age < 25) return "18-24";
  if (age < 35) return "25-34";
  if (age < 45) return "35-44";
  if (age < 55) return "45-54";
  if (age < 65) return "55-64";
  return "65+";
}

function interpolatePacePercentile(paceSecsPerMile: number, table: PaceTable): number {
  const { paceSecs, percentiles } = table;
  // Slower pace (higher secs) = lower percentile
  if (paceSecsPerMile >= paceSecs[0]) return percentiles[0];
  if (paceSecsPerMile <= paceSecs[paceSecs.length - 1]) return percentiles[percentiles.length - 1];
  for (let i = 0; i < paceSecs.length - 1; i++) {
    if (paceSecsPerMile <= paceSecs[i] && paceSecsPerMile >= paceSecs[i + 1]) {
      const t = (paceSecs[i] - paceSecsPerMile) / (paceSecs[i] - paceSecs[i + 1]);
      return Math.round(percentiles[i] + t * (percentiles[i + 1] - percentiles[i]));
    }
  }
  return 50;
}

// Overall (non-age-adjusted) uses 25-34 as baseline
export function calculateCardioPercentile(
  sex: string,
  paceSecsPerMile: number,
  birthDate: string | null,
  ageAdjusted: boolean
): number {
  const tables = sex === "male" ? MALE_PACE : FEMALE_PACE;
  const ageGroup = ageAdjusted && birthDate ? getAgeGroup(birthDate) : "25-34";
  const table = tables[ageGroup];
  return interpolatePacePercentile(paceSecsPerMile, table);
}