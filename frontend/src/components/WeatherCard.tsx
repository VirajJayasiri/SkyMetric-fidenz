import type { WeatherCity } from "../types/weather";

interface WeatherCardProps {
  city: WeatherCity;
}

function WeatherCard({ city }: WeatherCardProps) {
  return (
    <article className="weather-card">
      <div className="weather-card-header">
        <span className="rank">#{city.rank}</span>
        <h2>{city.cityName}</h2>
      </div>

      <p className="description">{city.description}</p>

      <div className="weather-details">
        <div>
          <span>Temperature</span>
          <strong>{city.temperature.toFixed(1)}°C</strong>
        </div>

        <div>
          <span>Humidity</span>
          <strong>{city.humidity}%</strong>
        </div>

        <div>
          <span>Wind</span>
          <strong>{city.windSpeed.toFixed(1)} m/s</strong>
        </div>
      </div>

      <div className="comfort-section">
        <span>Comfort Score</span>
        <strong>{city.comfortScore}/100</strong>
      </div>
    </article>
  );
}

export default WeatherCard;