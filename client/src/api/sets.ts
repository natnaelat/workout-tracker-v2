const API_URL = import.meta.env.VITE_API_URL;

export interface WorkoutSet {
  id: string;
  weight_kg: string;
  weight_lbs: string;
  unit_entered: "kg" | "lbs";
  set_number: number;
  reps: number;
  performed_on: string;
}

export interface SetInput {
  weight: number;
  unit: "kg" | "lbs";
  setNumber: number;
  reps: number;
  date: string;
}

export async function fetchSets(exerciseId: string): Promise<WorkoutSet[]> {
  const res = await fetch(`${API_URL}/exercises/${exerciseId}/sets`);
  if (!res.ok) throw new Error("Failed to fetch sets");
  return res.json();
}

export async function createSet(exerciseId: string, input: SetInput): Promise<WorkoutSet> {
  const res = await fetch(`${API_URL}/exercises/${exerciseId}/sets`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Failed to create set");
  return res.json();
}

export async function updateSet(setId: string, input: SetInput): Promise<WorkoutSet> {
  const res = await fetch(`${API_URL}/sets/${setId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Failed to update set");
  return res.json();
}

export async function deleteSet(setId: string): Promise<void> {
  const res = await fetch(`${API_URL}/sets/${setId}`, { method: "DELETE" });
  if (!res.ok && res.status !== 404) throw new Error("Failed to delete set");
}