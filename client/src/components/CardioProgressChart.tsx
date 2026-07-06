import { useState } from "react";
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
import type { CardioLog } from "../api/cardioLogs";
import { formatPace } from "../api/cardioLogs";

interface CardioProgressChartProps {
  logs: CardioLog[];
  displayUnit: "mi" | "km";
}

const CHART_HEIGHT = 320;
const LABEL_OFFSET = 18;

interface ChartDataPoint {
  dateLabel: string;
  paceLabel: string;
  paceSecsPerUnit: number;
}

interface CustomLabelProps {
  x?: number;
  y?: number;
  value?: string;
  index?: number;
  data: ChartDataPoint[];
}

const CustomPaceLabel = ({ x, y, value, index, data }: CustomLabelProps) => {
  if (x === undefined || y === undefined || value === undefined || index === undefined) return null;
  if (index >= data.length || !data[index]) return null;

  const current = data[index].paceSecsPerUnit;
  const next = index < data.length - 1 ? data[index + 1].paceSecsPerUnit : null;
  const prev = index > 0 ? data[index - 1].paceSecsPerUnit : null;

  // Lower pace = faster = better, line goes DOWN as you improve
  // Go below if line is heading downward (improving) after this point
  let goBelow = false;
  if (next !== null) {
    goBelow = next < current;
  } else if (prev !== null) {
    goBelow = current < prev;
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

const CardioProgressChart = ({ logs, displayUnit }: CardioProgressChartProps) => {
  const [showInfo, setShowInfo] = useState(false);

  const sorted = [...logs].sort((a, b) =>
    a.performed_on < b.performed_on ? -1 : 1
  );

  const data: ChartDataPoint[] = sorted.map((entry) => {
    const distanceInUnit =
      displayUnit === entry.distance_unit
        ? Number(entry.distance)
        : displayUnit === "km"
        ? Number(entry.distance) * 1.60934
        : Number(entry.distance) / 1.60934;

    const paceSecsPerUnit = entry.duration_secs / distanceInUnit;
    const paceLabel = formatPace(entry.duration_secs, distanceInUnit, displayUnit);

    return {
      dateLabel: formatShortDate(entry.performed_on),
      paceLabel,
      paceSecsPerUnit,
    };
  });

  if (data.length === 0) {
    return <p className="progress-empty">No cardio logs yet — add your first entry above.</p>;
  }

  // Format y-axis ticks as mm:ss
  const formatYAxis = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.round(secs % 60);
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  return (
    <div className="progress-chart-wrapper">
      {showInfo && (
        <div className="strength-info-popover">
          <button className="strength-info-close" onClick={() => setShowInfo(false)}>✕</button>
          <p><strong>Pace</strong> shows how long it takes you to cover one {displayUnit}.</p>
          <p className="strength-info-formula">Pace = Duration ÷ Distance</p>
          <p>A <strong>lower</strong> pace means you ran faster. A downward trend on the graph means you're improving.</p>
        </div>
      )}
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
            <YAxis
              stroke="#333"
              tick={{ fill: "#333", fontSize: 12 }}
              domain={["auto", "auto"]}
              tickFormatter={formatYAxis}
              reversed
            >
              <Label
                value={`Pace (/${displayUnit})`}
                angle={-90}
                position="insideLeft"
                style={{ textAnchor: "middle" }}
                fill="#333"
              />
            </YAxis>
            <Line
              type="monotone"
              dataKey="paceSecsPerUnit"
              stroke="#1e90ff"
              strokeWidth={2}
              dot={{ r: 5, fill: "#1e90ff" }}
            >
              <LabelList
                dataKey="paceLabel"
                content={(props) => (
                  <CustomPaceLabel
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

export default CardioProgressChart;