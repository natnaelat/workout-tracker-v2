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
import { formatShortDate } from "../utils/progress";
import type { WeightLog } from "../api/bodyweight";

interface WeightChartProps {
  logs: WeightLog[];
  displayUnit: "kg" | "lbs";
}

const CHART_HEIGHT = 320;
const LABEL_OFFSET = 18;

interface ChartDataPoint {
  dateLabel: string;
  detailLabel: string;
  weight: number;
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

  const current = data[index].weight;
  const next = index < data.length - 1 ? data[index + 1].weight : null;
  const prev = index > 0 ? data[index - 1].weight : null;

  let goBelow = false;
  if (next !== null) {
    goBelow = next > current;
  } else if (prev !== null) {
    goBelow = current > prev;
  }

  const isFirstPoint = index === 0;
  const isLastPoint = index === data.length - 1;
  const isSinglePoint = data.length === 1;

  const labelY = isSinglePoint
    ? y + LABEL_OFFSET + 6
    : isFirstPoint
    ? y + LABEL_OFFSET - 6
    : goBelow ? y + LABEL_OFFSET : y - LABEL_OFFSET;

  const labelX = isSinglePoint ? x : isLastPoint ? x + 6 : x;

  return (
    <text
      x={labelX}
      y={labelY}
      textAnchor="middle"
      dominantBaseline={goBelow ? "hanging" : "auto"}
      fill="#333"
      fontSize={11}
    >
      {value}
    </text>
  );
};

const WeightChart = ({ logs, displayUnit }: WeightChartProps) => {
  const sorted = [...logs].sort((a, b) =>
    a.logged_on < b.logged_on ? -1 : 1
  );

  const data: ChartDataPoint[] = sorted.map((entry) => {
    const weight = Number(displayUnit === "kg" ? entry.weight_kg : entry.weight_lbs);
    return {
      dateLabel: formatShortDate(entry.logged_on),
      detailLabel: `${weight} ${displayUnit}`,
      weight,
    };
  });

  if (data.length === 0) {
    return <p className="progress-empty">No weight logs yet — add your first entry above.</p>;
  }

  return (
    <div className="progress-chart-card">
      <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
        <LineChart data={data} margin={{ top: 30, right: 60, left: 40, bottom: 30 }}>
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
              value={`Weight (${displayUnit})`}
              angle={-90}
              position="insideLeft"
              style={{ textAnchor: "middle" }}
              fill="#333"
            />
          </YAxis>
          <Line
            type="monotone"
            dataKey="weight"
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
  );
};

export default WeightChart;