import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import "./LogPage.css";

interface WorkoutEntry {
  id: string;
  weight: string;
  sets: string;
  reps: string;
  date: string;
}

type FilterKey = "weight" | "sets" | "reps" | "date";
const FILTER_COLUMNS: { key: FilterKey; label: string }[] = [
  { key: "weight", label: "Weight (lbs)" },
  { key: "sets", label: "Sets" },
  { key: "reps", label: "Reps" },
  { key: "date", label: "Date" },
];

const getTodayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const LogPage = () => {
  const location = useLocation();
  const exerciseName = new URLSearchParams(location.search).get("exercise") || "None";

  const [formData, setFormData] = useState({ weight: "", sets: "", reps: "", date: getTodayStr() });
  // TODO: replace with data fetched from the API for this exercise
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutEntry[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ weight: "", sets: "", reps: "", date: "" });
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [availableFilters, setAvailableFilters] = useState<Record<string, string[]>>({
    weight: [], sets: [], reps: [], date: [],
  });
  const [filterOpen, setFilterOpen] = useState<string | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditClick = (entry: WorkoutEntry) => {
    setEditingId(entry.id);
    setEditForm({ weight: entry.weight, sets: entry.sets, reps: entry.reps, date: entry.date });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveEdit = () => {
    if (!editingId) return;
    // TODO: replace with API call -> PATCH /workouts/:id
    setWorkoutHistory((prev) => prev.map((w) => (w.id === editingId ? { ...w, ...editForm } : w)));
    setEditingId(null);
  };

  const handleCancelEdit = () => setEditingId(null);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: replace with API call -> POST /workouts
    const newLog: WorkoutEntry = { id: crypto.randomUUID(), ...formData };
    setWorkoutHistory((prev) => [...prev, newLog]);
    setFormData({ weight: "", sets: "", reps: "", date: getTodayStr() });
  };

  const handleDeleteWorkout = (workoutId: string) => {
    const confirmed = window.confirm("Delete this workout entry?");
    if (!confirmed) return;
    // TODO: replace with API call -> DELETE /workouts/:id
    setWorkoutHistory((prev) => prev.filter((w) => w.id !== workoutId));
  };

  useEffect(() => {
    const newAvail: Record<string, string[]> = {};
    FILTER_COLUMNS.forEach(({ key }) => {
      newAvail[key] = Array.from(new Set(workoutHistory.map((w) => String(w[key] ?? ""))))
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b));
    });
    setAvailableFilters(newAvail);
  }, [workoutHistory]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (filterOpen && popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setFilterOpen(null);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [filterOpen]);

  const toggleFilterOpen = (col: string) => setFilterOpen((prev) => (prev === col ? null : col));
  const applyFilter = (col: string, val: string) => {
    setFilters((prev) => ({ ...prev, [col]: val }));
    setFilterOpen(null);
  };
  const clearFilter = (col: string) => {
    setFilters((prev) => {
      const copy = { ...prev };
      delete copy[col];
      return copy;
    });
    setFilterOpen(null);
  };

  const visibleHistory = workoutHistory.filter((entry) =>
    Object.entries(filters).every(([col, val]) => !val || String(entry[col as FilterKey]) === val)
  );

  return (
    <div>
      <h1>Workout Tracker</h1>
      <h3>Exercise: {exerciseName}</h3>

      <form onSubmit={handleFormSubmit}>
        <div className="input-row">
          <div className="input-group">
            <label htmlFor="weight">Weight (lbs):</label>
            <input type="number" id="weight" name="weight" value={formData.weight} onChange={handleInputChange} required />
          </div>
          <div className="input-group">
            <label htmlFor="sets">Set:</label>
            <input type="number" id="sets" name="sets" value={formData.sets} onChange={handleInputChange} required />
          </div>
          <div className="input-group">
            <label htmlFor="reps">Reps:</label>
            <input type="number" id="reps" name="reps" value={formData.reps} onChange={handleInputChange} required />
          </div>
          <div className="input-group">
            <label htmlFor="date">Date:</label>
            <input type="date" id="date" name="date" value={formData.date} onChange={handleInputChange} required />
          </div>
        </div>
        <button type="submit">Add Set</button>
      </form>

      <h2>Workout History</h2>
      <table>
        <thead>
          <tr>
            {FILTER_COLUMNS.map(({ key, label }) => (
              <th className="filter-th" style={{ position: "relative" }} key={key}>
                {label}
                <button className="header-filter-btn" onClick={() => toggleFilterOpen(key)} title={`Filter ${key}`}>
                  ⚙️
                </button>
                {filterOpen === key && (
                  <div className={`filter-popover ${key === "weight" ? "weight-popover" : ""}`} ref={popoverRef}>
                    {availableFilters[key].map((v) => (
                      <button
                        key={v}
                        className={`filter-value ${filters[key] === v ? "selected" : ""}`}
                        onClick={() => applyFilter(key, v)}
                      >
                        {v}
                      </button>
                    ))}
                    <div className="filter-actions">
                      <button onClick={() => clearFilter(key)}>Clear</button>
                    </div>
                  </div>
                )}
              </th>
            ))}
            <th></th>
          </tr>
        </thead>
        <tbody>
          {visibleHistory.map((entry) => (
            <tr key={entry.id}>
              {editingId === entry.id ? (
                <>
                  <td><input className="table-input" type="number" name="weight" value={editForm.weight} onChange={handleEditChange} /></td>
                  <td><input className="table-input" type="number" name="sets" value={editForm.sets} onChange={handleEditChange} /></td>
                  <td><input className="table-input" type="number" name="reps" value={editForm.reps} onChange={handleEditChange} /></td>
                  <td><input className="table-date-input" type="date" name="date" value={editForm.date} onChange={handleEditChange} /></td>
                  <td className="action-cell">
                    <button className="save-btn" onClick={handleSaveEdit} title="Save">💾</button>
                    <button className="cancel-btn" onClick={handleCancelEdit} title="Cancel">✖️</button>
                  </td>
                </>
              ) : (
                <>
                  <td>{entry.weight}</td>
                  <td>{entry.sets}</td>
                  <td>{entry.reps}</td>
                  <td>{entry.date}</td>
                  <td className="action-cell">
                    <button className="edit-btn" onClick={() => handleEditClick(entry)} title="Edit set">✏️</button>
                    <button className="delete-btn" onClick={() => handleDeleteWorkout(entry.id)} title="Delete set">🗑️</button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LogPage;