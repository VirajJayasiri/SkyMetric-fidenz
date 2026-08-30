import { useId } from "react";

interface AnimatedBackgroundProps {
  theme: "light" | "dark";
  variant?: "login" | "dashboard";
}

// Generate deterministic stars for dark mode
const STARS = Array.from({ length: 36 }, (_, i) => {
  const top = ((i * 37 + 13) % 94) + 3;
  const left = ((i * 61 + 23) % 94) + 3;
  const size = (i % 3 === 0 ? 3 : i % 2 === 0 ? 2 : 1.5);
  const duration = 2.5 + (i % 5) * 0.8;
  const delay = (i % 7) * 0.4;
  const opacity = 0.35 + (i % 4) * 0.2;
  return { id: i, top, left, size, duration, delay, opacity };
});

export default function AnimatedBackground({
  theme,
  variant = "dashboard",
}: AnimatedBackgroundProps) {
  const idPrefix = useId();

  return (
    <div
      className={`atmospheric-bg atmospheric-bg--${theme} atmospheric-bg--${variant}`}
      aria-hidden="true"
    >
      {/* Light Theme Atmospheric Elements */}
      {theme === "light" && (
        <div className="light-atmosphere">
          {/* Sun Glow Orb */}
          <div className="sun-glow-container">
            <div className="sun-core" />
            <div className="sun-aura-1" />
            <div className="sun-aura-2" />
            <div className="sun-ray-haze" />
          </div>

          {/* Soft floating weather clouds/blobs */}
          <div className="cloud-haze cloud-haze-1" />
          <div className="cloud-haze cloud-haze-2" />
          <div className="cloud-haze cloud-haze-3" />

          {/* Micro atmospheric particles */}
          <div className="light-particles">
            <span className="particle particle-1" />
            <span className="particle particle-2" />
            <span className="particle particle-3" />
            <span className="particle particle-4" />
          </div>
        </div>
      )}

      {/* Dark Theme Atmospheric Elements */}
      {theme === "dark" && (
        <div className="dark-atmosphere">
          {/* Midnight Nebula / Aurora glow */}
          <div className="aurora-glow aurora-glow-1" />
          <div className="aurora-glow aurora-glow-2" />
          <div className="moon-glow-container" />

          {/* Star Field */}
          <div className="star-field">
            {STARS.map((star) => (
              <span
                key={`${idPrefix}-star-${star.id}`}
                className="star"
                style={{
                  top: `${star.top}%`,
                  left: `${star.left}%`,
                  width: `${star.size}px`,
                  height: `${star.size}px`,
                  animationDuration: `${star.duration}s`,
                  animationDelay: `${star.delay}s`,
                  opacity: star.opacity,
                }}
              />
            ))}
            {/* Occasional shooting star streak */}
            <div className="shooting-star" />
            <div className="shooting-star shooting-star-2" />
          </div>
        </div>
      )}

      {/* Grid overlay texture */}
      <div className="atmospheric-grid" />
    </div>
  );
}
