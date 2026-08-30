import { motion } from "framer-motion";
import {
  Thermometer,
  Droplets,
  Wind,
  Activity,
  Sun,
  CloudSun,
  CloudRain,
  Cloud,
  CloudLightning,
  Snowflake,
  CloudFog,
  Award,
} from "lucide-react";
import type { WeatherCity } from "../types/weather";

interface WeatherCardProps {
  city: WeatherCity;
}

function WeatherDescriptionIcon({ description }: { description: string }) {
  const desc = description.toLowerCase();
  if (desc.includes("thunder") || desc.includes("storm")) {
    return <CloudLightning size={14} className="weather-desc-icon" />;
  }
  if (desc.includes("rain") || desc.includes("drizzle")) {
    return <CloudRain size={14} className="weather-desc-icon" />;
  }
  if (desc.includes("snow") || desc.includes("sleet")) {
    return <Snowflake size={14} className="weather-desc-icon" />;
  }
  if (desc.includes("fog") || desc.includes("mist") || desc.includes("haze")) {
    return <CloudFog size={14} className="weather-desc-icon" />;
  }
  if (desc.includes("few clouds") || desc.includes("scattered")) {
    return <CloudSun size={14} className="weather-desc-icon" />;
  }
  if (desc.includes("cloud") || desc.includes("overcast")) {
    return <Cloud size={14} className="weather-desc-icon" />;
  }
  return <Sun size={14} className="weather-desc-icon" />;
}

export default function WeatherCard({ city }: WeatherCardProps) {
  const isTopRank = city.rank === 1;
  const isPodium = city.rank <= 3;
  const scorePercent = Math.min(100, Math.max(0, city.comfortScore));

  return (
    <motion.article
      className={`weather-card ${isTopRank ? "weather-card--rank-1" : isPodium ? "weather-card--podium" : ""}`}
      whileHover={{ y: -4, transition: { duration: 0.2, ease: "easeOut" } }}
      layout
    >
      <div className="weather-card-header">
        <div className="weather-card-title-group">
          <span
            className={`rank-badge ${
              isTopRank
                ? "rank-badge--1"
                : city.rank === 2
                ? "rank-badge--2"
                : city.rank === 3
                ? "rank-badge--3"
                : "rank-badge--default"
            }`}
          >
            {isTopRank && <Award size={13} className="rank-crown-icon" />}#{city.rank}
          </span>
          <div>
            <h2>{city.cityName}</h2>
            <div className="weather-condition-tag">
              <WeatherDescriptionIcon description={city.description} />
              <span>{city.description}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="weather-details">
        <div className="detail-item">
          <div className="detail-label">
            <Thermometer size={14} className="detail-icon" />
            <span>Temperature</span>
          </div>
          <strong>{city.temperature.toFixed(1)}°C</strong>
        </div>

        <div className="detail-item">
          <div className="detail-label">
            <Droplets size={14} className="detail-icon" />
            <span>Humidity</span>
          </div>
          <strong>{city.humidity}%</strong>
        </div>

        <div className="detail-item">
          <div className="detail-label">
            <Wind size={14} className="detail-icon" />
            <span>Wind</span>
          </div>
          <strong>{city.windSpeed.toFixed(1)} m/s</strong>
        </div>
      </div>

      <div className="comfort-section">
        <div className="comfort-meta">
          <div className="comfort-label-wrap">
            <Activity size={14} className="comfort-icon" />
            <span>Comfort Score</span>
          </div>
          <strong className="comfort-score-value">
            {city.comfortScore}
            <span className="comfort-scale">/100</span>
          </strong>
        </div>

        <div className="comfort-bar-track" aria-hidden="true">
          <div
            className={`comfort-bar-fill ${
              scorePercent >= 80
                ? "comfort-bar-fill--high"
                : scorePercent >= 60
                ? "comfort-bar-fill--med"
                : "comfort-bar-fill--low"
            }`}
            style={{ width: `${scorePercent}%` }}
          />
        </div>
      </div>
    </motion.article>
  );
}