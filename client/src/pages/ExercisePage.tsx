import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./ExercisePage.css";
import {
  fetchExercises,
  createExercise,
  deleteExercise,
  type Exercise,
} from "../api/exercises";
import {
  STRENGTH_EXERCISES,
  CARDIO_EXERCISES,
  EQUIPMENT_OPTIONS,
} from "../data/exercises";

const ExercisePage = () => {
  const [exerciseList, setExerciseList] = useState<Exercise[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  // Form state
  const [customName, setCustomName] = useState("");
  const [category, setCategory] = useState<"strength" | "cardio">("strength");
  const [standardExercise, setStandardExercise] = useState<string>("");
  const [equipment, setEquipment] = useState<string>("");

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    category: "strength" as "strength" | "cardio",
    standard_exercise: "",
    equipment: "",
  });

  // Filter state
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [filterOpen, setFilterOpen] = useState<string | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchExercises()
      .then(setExerciseList)
      .catch(() => setErrorMsg("Failed to load exercises"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setStandardExercise("");
    setEquipment("");
  }, [category]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (filterOpen && popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setFilterOpen(null);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [filterOpen]);

  const toggleFilterOpen = (col: string) =>
    setFilterOpen((prev) => (prev === col ? null : col));

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

  const getAvailableFilters = (col: string) => {
    return Array.from(
      new Set(
        exerciseList.map((e) => {
          if (col === "name") return e.name;
          if (col === "category") return e.category === "strength" ? "Strength" : "Cardio";
          if (col === "standard_exercise") return e.standard_exercise ?? "—";
          if (col === "equipment") return e.equipment ?? "—";
          return "";
        })
      )
    )
      .filter(Boolean)
      .sort();
  };

  const exerciseOptions =
    category === "strength" ? STRENGTH_EXERCISES : CARDIO_EXERCISES;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;
    if (!standardExercise) {
      setErrorMsg("Please select an exercise");
      return;
    }
    if (category === "strength" && !equipment) {
      setErrorMsg("Please select equipment");
      return;
    }

    try {
      const newExercise = await createExercise({
        name: customName.trim(),
        category,
        standard_exercise: standardExercise,
        equipment: category === "strength" ? equipment : null,
      });
      setExerciseList((prev) => [...prev, newExercise]);
      setCustomName("");
      setStandardExercise("");
      setEquipment("");
      setErrorMsg("");
    } catch (err) {
      if (err instanceof Error && err.message === "DUPLICATE") {
        setErrorMsg(`You already have an exercise named "${customName.trim()}"`);
      } else {
        setErrorMsg("Failed to add exercise");
      }
    }
  };

  const handleDeleteExercise = async (exerciseId: string, name: string) => {
    const confirmed = window.confirm(
      `Delete exercise "${name}" and all associated workouts?`
    );
    if (!confirmed) return;
    try {
      await deleteExercise(exerciseId);
      setExerciseList((prev) => prev.filter((e) => e.id !== exerciseId));
    } catch {
      setErrorMsg("Failed to delete exercise");
    }
  };

  const handleEditClick = (exercise: Exercise) => {
    setEditingId(exercise.id);
    setEditForm({
      name: exercise.name,
      category: exercise.category,
      standard_exercise: exercise.standard_exercise ?? "",
      equipment: exercise.equipment ?? "",
    });
  };

  const handleCancelEdit = () => setEditingId(null);

  const handleSaveEdit = async () => {
    if (!editingId) return;
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/exercises/${editingId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: editForm.name,
            category: editForm.category,
            standard_exercise: editForm.standard_exercise || null,
            equipment:
              editForm.category === "strength"
                ? editForm.equipment || null
                : null,
          }),
        }
      );
      if (!res.ok) throw new Error("Failed to update");
      const updated = await res.json();
      setExerciseList((prev) =>
        prev.map((e) => (e.id === editingId ? updated : e))
      );
      setEditingId(null);
    } catch {
      setErrorMsg("Failed to update exercise");
    }
  };

  const handleRowClick = (exercise: Exercise) => {
    if (editingId) return;
    if (exercise.category === "cardio") {
      navigate(
        `/cardio-log?exerciseId=${exercise.id}&exerciseName=${encodeURIComponent(exercise.name)}`
      );
    } else {
      navigate(
        `/log?exerciseId=${exercise.id}&exerciseName=${encodeURIComponent(exercise.name)}&category=${exercise.category}&standardExercise=${encodeURIComponent(exercise.standard_exercise ?? "")}`
      );
    }
  };

  const FILTER_COLUMNS = [
    { key: "name", label: "Exercise Name" },
    { key: "category", label: "Category" },
    { key: "standard_exercise", label: "Type" },
    { key: "equipment", label: "Equipment" },
  ];

  const filteredExercises = exerciseList.filter((exercise) => {
    const matchesSearch = exercise.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilters = Object.entries(filters).every(([col, val]) => {
      if (!val) return true;
      if (col === "name") return exercise.name === val;
      if (col === "category")
        return (exercise.category === "strength" ? "Strength" : "Cardio") === val;
      if (col === "standard_exercise")
        return (exercise.standard_exercise ?? "—") === val;
      if (col === "equipment") return (exercise.equipment ?? "—") === val;
      return true;
    });
    return matchesSearch && matchesFilters;
  });

  if (loading)
    return (
      <div className="exercise-page">
        <p>Loading...</p>
      </div>
    );

  return (
    <div className="exercise-page">
      <h1>Exercise Manager</h1>

      <form onSubmit={handleSubmit}>
        <div className="input-row">
          <div className="input-group">
            <label htmlFor="customName">Exercise Name</label>
            <input
              type="text"
              id="customName"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="e.g. Monday Bench"
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              value={category}
              onChange={(e) =>
                setCategory(e.target.value as "strength" | "cardio")
              }
            >
              <option value="strength">Strength Training</option>
              <option value="cardio">Cardio</option>
            </select>
          </div>

          <div className="input-group">
            <label htmlFor="standardExercise">Exercise Type</label>
            <select
              id="standardExercise"
              value={standardExercise}
              onChange={(e) => setStandardExercise(e.target.value)}
              required
            >
              <option value="">-- Select exercise --</option>
              {exerciseOptions.map((ex) => (
                <option key={ex} value={ex}>
                  {ex}
                </option>
              ))}
            </select>
          </div>

          {category === "strength" && (
            <div className="input-group">
              <label htmlFor="equipment">Equipment</label>
              <select
                id="equipment"
                value={equipment}
                onChange={(e) => setEquipment(e.target.value)}
                required
              >
                <option value="">-- Select equipment --</option>
                {EQUIPMENT_OPTIONS.map((eq) => (
                  <option key={eq} value={eq}>
                    {eq}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <button type="submit">Add Exercise</button>
      </form>

      {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}

      <input
        type="text"
        id="searchBar"
        placeholder="Search exercises..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <h2>Exercise List</h2>

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
                  >
                    🔍
                  </button>
                  {filterOpen === key && (
                    <div className="filter-popover" ref={popoverRef}>
                      {getAvailableFilters(key).map((v) => (
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
                </span>
              </th>
            ))}
            <th></th>
          </tr>
        </thead>
        <tbody>
          {filteredExercises.map((exercise) => (
            <tr key={exercise.id} onClick={() => handleRowClick(exercise)}>
              {editingId === exercise.id ? (
                <>
                  <td>
                    <input
                      className="table-input"
                      type="text"
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                    />
                  </td>
                  <td>
                    <select
                      value={editForm.category}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          category: e.target.value as "strength" | "cardio",
                          standard_exercise: "",
                          equipment: "",
                        }))
                      }
                    >
                      <option value="strength">Strength</option>
                      <option value="cardio">Cardio</option>
                    </select>
                  </td>
                  <td>
                    <select
                      value={editForm.standard_exercise}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          standard_exercise: e.target.value,
                        }))
                      }
                    >
                      <option value="">-- Select --</option>
                      {(editForm.category === "strength"
                        ? STRENGTH_EXERCISES
                        : CARDIO_EXERCISES
                      ).map((ex) => (
                        <option key={ex} value={ex}>
                          {ex}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    {editForm.category === "strength" ? (
                      <select
                        value={editForm.equipment}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            equipment: e.target.value,
                          }))
                        }
                      >
                        <option value="">-- Select --</option>
                        {EQUIPMENT_OPTIONS.map((eq) => (
                          <option key={eq} value={eq}>
                            {eq}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span>—</span>
                    )}
                  </td>
                  <td className="action-cell">
                    <button
                      className="save-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSaveEdit();
                      }}
                      title="Save"
                    >
                      💾
                    </button>
                    <button
                      className="cancel-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCancelEdit();
                      }}
                      title="Cancel"
                    >
                      ✖️
                    </button>
                  </td>
                </>
              ) : (
                <>
                  <td>{exercise.name}</td>
                  <td>
                    {exercise.category === "strength" ? "Strength" : "Cardio"}
                  </td>
                  <td>{exercise.standard_exercise ?? "—"}</td>
                  <td>{exercise.equipment ?? "—"}</td>
                  <td className="action-cell">
                    <button
                      className="save-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditClick(exercise);
                      }}
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      className="cancel-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteExercise(exercise.id, exercise.name);
                      }}
                      onMouseEnter={(e) =>
                        e.currentTarget.closest("tr")?.classList.add("no-row-hover")
                      }
                      onMouseLeave={(e) =>
                        e.currentTarget.closest("tr")?.classList.remove("no-row-hover")
                      }
                      title={`Delete ${exercise.name}`}
                    >
                      🗑️
                    </button>
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

export default ExercisePage;