import { useEffect, useState } from "react";
import { fetchWeatherData } from "./services/weatherApi";
import type { WeatherCity } from "./types/weather";
import WeatherCard from "./components/WeatherCard";
import "./App.css";

function App() {
  const [weatherData, setWeatherData] = useState<WeatherCity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadWeather() {
      try {
        const response = await fetchWeatherData();
        setWeatherData(response.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load weather data.");
      } finally {
        setLoading(false);
      }
    }

    loadWeather();
  }, []);

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
          <h1>SkyMetric</h1>
          <p className="subtitle">
            City comfort rankings based on live weather conditions.
          </p>
        </div>

        <div className="city-count">
          <span>Analyzed Cities</span>
          <strong>{weatherData.length}</strong>
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