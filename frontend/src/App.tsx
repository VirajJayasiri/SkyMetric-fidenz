import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { fetchWeatherData } from "./services/weatherApi";
import type { WeatherCity } from "./types/weather";
import WeatherCard from "./components/WeatherCard";
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

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    async function loadWeather() {
      try {
        setLoading(true);
        setError("");

        const accessToken = await getAccessTokenSilently();

        const response = await fetchWeatherData(accessToken);
        setWeatherData(response.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load weather data.");
      } finally {
        setLoading(false);
      }
    }

    loadWeather();
  }, [isAuthenticated, getAccessTokenSilently]);

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
            className="logout-button"
            onClick={() =>
              logout({
                logoutParams: {
                  returnTo: window.location.origin,
                },
              })
            }
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

        <div className="weather-grid">
          {weatherData.map((city) => (
            <WeatherCard
              key={city.cityId}
              city={city}
            />
          ))}
        </div>
      </section>
    </main>
  );
}

export default App;