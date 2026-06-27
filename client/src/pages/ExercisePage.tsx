import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ExercisePage.css";

interface Exercise {
  id: string;
  name: string;
}

// TODO: replace with data fetched from the API once the backend exists
const initialExercises: Exercise[] = [
  { id: "1", name: "Bench Press" },
  { id: "2", name: "Squat" },
  { id: "3", name: "Deadlift" },
];

const ExercisePage = () => {
  const [exerciseName, setExerciseName] = useState("");
  const [exerciseList, setExerciseList] = useState<Exercise[]>(initialExercises);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (exerciseName.trim()) {
      // TODO: replace with API call -> POST /exercises
      const newExercise: Exercise = { id: crypto.randomUUID(), name: exerciseName };
      setExerciseList((prev) => [...prev, newExercise]);
      setExerciseName("");
    }
  };

  const handleDeleteExercise = (exerciseId: string, name: string) => {
    const confirmed = window.confirm(`Delete exercise "${name}" and all associated workouts?`);
    if (!confirmed) return;
    // TODO: replace with API call -> DELETE /exercises/:id
    setExerciseList((prev) => prev.filter((e) => e.id !== exerciseId));
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const handleRowClick = (name: string) => {
    navigate(`/log?exercise=${encodeURIComponent(name)}`);
  };

  const filteredExercises = exerciseList.filter((exercise) =>
    exercise.name.toLowerCase().includes(searchTerm)
  );

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
            <tr key={exercise.id}>
              <td className="exercise-cell">
                <span className="exercise-name" onClick={() => handleRowClick(exercise.name)}>
                  {exercise.name}
                </span>
                <button
                  className="delete-btn"
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