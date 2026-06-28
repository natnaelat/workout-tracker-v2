const API_URL = import.meta.env.VITE_API_URL;

export interface Exercise {
  id: string;
  name: string;
}

export async function fetchExercises(): Promise<Exercise[]> {
  const res = await fetch(`${API_URL}/exercises`);
  if (!res.ok) throw new Error("Failed to fetch exercises");
  return res.json();
}

export async function createExercise(name: string): Promise<Exercise> {
  const res = await fetch(`${API_URL}/exercises`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  if (res.status === 409) throw new Error("DUPLICATE");
  if (!res.ok) throw new Error("Failed to create exercise");
  return res.json();
}

export async function deleteExercise(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/exercises/${id}`, { method: "DELETE" });
  if (!res.ok && res.status !== 404) throw new Error("Failed to delete exercise");
}