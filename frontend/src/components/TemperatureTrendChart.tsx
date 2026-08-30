import {
  Line,
  LineChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { ForecastPoint } from "../types/weather";

interface TemperatureTrendChartProps {
  cityName: string;
  data: ForecastPoint[];
}

function formatTime(timestamp: number) {
  return new Date(timestamp * 1000).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TemperatureTrendChart({
  cityName,
  data,
}: TemperatureTrendChartProps) {
  const chartData = data.map((point) => ({
    time: formatTime(point.timestamp),
    temperature: Number(point.temperature.toFixed(1)),
    description: point.description,
  }));

  return (
    <section className="trend-chart-card">
      <div className="trend-chart-header">
        <div>
          <p className="trend-chart-eyebrow">24-hour forecast</p>
          <h2>{cityName} Temperature Trend</h2>
        </div>
      </div>

      <div className="trend-chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{
              top: 10,
              right: 20,
              left: 0,
              bottom: 5,
            }}
          >
            <CartesianGrid
              strokeDasharray="4 4"
              stroke="var(--border)"
            />

            <XAxis
              dataKey="time"
              tick={{
                fill: "var(--text-secondary)",
                fontSize: 12,
              }}
              axisLine={{
                stroke: "var(--border)",
              }}
              tickLine={false}
            />

            <YAxis
              unit="°C"
              tick={{
                fill: "var(--text-secondary)",
                fontSize: 12,
              }}
              axisLine={false}
              tickLine={false}
            />

            <Tooltip
              contentStyle={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "10px",
                color: "var(--text-primary)",
              }}
              formatter={(value) => [
                `${Number(value).toFixed(1)}°C`,
                "Temperature",
              ]}
            />

            <Line
              type="monotone"
              dataKey="temperature"
              stroke="var(--accent)"
              strokeWidth={3}
              dot={{
                r: 4,
                fill: "var(--accent)",
              }}
              activeDot={{
                r: 6,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}