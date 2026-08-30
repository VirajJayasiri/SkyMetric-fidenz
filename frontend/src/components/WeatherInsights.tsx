import { useMemo } from "react";
import { motion } from "framer-motion";
import { Sparkles, Sun, Snowflake, Droplets, type LucideIcon } from "lucide-react";
import type { WeatherCity } from "../types/weather";

interface StatItem {
  id: string;
  label: string;
  city: string;
  value: string;
  subtext: string;
  Icon: LucideIcon;
  accentClass: string;
}

interface WeatherInsightsProps {
  weatherData: WeatherCity[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" as const },
  },
};

export default function WeatherInsights({ weatherData }: WeatherInsightsProps) {
  const stats: StatItem[] | null = useMemo(() => {
    if (!weatherData || weatherData.length === 0) {
      return null;
    }

    // 1. Most comfortable (highest comfort score)
    const mostComfortable = [...weatherData].sort(
      (a, b) => b.comfortScore - a.comfortScore
    )[0];

    // 2. Warmest city (highest temperature)
    const warmest = [...weatherData].sort(
      (a, b) => b.temperature - a.temperature
    )[0];

    // 3. Coolest city (lowest temperature)
    const coolest = [...weatherData].sort(
      (a, b) => a.temperature - b.temperature
    )[0];

    // 4. Highest Humidity
    const highestHumidity = [...weatherData].sort(
      (a, b) => b.humidity - a.humidity
    )[0];

    return [
      {
        id: "most-comfortable",
        label: "Most Comfortable",
        city: mostComfortable.cityName,
        value: `${mostComfortable.comfortScore}/100`,
        subtext: `Rank #${mostComfortable.rank} • ${mostComfortable.temperature.toFixed(1)}°C`,
        Icon: Sparkles,
        accentClass: "stat-card--comfort",
      },
      {
        id: "warmest",
        label: "Warmest City",
        city: warmest.cityName,
        value: `${warmest.temperature.toFixed(1)}°C`,
        subtext: `Score: ${warmest.comfortScore} • ${warmest.description}`,
        Icon: Sun,
        accentClass: "stat-card--warmest",
      },
      {
        id: "coolest",
        label: "Coolest City",
        city: coolest.cityName,
        value: `${coolest.temperature.toFixed(1)}°C`,
        subtext: `Score: ${coolest.comfortScore} • ${coolest.description}`,
        Icon: Snowflake,
        accentClass: "stat-card--coolest",
      },
      {
        id: "humidity",
        label: "Highest Humidity",
        city: highestHumidity.cityName,
        value: `${highestHumidity.humidity}%`,
        subtext: `Score: ${highestHumidity.comfortScore} • ${highestHumidity.temperature.toFixed(1)}°C`,
        Icon: Droplets,
        accentClass: "stat-card--humidity",
      },
    ];
  }, [weatherData]);

  if (!stats) return null;

  return (
    <motion.section
      className="weather-insights-grid"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      aria-label="Weather Highlights and Key Metrics"
    >
      {stats.map((item) => {
        const CardIcon = item.Icon;
        return (
          <motion.div
            key={item.id}
            variants={itemVariants}
            className={`stat-card ${item.accentClass}`}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
          >
            <div className="stat-card-header">
              <span className="stat-card-label">{item.label}</span>
              <div className="stat-card-icon-wrap">
                <CardIcon size={16} strokeWidth={2.4} />
              </div>
            </div>
            <div className="stat-card-body">
              <h3 className="stat-card-city">{item.city}</h3>
              <div className="stat-card-value">{item.value}</div>
            </div>
            <p className="stat-card-subtext">{item.subtext}</p>
          </motion.div>
        );
      })}
    </motion.section>
  );
}
