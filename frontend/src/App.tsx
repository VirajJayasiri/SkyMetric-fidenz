import { useEffect, useState, type ChangeEvent } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import {
  fetchWeatherData,
  fetchForecastData,
} from "./services/weatherApi";
import type { ForecastPoint, WeatherCity } from "./types/weather";
import WeatherCard from "./components/WeatherCard";
import TemperatureTrendChart from "./components/TemperatureTrendChart";
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

  if (authLoading) {
    return (
      <main className="status-page">
        <div className="status-card">
          <div className="loader"></div>
          <h1>SkyMetric</h1>
          <p>Checking authentication...</p>
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="login-page">
        <section className="login-card">
          <img
            src="/skymetric-icon.png"
            alt="SkyMetric logo"
            className="login-logo"
          />

          <p className="eyebrow">WEATHER ANALYTICS</p>

          <h1>SkyMetric</h1>

          <p className="login-description">
            Compare live weather conditions and discover which cities are
            currently the most comfortable.
          </p>

          <button
            className="login-button"
            onClick={() => loginWithRedirect()}
          >
            Log In
          </button>
        </section>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="status-page">
        <div className="status-card">
          <div className="loader"></div>
          <h1>SkyMetric</h1>
          <p>Loading live weather data...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="status-page">
        <div className="status-card">
          <h1>Something went wrong</h1>
          <p>{error}</p>

          <button
            className="retry-button"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="app">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">LIVE WEATHER ANALYTICS</p>

          <div className="brand-title">
            <img
              src="/skymetric-icon.png"
              alt="SkyMetric logo"
              className="brand-icon"
            />

            <h1>SkyMetric</h1>
          </div>

          <p className="subtitle">
            City comfort rankings based on live weather conditions.
          </p>
        </div>

        <div className="header-actions">
          <div className="user-info">
            <span>Signed in as</span>
            <strong>{user?.email}</strong>
          </div>

          <button
            type="button"
            className="theme-toggle"
            onClick={() =>
              setTheme((currentTheme) =>
                currentTheme === "light" ? "dark" : "light"
              )
            }
            aria-label="Toggle color theme"
          >
            {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
          </button>

          <button
            className="logout-button"
            onClick={handleLogout}
          >
            Log Out
          </button>
        </div>
      </header>

      <section className="ranking-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">COMFORT INDEX</p>
            <h2>City Rankings</h2>
          </div>

          <p>Most comfortable to least comfortable</p>
        </div>

        <div className="dashboard-controls">
          <div className="control-group search-control">
            <label htmlFor="city-search">Search city</label>

            <input
              id="city-search"
              type="search"
              placeholder="Search by city name..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>

          <div className="control-group">
            <label htmlFor="temperature-filter">Temperature</label>

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

          <div className="control-group">
            <label htmlFor="sort-by">Sort by</label>

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

        <div className="results-summary">
          Showing {visibleWeatherData.length} of {weatherData.length} cities
        </div>

        {visibleWeatherData.length > 0 ? (
          <div className="weather-grid">
            {visibleWeatherData.map((city) => (
              <WeatherCard
                key={city.cityId}
                city={city}
              />
            ))}
          </div>
        ) : (
          <div className="no-results">
            <h3>No cities found</h3>
            <p>Try changing your search or temperature filter.</p>
          </div>
        )}
      </section>

      <section className="forecast-section">
        <div className="forecast-controls">
          <div>
            <p className="forecast-eyebrow">Weather forecast</p>

            <h2>Temperature Trend</h2>

            <p className="forecast-description">
              View the predicted temperature change for the next 24 hours.
            </p>
          </div>

          <div className="forecast-city-control">
            <label htmlFor="forecast-city">Select city</label>

            <select
              id="forecast-city"
              value={selectedForecastCity}
              onChange={handleForecastCityChange}
            >
              <option value="">Choose a city...</option>

              {weatherData.map((city) => (
                <option
                  key={city.cityId}
                  value={city.cityId}
                >
                  {city.cityName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {forecastLoading && (
          <div className="forecast-message">
            Loading temperature trend...
          </div>
        )}

        {forecastError && (
          <div className="forecast-message forecast-error">
            {forecastError}
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
      </section>
    </main>
  );
}

export default App;