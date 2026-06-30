import { Fragment, useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import "./LogPage.css";
import { fetchSets, createSet, updateSet, deleteSet, type WorkoutSet } from "../api/sets";
import UnitDropdown from "../components/UnitDropdown";
import ProgressChart from "../components/ProgressChart";

type FilterKey = "weight" | "set_number" | "reps" | "performed_on";

const getTodayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const compareSets = (a: WorkoutSet, b: WorkoutSet) => {
  if (a.performed_on !== b.performed_on) {
    return a.performed_on < b.performed_on ? 1 : -1;
  }
  return a.set_number - b.set_number;
};

const LogPage = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const exerciseId = params.get("exerciseId") || "";
  const exerciseName = params.get("exerciseName") || "None";

  const [sets, setSets] = useState<WorkoutSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [displayUnit, setDisplayUnit] = useState<"kg" | "lbs">("lbs");
  const [graphSetNumber, setGraphSetNumber] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    weight: "",
    unit: "lbs" as "kg" | "lbs",
    setNumber: "",
    reps: "",
    date: getTodayStr(),
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    weight: "",
    unit: "lbs" as "kg" | "lbs",
    setNumber: "",
    reps: "",
    date: "",
  });

  const [filters, setFilters] = useState<Record<string, string>>({});
  const [availableFilters, setAvailableFilters] = useState<Record<string, string[]>>({
    weight: [], set_number: [], reps: [], performed_on: [],
  });
  const [filterOpen, setFilterOpen] = useState<string | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!exerciseId) {
      setErrorMsg("No exercise selected");
      setLoading(false);
      return;
    }
    fetchSets(exerciseId)
      .then(setSets)
      .catch(() => setErrorMsg("Failed to load workout history"))
      .finally(() => setLoading(false));
  }, [exerciseId]);

  useEffect(() => {
    if (sets.length === 0) return;
    const setNumbers = Array.from(new Set(sets.map((s) => s.set_number))).sort((a, b) => a - b);
    if (graphSetNumber === null || !setNumbers.includes(graphSetNumber)) {
      setGraphSetNumber(setNumbers[0]);
    }
  }, [sets, graphSetNumber]);

  const getDisplayWeight = (row: WorkoutSet) =>
    displayUnit === "kg" ? row.weight_kg : row.weight_lbs;

  useEffect(() => {
    setAvailableFilters({
      weight: Array.from(new Set(sets.map(getDisplayWeight))).sort((a, b) => Number(a) - Number(b)),
      set_number: Array.from(new Set(sets.map((s) => String(s.set_number)))).sort((a, b) => Number(a) - Number(b)),
      reps: Array.from(new Set(sets.map((s) => String(s.reps)))).sort((a, b) => Number(a) - Number(b)),
      performed_on: Array.from(new Set(sets.map((s) => s.performed_on))).sort(),
    });
  }, [sets, displayUnit]);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newSet = await createSet(exerciseId, {
        weight: parseFloat(formData.weight),
        unit: formData.unit,
        setNumber: parseInt(formData.setNumber, 10),
        reps: parseInt(formData.reps, 10),
        date: formData.date,
      });
      setSets((prev) => [...prev, newSet].sort(compareSets));
      setFormData({ weight: "", unit: formData.unit, setNumber: "", reps: "", date: getTodayStr() });
      setErrorMsg("");
    } catch {
      setErrorMsg("Failed to add set");
    }
  };

  const handleEditClick = (entry: WorkoutSet) => {
    setEditingId(entry.id);
    setEditForm({
      weight: getDisplayWeight(entry),
      unit: displayUnit,
      setNumber: String(entry.set_number),
      reps: String(entry.reps),
      date: entry.performed_on,
    });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    try {
      const updated = await updateSet(editingId, {
        weight: parseFloat(editForm.weight),
        unit: editForm.unit,
        setNumber: parseInt(editForm.setNumber, 10),
        reps: parseInt(editForm.reps, 10),
        date: editForm.date,
      });
      setSets((prev) => prev.map((s) => (s.id === editingId ? updated : s)).sort(compareSets));
      setEditingId(null);
    } catch {
      setErrorMsg("Failed to update set");
    }
  };

  const handleCancelEdit = () => setEditingId(null);

  const handleDeleteSet = async (setId: string) => {
    const confirmed = window.confirm("Delete this workout entry?");
    if (!confirmed) return;
    try {
      await deleteSet(setId);
      setSets((prev) => prev.filter((s) => s.id !== setId));
    } catch {
      setErrorMsg("Failed to delete set");
    }
  };

  const visibleSets = sets.filter((entry) =>
    Object.entries(filters).every(([col, val]) => {
      if (!val) return true;
      if (col === "weight") return getDisplayWeight(entry) === val;
      if (col === "set_number") return String(entry.set_number) === val;
      if (col === "reps") return String(entry.reps) === val;
      if (col === "performed_on") return entry.performed_on === val;
      return true;
    })
  );

  const setNumbersForGraph = Array.from(new Set(sets.map((s) => s.set_number))).sort((a, b) => a - b);
  const graphSets = sets.filter((s) => s.set_number === graphSetNumber);

  const FILTER_COLUMNS: { key: FilterKey; label: string }[] = [
    { key: "weight", label: "Weight" },
    { key: "set_number", label: "Set" },
    { key: "reps", label: "Reps" },
    { key: "performed_on", label: "Date" },
  ];

  if (loading) return <div><p>Loading...</p></div>;

  return (
    <div>
      <h1>Workout Tracker</h1>
      <h3>Exercise: {exerciseName}</h3>

      {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}

      <form onSubmit={handleFormSubmit}>
        <div className="input-row">
          <div className="input-group">
            <label htmlFor="weight">Weight:</label>
            <div className="weight-input-row">
              <input type="number" step="0.01" id="weight" name="weight" value={formData.weight} onChange={handleInputChange} required />
              <UnitDropdown
                value={formData.unit}
                onChange={(unit) => setFormData((prev) => ({ ...prev, unit }))}
              />
            </div>
          </div>
          <div className="input-group">
            <label htmlFor="setNumber">Set:</label>
            <input type="number" id="setNumber" name="setNumber" value={formData.setNumber} onChange={handleInputChange} required />
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

      <div className="set-toggle-wrapper">
        <div className="set-toggle">
          {setNumbersForGraph.map((num) => (
            <button
              key={num}
              className={graphSetNumber === num ? "set-btn active" : "set-btn"}
              onClick={() => setGraphSetNumber(num)}
            >
              Set {num}
            </button>
          ))}
        </div>
        <div className="unit-toggle">
          <button
            className={displayUnit === "lbs" ? "unit-btn active" : "unit-btn"}
            onClick={() => setDisplayUnit("lbs")}
          >
            lbs
          </button>
          <button
            className={displayUnit === "kg" ? "unit-btn active" : "unit-btn"}
            onClick={() => setDisplayUnit("kg")}
          >
            kg
          </button>
        </div>
      </div>

      <ProgressChart sets={graphSets} displayUnit={displayUnit} />

      <table>
        <thead>
          <tr>
            {FILTER_COLUMNS.map(({ key, label }) => (
              <th className="filter-th" style={{ position: "relative" }} key={key}>
                {label}
                <button className="header-filter-btn" onClick={() => toggleFilterOpen(key)} title={`Filter ${key}`}>
                  🔍
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
          {visibleSets.map((entry, idx) => {
            const showGap = idx > 0 && visibleSets[idx - 1].performed_on !== entry.performed_on;
            return (
              <Fragment key={entry.id}>
                {showGap && (
                  <tr className="date-gap-row">
                    <td colSpan={5}>
                      <div className="date-gap-line"></div>
                    </td>
                  </tr>
                )}
                <tr>
                  {editingId === entry.id ? (
                    <>
                      <td>
                        <input className="table-input" type="number" step="0.01" name="weight" value={editForm.weight} onChange={handleEditChange} />
                        <UnitDropdown
                          value={editForm.unit}
                          onChange={(unit) => setEditForm((prev) => ({ ...prev, unit }))}
                        />
                      </td>
                      <td><input className="table-input" type="number" name="setNumber" value={editForm.setNumber} onChange={handleEditChange} /></td>
                      <td><input className="table-input" type="number" name="reps" value={editForm.reps} onChange={handleEditChange} /></td>
                      <td><input className="table-date-input" type="date" name="date" value={editForm.date} onChange={handleEditChange} /></td>
                      <td className="action-cell">
                        <button className="save-btn" onClick={handleSaveEdit} title="Save">💾</button>
                        <button className="cancel-btn" onClick={handleCancelEdit} title="Cancel">✖️</button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{getDisplayWeight(entry)} {displayUnit}</td>
                      <td>{entry.set_number}</td>
                      <td>{entry.reps}</td>
                      <td>{entry.performed_on}</td>
                      <td className="action-cell">
                        <button className="edit-btn" onClick={() => handleEditClick(entry)} title="Edit set">✏️</button>
                        <button className="delete-btn" onClick={() => handleDeleteSet(entry.id)} title="Delete set">🗑️</button>
                      </td>
                    </>
                  )}
                </tr>
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default LogPage;