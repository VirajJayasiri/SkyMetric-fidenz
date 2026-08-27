import type { WeatherApiResponse } from "../types/weather";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export async function fetchWeatherData(
  accessToken: string
): Promise<WeatherApiResponse> {
  const response = await fetch(`${API_BASE_URL}/api/weather`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch weather data");
  }

  return response.json();
}