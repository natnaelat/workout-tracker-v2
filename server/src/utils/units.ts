const KG_TO_LBS = 2.20462;

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function toKgAndLbs(weight: number, unit: "kg" | "lbs") {
  if (unit === "kg") {
    return { weightKg: round2(weight), weightLbs: round2(weight * KG_TO_LBS) };
  }
  return { weightKg: round2(weight / KG_TO_LBS), weightLbs: round2(weight) };
}

export function calculateE1RM(weightKg: number, reps: number): number {
  return weightKg * (1 + reps / 30);
}