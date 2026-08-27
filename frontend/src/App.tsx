import { useEffect, useState } from "react";
import { fetchWeatherData } from "./services/weatherApi";
import type { WeatherCity } from "./types/weather";

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
    return <p>Loading weather data...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <h1>SkyMetric</h1>
      <p>Weather Comfort Rankings</p>

      {weatherData.map((city) => (
        <div key={city.cityId}>
          <h2>
            #{city.rank} {city.cityName}
          </h2>

          <p>Weather: {city.description}</p>
          <p>Temperature: {city.temperature}°C</p>
          <p>Comfort Score: {city.comfortScore}/100</p>

          <hr />
        </div>
      ))}
    </div>
  );
}

export default App;