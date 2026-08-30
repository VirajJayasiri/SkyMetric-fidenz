import { motion } from "framer-motion";
import { Sparkles, Radio } from "lucide-react";

interface LoadingWeatherProps {
  message?: string;
  submessage?: string;
}

export default function LoadingWeather({
  message = "Loading live weather data...",
  submessage = "Retrieving real-time telemetry and computing comfort indices across global stations",
}: LoadingWeatherProps) {
  return (
    <div className="status-page">
      <motion.div
        className="loading-weather-card"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="radar-pulse-container">
          <div className="radar-ring radar-ring--1" />
          <div className="radar-ring radar-ring--2" />
          <div className="radar-ring radar-ring--3" />
          <img
            src="/skymetric-icon.png"
            alt="SkyMetric"
            className="loading-brand-icon"
          />
        </div>

        <div className="loading-status-badge">
          <Radio size={13} className="radar-dot-icon" />
          <span>Live Telemetry Sync</span>
        </div>

        <h1 className="loading-title">SkyMetric</h1>
        <p className="loading-message">{message}</p>
        <p className="loading-submessage">{submessage}</p>

        {/* Skeleton Card Previews */}
        <div className="skeleton-grid" aria-hidden="true">
          <div className="skeleton-card">
            <div className="skeleton-line skeleton-line--title" />
            <div className="skeleton-line skeleton-line--text" />
            <div className="skeleton-details">
              <div className="skeleton-box" />
              <div className="skeleton-box" />
              <div className="skeleton-box" />
            </div>
          </div>
          <div className="skeleton-card">
            <div className="skeleton-line skeleton-line--title" />
            <div className="skeleton-line skeleton-line--text" />
            <div className="skeleton-details">
              <div className="skeleton-box" />
              <div className="skeleton-box" />
              <div className="skeleton-box" />
            </div>
          </div>
        </div>

        <div className="loading-footer">
          <Sparkles size={13} />
          <span>High-precision weather intelligence</span>
        </div>
      </motion.div>
    </div>
  );
}
