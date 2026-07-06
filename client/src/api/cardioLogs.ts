const API_URL = import.meta.env.VITE_API_URL;

export interface CardioLog {
  id: string;
  distance: string;
  distance_unit: "mi" | "km";
  duration_secs: number;
  performed_on: string;
}

export interface CardioLogInput {
  distance: number;
  distance_unit: "mi" | "km";
  duration_secs: number;
  date: string;
}

export function formatDuration(totalSecs: number): string {
  const h = Math.floor(totalSecs / 3600);
  const m = Math.floor((totalSecs % 3600) / 60);
  const s = totalSecs % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function formatPace(totalSecs: number, distance: number, unit: "mi" | "km"): string {
  if (distance === 0) return "—";
  const secsPerUnit = totalSecs / distance;
  const mins = Math.floor(secsPerUnit / 60);
  const secs = Math.round(secsPerUnit % 60);
  return `${mins}:${String(secs).padStart(2, "0")} /${unit}`;
}

export async function fetchCardioLogs(exerciseId: string): Promise<CardioLog[]> {
  const res = await fetch(`${API_URL}/exercises/${exerciseId}/cardio`);
  if (!res.ok) throw new Error("Failed to fetch cardio logs");
  return res.json();
}

export async function createCardioLog(exerciseId: string, input: CardioLogInput): Promise<CardioLog> {
  const res = await fetch(`${API_URL}/exercises/${exerciseId}/cardio`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Failed to create cardio log");
  return res.json();
}

export async function updateCardioLog(id: string, input: CardioLogInput): Promise<CardioLog> {
  const res = await fetch(`${API_URL}/cardio/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Failed to update cardio log");
  return res.json();
}

export async function deleteCardioLog(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/cardio/${id}`, { method: "DELETE" });
  if (!res.ok && res.status !== 404) throw new Error("Failed to delete cardio log");
}