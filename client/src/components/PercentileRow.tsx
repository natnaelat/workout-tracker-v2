import { useState, useEffect } from "react";
import { fetchPercentile } from "../api/percentile";
import "./PercentileRow.css";

interface PercentileRowProps {
  exerciseId: string;
  type: "strength" | "cardio";
}

const PercentileRow = ({ exerciseId, type }: PercentileRowProps) => {
  const [ageAdjusted, setAgeAdjusted] = useState(true);
  const [bestEver, setBestEver] = useState(true);
  const [percentile, setPercentile] = useState<number | null>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    fetchPercentile(exerciseId, type, bestEver, ageAdjusted)
        .then((result) => {
            console.log("Percentile result:", result);
            if (result.percentile === null) {
            setVisible(false);
            } else {
            setVisible(true);
            setPercentile(result.percentile);
            }
        })
        .catch((err) => {
            console.log("Percentile error:", err);
            setVisible(false);
        });
  }, [exerciseId, type, bestEver, ageAdjusted]);

  if (!visible) return null;

  return (
    <div className="percentile-row">
      <span className="percentile-text">
        {`You are in the top ${100 - percentile!}% of ${type === "strength" ? "lifters" : "runners"}${ageAdjusted ? " at your weight" : ""}`}
        </span>
      <div className="percentile-toggles">
        <div className="unit-toggle">
            <button
                className={ageAdjusted ? "unit-btn active" : "unit-btn"}
                onClick={() => setAgeAdjusted(true)}
            >Weight</button>
            <button
                className={!ageAdjusted ? "unit-btn active" : "unit-btn"}
                onClick={() => setAgeAdjusted(false)}
            >Overall</button>
        </div>
        <div className="unit-toggle">
          <button
            className={bestEver ? "unit-btn active" : "unit-btn"}
            onClick={() => setBestEver(true)}
          >Best Ever</button>
          <button
            className={!bestEver ? "unit-btn active" : "unit-btn"}
            onClick={() => setBestEver(false)}
          >Most Recent</button>
        </div>
      </div>
    </div>
  );
};

export default PercentileRow;