export function calculateE1RM(weightKg: number, reps: number): number {
  return weightKg * (1 + reps / 30);
}

export function formatShortDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}