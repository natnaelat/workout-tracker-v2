import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ExercisePage.css";
import { fetchExercises, createExercise, deleteExercise, type Exercise } from "../api/exercises";

const ExercisePage = () => {
  const [exerciseName, setExerciseName] = useState("");
  const [exerciseList, setExerciseList] = useState<Exercise[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchExercises()
      .then(setExerciseList)
      .catch(() => setErrorMsg("Failed to load exercises"))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!exerciseName.trim()) return;

    try {
      const newExercise = await createExercise(exerciseName.trim());
      setExerciseList((prev) => [...prev, newExercise]);
      setExerciseName("");
      setErrorMsg("");
    } catch (err) {
      if (err instanceof Error && err.message === "DUPLICATE") {
        setErrorMsg(`You already have an exercise named "${exerciseName.trim()}"`);
      } else {
        setErrorMsg("Failed to add exercise");
      }
    }
  };

  const handleDeleteExercise = async (exerciseId: string, name: string) => {
    const confirmed = window.confirm(`Delete exercise "${name}" and all associated workouts?`);
    if (!confirmed) return;

    try {
      await deleteExercise(exerciseId);
      setExerciseList((prev) => prev.filter((e) => e.id !== exerciseId));
    } catch {
      setErrorMsg("Failed to delete exercise");
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const handleRowClick = (exercise: Exercise) => {
    navigate(`/log?exerciseId=${exercise.id}&exerciseName=${encodeURIComponent(exercise.name)}`);
  };

  const filteredExercises = exerciseList.filter((exercise) =>
    exercise.name.toLowerCase().includes(searchTerm)
  );

  if (loading) return <div className="exercise-page"><p>Loading...</p></div>;

  return (
    <div className="exercise-page">
      <h1>Exercise Manager</h1>

      <form onSubmit={handleSubmit}>
        <label htmlFor="exercise">Add Exercise</label>
        <input
          type="text"
          id="exercise"
          name="exercise"
          value={exerciseName}
          onChange={(e) => setExerciseName(e.target.value)}
          required
        />
        <button type="submit">Add Exercise</button>
      </form>

      {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}

      <input
        type="text"
        id="searchBar"
        placeholder="Search exercises..."
        value={searchTerm}
        onChange={handleSearch}
      />

      <h2>Exercise List</h2>

      <table>
        <thead>
          <tr>
            <th>Exercise Name</th>
          </tr>
        </thead>
        <tbody>
          {filteredExercises.map((exercise) => (
            <tr key={exercise.id} onClick={() => handleRowClick(exercise)}>
              <td className="exercise-cell">
                <span className="exercise-name">
                  {exercise.name}
                </span>
                <button
                  className="exercise-delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteExercise(exercise.id, exercise.name);
                  }}
                  onMouseEnter={(e) => e.currentTarget.closest("tr")?.classList.add("no-row-hover")}
                  onMouseLeave={(e) => e.currentTarget.closest("tr")?.classList.remove("no-row-hover")}
                  title={`Delete ${exercise.name}`}
                >
                  🗑️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExercisePage;