const API_URL = import.meta.env.VITE_API_URL;

export interface LatestWeight {
  weight_kg: string;
  weight_lbs: string;
  unit_entered: "kg" | "lbs";
  logged_on: string;
}

export interface Profile {
  first_name: string | null;
  last_name: string | null;
  birth_date: string | null;
  sex: string | null;
  height_ft: number | null;
  height_in: number | null;
  latestWeight: LatestWeight | null;
}

export async function fetchProfile(): Promise<Profile> {
  const res = await fetch(`${API_URL}/profile`);
  if (!res.ok) throw new Error("Failed to fetch profile");
  return res.json();
}

export async function updateProfile(data: Partial<Omit<Profile, "latestWeight">>): Promise<Profile> {
  const res = await fetch(`${API_URL}/profile`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update profile");
  return res.json();
}