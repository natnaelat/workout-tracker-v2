import { Fragment, useState, useEffect, useRef } from "react";
import "./WeightPage.css";
import {
  fetchWeightLogs,
  createWeightLog,
  updateWeightLog,
  deleteWeightLog,
  type WeightLog,
} from "../api/bodyweight";
import UnitDropdown from "../components/UnitDropdown";
import WeightChart from "../components/WeightChart";
import { formatDisplayDate } from "../utils/progress";

const getTodayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const compareLogs = (a: WeightLog, b: WeightLog) =>
  a.logged_on < b.logged_on ? 1 : -1;

const WeightPage = () => {
  const [logs, setLogs] = useState<WeightLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [displayUnit, setDisplayUnit] = useState<"kg" | "lbs">("lbs");

  const [formData, setFormData] = useState({
    weight: "",
    unit: "lbs" as "kg" | "lbs",
    date: getTodayStr(),
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    weight: "",
    unit: "lbs" as "kg" | "lbs",
    date: "",
  });

  const [filters, setFilters] = useState<Record<string, string>>({});
  const [availableFilters, setAvailableFilters] = useState<Record<string, string[]>>({
    weight: [], logged_on: [],
  });
  const [filterOpen, setFilterOpen] = useState<string | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchWeightLogs()
      .then(setLogs)
      .catch(() => setErrorMsg("Failed to load weight logs"))
      .finally(() => setLoading(false));
  }, []);

  const getDisplayWeight = (row: WeightLog) =>
    displayUnit === "kg" ? row.weight_kg : row.weight_lbs;

  useEffect(() => {
    setAvailableFilters({
      weight: Array.from(new Set(logs.map(getDisplayWeight))).sort((a, b) => Number(a) - Number(b)),
      logged_on: Array.from(new Set(logs.map((l) => l.logged_on))).sort(),
    });
  }, [logs, displayUnit]);

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
      const newLog = await createWeightLog({
        weight: parseFloat(formData.weight),
        unit: formData.unit,
        date: formData.date,
      });
      setLogs((prev) => [...prev, newLog].sort(compareLogs));
      setFormData({ weight: "", unit: formData.unit, date: getTodayStr() });
      setErrorMsg("");
    } catch {
      setErrorMsg("Failed to add weight log");
    }
  };

  const handleEditClick = (entry: WeightLog) => {
    setEditingId(entry.id);
    setEditForm({
      weight: getDisplayWeight(entry),
      unit: displayUnit,
      date: entry.logged_on,
    });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    try {
      const updated = await updateWeightLog(editingId, {
        weight: parseFloat(editForm.weight),
        unit: editForm.unit,
        date: editForm.date,
      });
      setLogs((prev) => prev.map((l) => (l.id === editingId ? updated : l)).sort(compareLogs));
      setEditingId(null);
    } catch {
      setErrorMsg("Failed to update weight log");
    }
  };

  const handleCancelEdit = () => setEditingId(null);

  const handleDeleteLog = async (id: string) => {
    const confirmed = window.confirm("Delete this weight entry?");
    if (!confirmed) return;
    try {
      await deleteWeightLog(id);
      setLogs((prev) => prev.filter((l) => l.id !== id));
    } catch {
      setErrorMsg("Failed to delete weight log");
    }
  };

  const FILTER_COLUMNS = [
    { key: "weight", label: "Weight" },
    { key: "logged_on", label: "Date" },
  ];

  const visibleLogs = logs.filter((entry) =>
    Object.entries(filters).every(([col, val]) => {
      if (!val) return true;
      if (col === "weight") return getDisplayWeight(entry) === val;
      if (col === "logged_on") return entry.logged_on === val;
      return true;
    })
  );

  if (loading) return <div><p>Loading...</p></div>;

  return (
    <div className="weightpage">
      <h1>Weight Tracker</h1>

      {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}

      <form onSubmit={handleFormSubmit}>
        <div className="input-row">
          <div className="input-group">
            <label htmlFor="weight">Weight:</label>
            <div className="weight-input-row">
              <input
                type="number"
                step="0.01"
                id="weight"
                name="weight"
                value={formData.weight}
                onChange={handleInputChange}
                required
              />
              <UnitDropdown
                value={formData.unit}
                onChange={(unit) => setFormData((prev) => ({ ...prev, unit }))}
              />
            </div>
          </div>
          <div className="input-group">
            <label htmlFor="date">Date:</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>
        <button type="submit">Add Weight</button>
      </form>

      <div className="history-header">
        <h2>Weight History</h2>
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

      <div className="progress-chart-wrapper">
        <WeightChart logs={logs} displayUnit={displayUnit} />
      </div>

      <table>
        <thead>
          <tr>
            {FILTER_COLUMNS.map(({ key, label }) => (
              <th className="filter-th" style={{ position: "relative" }} key={key}>
                {label}
                <button
                  className="header-filter-btn"
                  onClick={() => toggleFilterOpen(key)}
                  title={`Filter ${key}`}
                >
                  🔍
                </button>
                {filterOpen === key && (
                  <div className="filter-popover" ref={popoverRef}>
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
          {visibleLogs.map((entry, idx) => {
            const showGap = idx > 0 && visibleLogs[idx - 1].logged_on !== entry.logged_on;
            return (
              <Fragment key={entry.id}>
                {showGap && (
                  <tr className="date-gap-row">
                    <td colSpan={3}>
                      <div className="date-gap-line"></div>
                    </td>
                  </tr>
                )}
                <tr>
                  {editingId === entry.id ? (
                    <>
                      <td>
                        <input
                          className="table-input"
                          type="number"
                          step="0.01"
                          name="weight"
                          value={editForm.weight}
                          onChange={handleEditChange}
                        />
                        <UnitDropdown
                          value={editForm.unit}
                          onChange={(unit) => setEditForm((prev) => ({ ...prev, unit }))}
                        />
                      </td>
                      <td>
                        <input
                          className="table-date-input"
                          type="date"
                          name="date"
                          value={editForm.date}
                          onChange={handleEditChange}
                        />
                      </td>
                      <td className="action-cell">
                        <button className="save-btn" onClick={handleSaveEdit} title="Save">💾</button>
                        <button className="cancel-btn" onClick={handleCancelEdit} title="Cancel">✖️</button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{getDisplayWeight(entry)} {displayUnit}</td>
                      <td>{formatDisplayDate(entry.logged_on)}</td>
                      <td className="action-cell">
                        <button className="edit-btn" onClick={() => handleEditClick(entry)} title="Edit">✏️</button>
                        <button className="delete-btn" onClick={() => handleDeleteLog(entry.id)} title="Delete">🗑️</button>
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

export default WeightPage;