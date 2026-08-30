import { motion } from "framer-motion";
import {
  Activity,
  Droplets,
  LayoutDashboard,
  LockKeyhole,
  Radio,
  ShieldCheck,
  Sparkles,
  Thermometer,
  Wind,
} from "lucide-react";

interface LoadingWeatherProps {
  message?: string;
  submessage?: string;
  variant?: "auth" | "weather" | "logout";
}

export default function LoadingWeather({
  message = "Loading live weather data...",
  submessage = "Retrieving real-time telemetry and computing comfort indices across global stations",
  variant = "weather",
}: LoadingWeatherProps) {
  const isAuth = variant === "auth";
  const isLogout = variant === "logout";
  const isSecurityTransition = isAuth || isLogout;

  return (
    <div className="status-page" role="status" aria-live="polite" aria-busy="true">
      <motion.div
        className="loading-weather-card"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="radar-pulse-container" aria-hidden="true">
          <div className="radar-ring radar-ring--1" />
          <div className="radar-ring radar-ring--2" />
          <div className="radar-ring radar-ring--3" />
          <img
            src="/skymetric-icon.png"
            alt=""
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

        {isSecurityTransition ? (
          <div className="auth-loading-preview">
            <div className="auth-progress-block">
              <span>{isLogout ? "Secure session closure" : "Secure session initialization"}</span>
              <div className="auth-progress-track" aria-hidden="true">
                <span className="auth-progress-indicator" />
              </div>
            </div>

            <div className="auth-stage-list">
              <div className="auth-stage auth-stage--active">
                <ShieldCheck size={16} aria-hidden="true" />
                <span>{isLogout ? "Protecting session data" : "Secure authentication"}</span>
                <span className="auth-stage-dot" aria-hidden="true" />
              </div>
              <div className="auth-stage">
                <LockKeyhole size={16} aria-hidden="true" />
                <span>{isLogout ? "Ending authenticated session" : "Session validation"}</span>
                <span className="auth-stage-dot" aria-hidden="true" />
              </div>
              <div className="auth-stage">
                <LayoutDashboard size={16} aria-hidden="true" />
                <span>{isLogout ? "Returning to sign in" : "Preparing weather workspace"}</span>
                <span className="auth-stage-dot" aria-hidden="true" />
              </div>
            </div>

            <div className="loading-telemetry-grid" aria-hidden="true">
              <div className="loading-telemetry-tile">
                <Thermometer size={15} />
                <span>Temperature</span>
                <strong>-- °C</strong>
              </div>
              <div className="loading-telemetry-tile">
                <Droplets size={15} />
                <span>Humidity</span>
                <strong>-- %</strong>
              </div>
              <div className="loading-telemetry-tile">
                <Wind size={15} />
                <span>Wind</span>
                <strong>-- m/s</strong>
              </div>
              <div className="loading-telemetry-tile">
                <Activity size={15} />
                <span>Comfort Index</span>
                <strong>Calculating...</strong>
              </div>
            </div>
          </div>
        ) : (
          <div className="skeleton-grid" aria-hidden="true">
            <div className="skeleton-card weather-loading-card">
              <Radio size={16} aria-hidden="true" />
              <strong>Weather stations</strong>
              <span>Connecting live telemetry services</span>
              <div className="weather-loading-tags">
                <span>Temperature</span>
                <span>Humidity</span>
                <span>Wind</span>
              </div>
            </div>
            <div className="skeleton-card weather-loading-card">
              <Activity size={16} aria-hidden="true" />
              <strong>Comfort analysis</strong>
              <span>Preparing city rankings and insights</span>
              <div className="weather-loading-tags">
                <span>City data</span>
                <span>Conditions</span>
                <span>Scores</span>
              </div>
            </div>
          </div>
        )}

        <div className="loading-footer">
          <Sparkles size={13} aria-hidden="true" />
          <span>
            {isSecurityTransition
              ? "Protected weather intelligence • Auth0 • MFA"
              : "High-precision weather intelligence"}
          </span>
        </div>
      </motion.div>
    </div>
  );
}
