import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  LabelList,
  Label,
} from "recharts";
import { calculateE1RM, formatShortDate } from "../utils/progress";
import type { WorkoutSet } from "../api/sets";
import { useState } from "react";

interface ProgressChartProps {
  sets: WorkoutSet[];
  displayUnit: "kg" | "lbs";
}

const CHART_HEIGHT = 320;
const LABEL_OFFSET = 18; // px gap between dot center and label

interface ChartDataPoint {
  dateLabel: string;
  detailLabel: string;
  e1rm: number;
}

interface CustomLabelProps {
  x?: number;
  y?: number;
  value?: string;
  index?: number;
  data: ChartDataPoint[];
}

const CustomDetailLabel = ({ x, y, value, index, data }: CustomLabelProps) => {
  if (x === undefined || y === undefined || value === undefined || index === undefined) return null;
  if (index >= data.length || !data[index]) return null;

  const current = data[index].e1rm;
  const next = index < data.length - 1 ? data[index + 1].e1rm : null;
  const prev = index > 0 ? data[index - 1].e1rm : null;

  // Decide whether to go above or below
  // Go below if the line is heading upward after this point
  // Go above if the line is heading downward, or this is the last point going down
  let goBelow = false;

  if (next !== null) {
    goBelow = next > current; // line goes up after this point → label below
  } else if (prev !== null) {
    goBelow = current > prev; // last point: if we arrived going up → label below
  }

  const isFirstPoint = index === 0;
  const isLastPoint = index === data.length - 1;
  const isSinglePoint = data.length === 1;

  const labelY = isSinglePoint
    ? y + LABEL_OFFSET + 6
    : isFirstPoint
    ? y + LABEL_OFFSET - 6
    : goBelow ? y + LABEL_OFFSET : y - LABEL_OFFSET;

  const labelX = isSinglePoint ? x : isLastPoint ? x + 10 : x;
  const dominantBaseline = goBelow ? "hanging" : "auto";

  return (
    <text
      x={labelX}
      y={labelY}
      textAnchor="middle"
      dominantBaseline={dominantBaseline}
      fill="#333"
      fontSize={11}
    >
      {value}
    </text>
  );
};

const ProgressChart = ({ sets, displayUnit }: ProgressChartProps) => {
  // 1. useState FIRST, before anything else
  const [showInfo, setShowInfo] = useState(false);

  // 2. then your data prep
  const sorted = [...sets].sort((a, b) =>
    a.performed_on < b.performed_on ? -1 : 1
  );

  const data: ChartDataPoint[] = sorted.map((entry) => {
    const displayWeight = Number(
      displayUnit === "kg" ? entry.weight_kg : entry.weight_lbs
    );
    return {
      dateLabel: formatShortDate(entry.performed_on),
      detailLabel: `${displayWeight} ${displayUnit} × ${entry.reps}`,
      e1rm: calculateE1RM(Number(entry.weight_kg), entry.reps),
    };
  });

  // 3. THEN the early return checks
  if (data.length === 0) {
    return <p className="progress-empty">No data yet for this set.</p>;
  }

  return (
    <div className="progress-chart-wrapper">
      <button
        className="strength-info-btn"
        onClick={() => setShowInfo((prev) => !prev)}
        title="What is Strength Score?"
      >
        ⓘ
      </button>
      {showInfo && (
        <div className="strength-info-popover">
          <button
            className="strength-info-close"
            onClick={() => setShowInfo(false)}
          >
            ✕
          </button>
          <p>
            <strong>Strength Score</strong> is an estimated measure of your
            overall strength for this set, calculated using the Epley formula:
          </p>
          <p className="strength-info-formula">
            Score = Weight × (1 + Reps ÷ 30)
          </p>
          <p>
            It combines both weight and reps into a single number so the graph
            can show your true progress — even when you lift heavier for fewer
            reps one session, or lighter for more reps another. A rising score
            means you're getting stronger.
          </p>
        </div>
      )}
      <div className="progress-chart-card">
        <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
          <LineChart data={data} margin={{ top: 30, right: 30, left: 20, bottom: 30 }}>
            <CartesianGrid stroke="#ddd" strokeDasharray="3 3" />
            <XAxis
              dataKey="dateLabel"
              stroke="#333"
              tick={{ fill: "#333", fontSize: 12 }}
              padding={{ left: 40, right: 30 }}
            >
              <Label value="Date" position="bottom" offset={0} fill="#333" />
            </XAxis>
            <YAxis stroke="#333" tick={{ fill: "#333", fontSize: 12 }} domain={["auto", "auto"]}>
              <Label
                value="Strength Score"
                angle={-90}
                position="insideLeft"
                style={{ textAnchor: "middle" }}
                fill="#333"
              />
            </YAxis>
            <Line
              type="monotone"
              dataKey="e1rm"
              stroke="#1e90ff"
              strokeWidth={2}
              dot={{ r: 5, fill: "#1e90ff" }}
            >
              <LabelList
                dataKey="detailLabel"
                content={(props) => (
                  <CustomDetailLabel
                    {...(props as CustomLabelProps)}
                    data={data}
                  />
                )}
              />
            </Line>
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ProgressChart;