import { Fragment, useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import "./CardioLogPage.css";
import {
  fetchCardioLogs,
  createCardioLog,
  updateCardioLog,
  deleteCardioLog,
  formatDuration,
  formatPace,
  type CardioLog,
} from "../api/cardioLogs";
import { formatDisplayDate } from "../utils/progress";
import CardioProgressChart from "../components/CardioProgressChart";
import PercentileRow from "../components/PercentileRow";

const getTodayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const compareLogs = (a: CardioLog, b: CardioLog) =>
  a.performed_on < b.performed_on ? 1 : -1;

const CARDIO_PERCENTILE_EXERCISES = ["Outdoor Running", "Treadmill Running"];
const CardioLogPage = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const exerciseId = params.get("exerciseId") || "";
  const exerciseName = params.get("exerciseName") || "None";
  const standardExercise = params.get("standardExercise") || "";

  const [logs, setLogs] = useState<CardioLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [displayUnit, setDisplayUnit] = useState<"mi" | "km">("mi");
  
  const [formData, setFormData] = useState({
    distance: "",
    distance_unit: "mi" as "mi" | "km",
    hours: "",
    minutes: "",
    seconds: "",
    date: getTodayStr(),
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    distance: "",
    distance_unit: "mi" as "mi" | "km",
    hours: "",
    minutes: "",
    seconds: "",
    date: "",
  });

  const [filters, setFilters] = useState<Record<string, string>>({});
  const [availableFilters, setAvailableFilters] = useState<Record<string, string[]>>({
    distance: [], duration: [], pace: [], performed_on: [],
  });
  const [filterOpen, setFilterOpen] = useState<string | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!exerciseId) {
      setErrorMsg("No exercise selected");
      setLoading(false);
      return;
    }
    fetchCardioLogs(exerciseId)
      .then(setLogs)
      .catch(() => setErrorMsg("Failed to load cardio logs"))
      .finally(() => setLoading(false));
  }, [exerciseId]);

  const getDisplayDistance = (log: CardioLog) => {
    if (displayUnit === log.distance_unit) return Number(log.distance).toFixed(2);
    if (displayUnit === "km") return (Number(log.distance) * 1.60934).toFixed(2);
    return (Number(log.distance) / 1.60934).toFixed(2);
  };

  useEffect(() => {
    setAvailableFilters({
      distance: Array.from(new Set(logs.map((l) => `${getDisplayDistance(l)} ${displayUnit}`))).sort(),
      duration: Array.from(new Set(logs.map((l) => formatDuration(l.duration_secs)))).sort(),
      pace: Array.from(new Set(logs.map((l) => formatPace(l.duration_secs, Number(getDisplayDistance(l)), displayUnit)))).sort(),
      performed_on: Array.from(new Set(logs.map((l) => l.performed_on))).sort(),
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

  const secsFromForm = (h: string, m: string, s: string) =>
    (parseInt(h || "0") * 3600) + (parseInt(m || "0") * 60) + parseInt(s || "0");

  const secsToForm = (totalSecs: number) => ({
    hours: String(Math.floor(totalSecs / 3600)),
    minutes: String(Math.floor((totalSecs % 3600) / 60)),
    seconds: String(totalSecs % 60),
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const duration_secs = secsFromForm(formData.hours, formData.minutes, formData.seconds);
    if (duration_secs === 0) {
      setErrorMsg("Please enter a duration");
      return;
    }
    try {
      const newLog = await createCardioLog(exerciseId, {
        distance: parseFloat(formData.distance),
        distance_unit: formData.distance_unit,
        duration_secs,
        date: formData.date,
      });
      setLogs((prev) => [...prev, newLog].sort(compareLogs));
      setFormData({ distance: "", distance_unit: formData.distance_unit, hours: "", minutes: "", seconds: "", date: getTodayStr() });
      setErrorMsg("");
    } catch {
      setErrorMsg("Failed to add cardio log");
    }
  };

  const handleEditClick = (log: CardioLog) => {
    setEditingId(log.id);
    const { hours, minutes, seconds } = secsToForm(log.duration_secs);
    setEditForm({
      distance: getDisplayDistance(log),
      distance_unit: displayUnit,
      hours,
      minutes,
      seconds,
      date: log.performed_on,
    });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    const duration_secs = secsFromForm(editForm.hours, editForm.minutes, editForm.seconds);
    try {
      const updated = await updateCardioLog(editingId, {
        distance: parseFloat(editForm.distance),
        distance_unit: editForm.distance_unit,
        duration_secs,
        date: editForm.date,
      });
      setLogs((prev) => prev.map((l) => (l.id === editingId ? updated : l)).sort(compareLogs));
      setEditingId(null);
    } catch {
      setErrorMsg("Failed to update cardio log");
    }
  };

  const handleCancelEdit = () => setEditingId(null);

  const handleDeleteLog = async (id: string) => {
    const confirmed = window.confirm("Delete this cardio log entry?");
    if (!confirmed) return;
    try {
      await deleteCardioLog(id);
      setLogs((prev) => prev.filter((l) => l.id !== id));
    } catch {
      setErrorMsg("Failed to delete cardio log");
    }
  };

  const FILTER_COLUMNS = [
    { key: "distance", label: "Distance" },
    { key: "duration", label: "Duration" },
    { key: "pace", label: "Pace" },
    { key: "performed_on", label: "Date" },
  ];

  const visibleLogs = logs.filter((log) =>
    Object.entries(filters).every(([col, val]) => {
      if (!val) return true;
      if (col === "distance") return `${getDisplayDistance(log)} ${displayUnit}` === val;
      if (col === "duration") return formatDuration(log.duration_secs) === val;
      if (col === "pace") return formatPace(log.duration_secs, Number(getDisplayDistance(log)), displayUnit) === val;
      if (col === "performed_on") return log.performed_on === val;
      return true;
    })
  );

  if (loading) return <div className="cardiologpage"><p>Loading...</p></div>;

  return (
    <div className="cardiologpage">
      <h1>Workout Tracker</h1>
      <h3>Exercise: {exerciseName}</h3>

      {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}

      <form onSubmit={handleFormSubmit}>
        <div className="input-row">
          <div className="input-group">
            <label>Distance:</label>
            <div className="weight-input-row">
              <input
                type="number"
                step="0.01"
                name="distance"
                value={formData.distance}
                onChange={handleInputChange}
                required
              />
              <div className="unit-toggle">
                <button
                  type="button"
                  className={formData.distance_unit === "mi" ? "unit-btn active" : "unit-btn"}
                  onClick={() => setFormData((prev) => ({ ...prev, distance_unit: "mi" }))}
                >mi</button>
                <button
                  type="button"
                  className={formData.distance_unit === "km" ? "unit-btn active" : "unit-btn"}
                  onClick={() => setFormData((prev) => ({ ...prev, distance_unit: "km" }))}
                >km</button>
              </div>
            </div>
          </div>
          <div className="input-group">
            <label>Duration:</label>
            <div className="duration-inputs">
              <input type="number" name="hours" min="0" placeholder="h" value={formData.hours} onChange={handleInputChange} />
              <span className="duration-sep">h</span>
              <input type="number" name="minutes" min="0" max="59" placeholder="m" value={formData.minutes} onChange={handleInputChange} />
              <span className="duration-sep">m</span>
              <input type="number" name="seconds" min="0" max="59" placeholder="s" value={formData.seconds} onChange={handleInputChange} />
              <span className="duration-sep">s</span>
            </div>
          </div>
          <div className="input-group">
            <label>Date:</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>
        <button type="submit">Add Log</button>
      </form>

      <div className="history-header">
        <h2>Cardio History</h2>
        <div className="unit-toggle">
            <button
            className={displayUnit === "mi" ? "unit-btn active" : "unit-btn"}
            onClick={() => setDisplayUnit("mi")}
            >mi</button>
            <button
            className={displayUnit === "km" ? "unit-btn active" : "unit-btn"}
            onClick={() => setDisplayUnit("km")}
            >km</button>
        </div>
        </div>

        {CARDIO_PERCENTILE_EXERCISES.includes(standardExercise) && (
        <PercentileRow exerciseId={exerciseId} type="cardio" />
        )}

      <CardioProgressChart logs={logs} displayUnit={displayUnit} />

      <table>
        <thead>
          <tr>
            {FILTER_COLUMNS.map(({ key, label }) => (
              <th className="filter-th" key={key}>
                {label}
                <span className="filter-btn-wrapper">
                  <button
                    className="header-filter-btn"
                    onClick={() => toggleFilterOpen(key)}
                    title={`Filter ${key}`}
                  >🔍</button>
                  {filterOpen === key && (
                    <div className="filter-popover" ref={popoverRef}>
                      {availableFilters[key].map((v) => (
                        <button
                          key={v}
                          className={`filter-value ${filters[key] === v ? "selected" : ""}`}
                          onClick={() => applyFilter(key, v)}
                        >{v}</button>
                      ))}
                      <div className="filter-actions">
                        <button onClick={() => clearFilter(key)}>Clear</button>
                      </div>
                    </div>
                  )}
                </span>
              </th>
            ))}
            <th></th>
          </tr>
        </thead>
        <tbody>
          {visibleLogs.map((log, idx) => {
            const showGap = idx > 0 && visibleLogs[idx - 1].performed_on !== log.performed_on;
            return (
              <Fragment key={log.id}>
                {showGap && (
                  <tr className="date-gap-row">
                    <td colSpan={5}><div className="date-gap-line"></div></td>
                  </tr>
                )}
                <tr>
                  {editingId === log.id ? (
                    <>
                      <td>
                        <div className="weight-input-row">
                          <input className="table-input" type="number" step="0.01" name="distance" value={editForm.distance} onChange={handleEditChange} />
                          <div className="unit-toggle">
                            <button type="button" className={editForm.distance_unit === "mi" ? "unit-btn active" : "unit-btn"} onClick={() => setEditForm((prev) => ({ ...prev, distance_unit: "mi" }))}>mi</button>
                            <button type="button" className={editForm.distance_unit === "km" ? "unit-btn active" : "unit-btn"} onClick={() => setEditForm((prev) => ({ ...prev, distance_unit: "km" }))}>km</button>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="duration-inputs">
                          <input className="table-input" type="number" name="hours" min="0" value={editForm.hours} onChange={handleEditChange} />
                          <span className="duration-sep">h</span>
                          <input className="table-input" type="number" name="minutes" min="0" max="59" value={editForm.minutes} onChange={handleEditChange} />
                          <span className="duration-sep">m</span>
                          <input className="table-input" type="number" name="seconds" min="0" max="59" value={editForm.seconds} onChange={handleEditChange} />
                          <span className="duration-sep">s</span>
                        </div>
                      </td>
                      <td>—</td>
                      <td><input className="table-date-input" type="date" name="date" value={editForm.date} onChange={handleEditChange} /></td>
                      <td className="action-cell">
                        <button className="save-btn" onClick={handleSaveEdit} title="Save">💾</button>
                        <button className="cancel-btn" onClick={handleCancelEdit} title="Cancel">✖️</button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{getDisplayDistance(log)} {displayUnit}</td>
                      <td>{formatDuration(log.duration_secs)}</td>
                      <td>{formatPace(log.duration_secs, Number(getDisplayDistance(log)), displayUnit)}</td>
                      <td>{formatDisplayDate(log.performed_on)}</td>
                      <td className="action-cell">
                        <button className="edit-btn" onClick={() => handleEditClick(log)} title="Edit">✏️</button>
                        <button className="delete-btn" onClick={() => handleDeleteLog(log.id)} title="Delete">🗑️</button>
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

export default CardioLogPage;