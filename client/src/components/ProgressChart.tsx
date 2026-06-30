import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  LabelList,
} from "recharts";
import { calculateE1RM, formatShortDate } from "../utils/progress";
import type { WorkoutSet } from "../api/sets";

interface ProgressChartProps {
  sets: WorkoutSet[];
  displayUnit: "kg" | "lbs";
}

const ProgressChart = ({ sets, displayUnit }: ProgressChartProps) => {
  const sorted = [...sets].sort((a, b) =>
    a.performed_on < b.performed_on ? -1 : 1
  );

  const data = sorted.map((entry) => {
    const displayWeight = Number(
      displayUnit === "kg" ? entry.weight_kg : entry.weight_lbs
    );
    return {
      dateLabel: formatShortDate(entry.performed_on),
      detailLabel: `${displayWeight} ${displayUnit} × ${entry.reps}`,
      e1rm: calculateE1RM(Number(entry.weight_kg), entry.reps),
    };
  });

  if (data.length === 0) {
    return <p className="progress-empty">No data yet for this set.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 30, right: 30, left: 30, bottom: 30 }}>
        <XAxis dataKey="dateLabel" hide />
        <YAxis hide domain={["auto", "auto"]} />
        <Line
          type="monotone"
          dataKey="e1rm"
          stroke="#1e90ff"
          strokeWidth={2}
          dot={{ r: 5, fill: "#1e90ff" }}
        >
          <LabelList dataKey="dateLabel" position="top" fill="#ffffff" fontSize={12} />
          <LabelList dataKey="detailLabel" position="bottom" fill="#aaaaaa" fontSize={12} />
        </Line>
      </LineChart>
    </ResponsiveContainer>
  );
};

export default ProgressChart;