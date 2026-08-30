import { useEffect, useState, type ChangeEvent } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Thermometer,
  ArrowUpDown,
  LogOut,
  ShieldCheck,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  SlidersHorizontal,
  Compass,
  X,
} from "lucide-react";
import {
  fetchWeatherData,
  fetchForecastData,
} from "./services/weatherApi";
import type { ForecastPoint, WeatherCity } from "./types/weather";
import WeatherCard from "./components/WeatherCard";
import TemperatureTrendChart from "./components/TemperatureTrendChart";
import AnimatedBackground from "./components/AnimatedBackground";
import ThemeToggle from "./components/ThemeToggle";
import WeatherInsights from "./components/WeatherInsights";
import LoadingWeather from "./components/LoadingWeather";
import "./App.css";

function App() {
  const {
    loginWithRedirect,
    logout,
    isAuthenticated,
    isLoading: authLoading,
    user,
    getAccessTokenSilently,
  } = useAuth0();

  const [weatherData, setWeatherData] = useState<WeatherCity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<
    "comfort" | "temperature-high" | "temperature-low" | "city"
  >("comfort");
  const [temperatureFilter, setTemperatureFilter] = useState<
    "all" | "cool" | "mild" | "warm"
  >("all");
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    return localStorage.getItem("skymetric-theme") === "dark"
      ? "dark"
      : "light";
  });
  const [selectedForecastCity, setSelectedForecastCity] = useState("");
  const [forecastData, setForecastData] = useState<ForecastPoint[]>([]);
  const [forecastCityName, setForecastCityName] = useState("");
  const [forecastLoading, setForecastLoading] = useState(false);
  const [forecastError, setForecastError] = useState("");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("skymetric-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === "light" ? "dark" : "light"));
  };

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    let cancelled = false;

    async function loadWeather() {
      try {
        const accessToken = await getAccessTokenSilently();
        const response = await fetchWeatherData(accessToken);

        if (!cancelled) {
          setWeatherData(response.data);
          setError("");
        }
      } catch (err) {
        console.error(err);

        if (!cancelled) {
          setError("Failed to load weather data.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadWeather();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, getAccessTokenSilently]);

  const handleLogout = () => {
    setWeatherData([]);
    setLoading(true);
    setError("");

    logout({
      logoutParams: {
        returnTo: window.location.origin,
      },
    });
  };

  const handleForecastCityChange = async (
    event: ChangeEvent<HTMLSelectElement>
  ) => {
    const value = event.target.value;

    setSelectedForecastCity(value);
    setForecastError("");
    setForecastData([]);
    setForecastCityName("");

    if (!value) {
      return;
    }

    try {
      setForecastLoading(true);

      const accessToken = await getAccessTokenSilently();

      const response = await fetchForecastData(Number(value), accessToken);

      setForecastData(response.data);
      setForecastCityName(response.cityName);
    } catch (err) {
      console.error(err);
      setForecastError("Failed to load temperature trend.");
    } finally {
      setForecastLoading(false);
    }
  };

  const visibleWeatherData = weatherData
    .filter((city) =>
      city.cityName
        .toLowerCase()
        .includes(searchQuery.trim().toLowerCase())
    )
    .filter((city) => {
      if (temperatureFilter === "cool") {
        return city.temperature < 18;
      }

      if (temperatureFilter === "mild") {
        return city.temperature >= 18 && city.temperature <= 27;
      }

      if (temperatureFilter === "warm") {
        return city.temperature > 27;
      }

      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "temperature-high":
          return b.temperature - a.temperature;

        case "temperature-low":
          return a.temperature - b.temperature;

        case "city":
          return a.cityName.localeCompare(b.cityName);

        case "comfort":
        default:
          return b.comfortScore - a.comfortScore;
      }
    });

  // Loading state during Auth0 initial check
  if (authLoading) {
    return (
      <main className="app-viewport">
        <AnimatedBackground theme={theme} variant="login" />
        <LoadingWeather
          message="Checking authentication..."
          submessage="Establishing secure session and validating credentials"
        />
      </main>
    );
  }

  // Login page
  if (!isAuthenticated) {
    return (
      <main className="app-viewport">
        <AnimatedBackground theme={theme} variant="login" />

        <div className="login-theme-bar">
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>

        <section className="login-page">
          <motion.div
            className="login-card-wrapper"
            initial={{ opacity: 0, y: 25, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {/* Glowing Backdrop Aura */}
            <div className="login-card-aura" aria-hidden="true" />

            <div className="login-card">
              <div className="login-brand-header">
                <div className="login-logo-ring">
                  <img
                    src="/skymetric-icon.png"
                    alt="SkyMetric logo"
                    className="login-logo"
                  />
                </div>
                <div className="login-badge">
                  <Sparkles size={12} className="login-badge-icon" />
                  <span>WEATHER INTELLIGENCE</span>
                </div>
              </div>

              <h1>SkyMetric</h1>

              <p className="login-description">
                Compare live atmospheric telemetry and explore real-time comfort
                rankings across global benchmark stations.
              </p>

              <div className="login-action-group">
                <motion.button
                  className="login-button"
                  onClick={() => loginWithRedirect()}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>Sign In / Launch Dashboard</span>
                </motion.button>
              </div>

              <div className="login-card-footer">
                <ShieldCheck size={14} className="security-icon" />
                <span>Protected by Auth0 Enterprise JWT & MFA</span>
              </div>
            </div>
          </motion.div>
        </section>
      </main>
    );
  }

  // Loading state while fetching weather
  if (loading) {
    return (
      <main className="app-viewport">
        <AnimatedBackground theme={theme} variant="dashboard" />
        <LoadingWeather
          message="Loading live weather telemetry..."
          submessage="Computing Comfort Indices and retrieving real-time city conditions"
        />
      </main>
    );
  }

  // Error state
  if (error) {
    return (
      <main className="app-viewport">
        <AnimatedBackground theme={theme} variant="dashboard" />
        <div className="status-page">
          <motion.div
            className="status-card status-card--error"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="error-icon-wrap">
              <AlertTriangle size={32} />
            </div>
            <h1>Data Retrieval Notice</h1>
            <p>{error}</p>

            <button
              className="retry-button"
              onClick={() => window.location.reload()}
            >
              <RotateCcw size={16} />
              <span>Retry Connection</span>
            </button>
          </motion.div>
        </div>
      </main>
    );
  }

  // Main Dashboard
  return (
    <div className="app-viewport">
      <AnimatedBackground theme={theme} variant="dashboard" />

      <main className="app">
        {/* Floating Glass Header */}
        <motion.header
          className="dashboard-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <div className="header-brand-section">
            <div className="live-indicator-tag">
              <span className="pulse-dot" />
              <span className="live-tag-text">LIVE WEATHER ANALYTICS</span>
            </div>

            <div className="brand-title">
              <img
                src="/skymetric-icon.png"
                alt="SkyMetric logo"
                className="brand-icon"
              />
              <h1>SkyMetric</h1>
            </div>

            <p className="subtitle">
              Live comfort intelligence and atmospheric rankings across benchmark cities.
            </p>
          </div>

          <div className="header-actions">
            <div className="user-profile-chip">
              <div className="user-avatar-badge">
                <ShieldCheck size={15} />
              </div>
              <div className="user-info">
                <span className="user-info-label">Authenticated User</span>
                <strong className="user-info-email">{user?.email}</strong>
              </div>
            </div>

            <div className="header-btn-row">
              <ThemeToggle theme={theme} onToggle={toggleTheme} />

              <button
                className="logout-button"
                onClick={handleLogout}
                title="Log out of SkyMetric"
              >
                <LogOut size={16} />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </motion.header>

        {/* Real-time Insights Row */}
        <WeatherInsights weatherData={weatherData} />

        {/* City Ranking Section */}
        <motion.section
          className="ranking-section"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1, ease: "easeOut" }}
        >
          <div className="section-heading">
            <div className="section-title-wrap">
              <div className="section-eyebrow-wrap">
                <Compass size={13} className="eyebrow-icon" />
                <p className="eyebrow">COMFORT INDEX</p>
              </div>
              <h2>City Rankings</h2>
            </div>

            <div className="ranking-badge-pill">
              <span>Most comfortable</span>
              <span className="pill-arrow">→</span>
              <span>Least comfortable</span>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="dashboard-controls">
            <div className="control-group search-control">
              <label htmlFor="city-search">Search city</label>
              <div className="input-icon-wrapper">
                <Search size={16} className="control-icon" />
                <input
                  id="city-search"
                  type="search"
                  placeholder="Search by city name..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="clear-search-btn"
                    onClick={() => setSearchQuery("")}
                    aria-label="Clear search"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            <div className="control-group">
              <label htmlFor="temperature-filter">Temperature</label>
              <div className="input-icon-wrapper select-wrapper">
                <Thermometer size={16} className="control-icon" />
                <select
                  id="temperature-filter"
                  value={temperatureFilter}
                  onChange={(event) =>
                    setTemperatureFilter(
                      event.target.value as "all" | "cool" | "mild" | "warm"
                    )
                  }
                >
                  <option value="all">All temperatures</option>
                  <option value="cool">Cool — below 18°C</option>
                  <option value="mild">Mild — 18°C to 27°C</option>
                  <option value="warm">Warm — above 27°C</option>
                </select>
              </div>
            </div>

            <div className="control-group">
              <label htmlFor="sort-by">Sort by</label>
              <div className="input-icon-wrapper select-wrapper">
                <ArrowUpDown size={16} className="control-icon" />
                <select
                  id="sort-by"
                  value={sortBy}
                  onChange={(event) =>
                    setSortBy(
                      event.target.value as
                        | "comfort"
                        | "temperature-high"
                        | "temperature-low"
                        | "city"
                    )
                  }
                >
                  <option value="comfort">Comfort score</option>
                  <option value="temperature-high">
                    Temperature — High to Low
                  </option>
                  <option value="temperature-low">
                    Temperature — Low to High
                  </option>
                  <option value="city">City — A to Z</option>
                </select>
              </div>
            </div>
          </div>

          <div className="results-summary">
            <SlidersHorizontal size={13} />
            <span>
              Showing <strong>{visibleWeatherData.length}</strong> of{" "}
              <strong>{weatherData.length}</strong> benchmark cities
            </span>
          </div>

          <AnimatePresence mode="wait">
            {visibleWeatherData.length > 0 ? (
              <motion.div
                key="weather-grid"
                className="weather-grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                {visibleWeatherData.map((city) => (
                  <WeatherCard key={city.cityId} city={city} />
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="no-results"
                className="no-results"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="no-results-icon">
                  <Search size={28} />
                </div>
                <h3>No matching cities found</h3>
                <p>Try refining your city search keyword or temperature range filter.</p>
                <button
                  type="button"
                  className="reset-filters-btn"
                  onClick={() => {
                    setSearchQuery("");
                    setTemperatureFilter("all");
                    setSortBy("comfort");
                  }}
                >
                  Reset all filters
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>

        {/* Forecast / Temperature Trend Section */}
        <motion.section
          className="forecast-section"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.15, ease: "easeOut" }}
        >
          <div className="forecast-controls">
            <div className="forecast-title-group">
              <div className="section-eyebrow-wrap">
                <Sparkles size={13} className="eyebrow-icon" />
                <p className="forecast-eyebrow">WEATHER FORECAST</p>
              </div>
              <h2>24-Hour Temperature Trend</h2>
              <p className="forecast-description">
                Inspect predicted 24-hour diurnal thermal curve and conditions.
              </p>
            </div>

            <div className="forecast-city-control">
              <label htmlFor="forecast-city">Select city</label>
              <div className="input-icon-wrapper select-wrapper">
                <Thermometer size={16} className="control-icon" />
                <select
                  id="forecast-city"
                  value={selectedForecastCity}
                  onChange={handleForecastCityChange}
                >
                  <option value="">Choose a city...</option>
                  {weatherData.map((city) => (
                    <option key={city.cityId} value={city.cityId}>
                      {city.cityName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {forecastLoading && (
            <div className="forecast-message forecast-loading-wrap">
              <span className="mini-spinner" />
              <span>Retrieving 24-hour predictive forecast telemetry...</span>
            </div>
          )}

          {forecastError && (
            <div className="forecast-message forecast-error">
              <AlertTriangle size={16} />
              <span>{forecastError}</span>
            </div>
          )}

          {!forecastLoading &&
            !forecastError &&
            forecastData.length > 0 && (
              <TemperatureTrendChart
                cityName={forecastCityName}
                data={forecastData}
              />
            )}
        </motion.section>
      </main>
    </div>
  );
}

export default App;