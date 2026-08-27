export interface WeatherCity {
  cityId: number;
  cityName: string;
  description: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  pressure: number;
  visibility: number;
  cloudiness: number;
  comfortScore: number;
  rank: number;
}

export interface WeatherApiResponse {
  count: number;
  data: WeatherCity[];
}