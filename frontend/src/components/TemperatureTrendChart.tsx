import {
  AreaChart,
  Area,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { motion } from "framer-motion";
import { TrendingUp, Clock, Thermometer } from "lucide-react";
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

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: {
      time: string;
      temperature: number;
      description: string;
    };
  }>;
  label?: string;
}

function CustomChartTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div className="custom-chart-tooltip">
        <div className="tooltip-time">
          <Clock size={12} />
          <span>{item.time}</span>
        </div>
        <div className="tooltip-temp">
          <Thermometer size={14} />
          <strong>{item.temperature.toFixed(1)}°C</strong>
        </div>
        {item.description && (
          <div className="tooltip-desc">{item.description}</div>
        )}
      </div>
    );
  }
  return null;
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

  // Find min and max for clean Y-axis padding
  const temps = chartData.map((d) => d.temperature);
  const minTemp = Math.floor(Math.min(...temps) - 2);
  const maxTemp = Math.ceil(Math.max(...temps) + 2);

  return (
    <motion.section
      className="trend-chart-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="trend-chart-header">
        <div className="trend-chart-title-group">
          <div className="trend-chart-badge">
            <TrendingUp size={14} />
            <span>24-Hour Horizon</span>
          </div>
          <h2>{cityName} Temperature Trend</h2>
        </div>
        <div className="trend-chart-summary">
          <span className="summary-pill">
            Min: <strong>{Math.min(...temps).toFixed(1)}°C</strong>
          </span>
          <span className="summary-pill">
            Max: <strong>{Math.max(...temps).toFixed(1)}°C</strong>
          </span>
        </div>
      </div>

      <div className="trend-chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{
              top: 20,
              right: 15,
              left: -15,
              bottom: 5,
            }}
          >
            <defs>
              <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="var(--accent)" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="4 4"
              stroke="var(--border)"
              vertical={false}
            />

            <XAxis
              dataKey="time"
              tick={{
                fill: "var(--text-secondary)",
                fontSize: 12,
                fontFamily: "inherit",
              }}
              axisLine={{
                stroke: "var(--border)",
              }}
              tickLine={false}
              dy={8}
            />

            <YAxis
              unit="°C"
              domain={[minTemp, maxTemp]}
              tick={{
                fill: "var(--text-secondary)",
                fontSize: 12,
                fontFamily: "inherit",
              }}
              axisLine={false}
              tickLine={false}
              dx={-5}
            />

            <Tooltip content={<CustomChartTooltip />} />

            <Area
              type="monotone"
              dataKey="temperature"
              stroke="var(--accent)"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#tempGradient)"
              activeDot={{
                r: 6,
                fill: "var(--accent)",
                stroke: "var(--surface)",
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.section>
  );
}