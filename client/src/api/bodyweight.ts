const API_URL = import.meta.env.VITE_API_URL;

export interface WeightLog {
  id: string;
  weight_kg: string;
  weight_lbs: string;
  unit_entered: "kg" | "lbs";
  logged_on: string;
}

export interface WeightInput {
  weight: number;
  unit: "kg" | "lbs";
  date: string;
}

export async function fetchWeightLogs(): Promise<WeightLog[]> {
  const res = await fetch(`${API_URL}/bodyweight`);
  if (!res.ok) throw new Error("Failed to fetch weight logs");
  return res.json();
}

export async function createWeightLog(input: WeightInput): Promise<WeightLog> {
  const res = await fetch(`${API_URL}/bodyweight`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Failed to create weight log");
  return res.json();
}

export async function updateWeightLog(id: string, input: WeightInput): Promise<WeightLog> {
  const res = await fetch(`${API_URL}/bodyweight/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Failed to update weight log");
  return res.json();
}

export async function deleteWeightLog(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/bodyweight/${id}`, { method: "DELETE" });
  if (!res.ok && res.status !== 404) throw new Error("Failed to delete weight log");
}