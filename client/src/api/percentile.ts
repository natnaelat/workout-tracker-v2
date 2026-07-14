const API_URL = import.meta.env.VITE_API_URL;

export interface PercentileResult {
  percentile: number | null;
  reason?: string;
}

export async function fetchPercentile(
  exerciseId: string,
  type: "strength" | "cardio",
  bestEver: boolean,
  ageAdjusted: boolean
): Promise<PercentileResult> {
  const params = new URLSearchParams({
    exerciseId,
    type,
    bestEver: String(bestEver),
    ageAdjusted: String(ageAdjusted),
  });
  const res = await fetch(`${API_URL}/percentile?${params}`);
  if (!res.ok) throw new Error("Failed to fetch percentile");
  return res.json();
}