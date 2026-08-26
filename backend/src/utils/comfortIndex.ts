function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function calculateComfortIndex(
  temperature: number,
  humidity: number,
  windSpeed: number
): number {
  // Ideal temperature is around 22°C
  const temperatureScore = clamp(
    100 - Math.abs(temperature - 22) * 5,
    0,
    100
  );

  // Ideal humidity is around 50%
  const humidityScore = clamp(
    100 - Math.abs(humidity - 50) * 2,
    0,
    100
  );

  // A light breeze around 3 m/s is considered comfortable
  const windScore = clamp(
    100 - Math.abs(windSpeed - 3) * 10,
    0,
    100
  );

  const comfortScore =
    temperatureScore * 0.5 +
    humidityScore * 0.3 +
    windScore * 0.2;

  return Math.round(comfortScore * 10) / 10;
}