import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import fs from "node:fs";
import path from "node:path";
import { calculateComfortIndex } from "./utils/comfortIndex";
import {
  weatherCache,
  recordCacheHit,
  recordCacheMiss,
  getCacheStats,
} from "./services/cacheService";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

interface City {
  CityCode: string;
  CityName: string;
}

interface CitiesFile {
  List: City[];
}

interface OpenWeatherResponse {
  id: number;
  name: string;

  weather: {
    main: string;
    description: string;
  }[];

  main: {
    temp: number;
    humidity: number;
    pressure: number;
  };

  wind: {
    speed: number;
  };

  clouds: {
    all: number;
  };

  visibility: number;
}

const citiesFilePath = path.join(
  process.cwd(),
  "src",
  "data",
  "cities.json"
);

const citiesFileContent = fs.readFileSync(
  citiesFilePath,
  "utf-8"
);

const citiesData: CitiesFile = JSON.parse(
  citiesFileContent
);

const cityCodes = citiesData.List.map(
  (city) => city.CityCode
);

async function getWeatherByCityId(
  cityId: string
): Promise<OpenWeatherResponse> {
  const cachedWeather =
    weatherCache.get<OpenWeatherResponse>(cityId);

  if (cachedWeather) {
    recordCacheHit();
    return cachedWeather;
  }

  recordCacheMiss();

  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (!apiKey) {
    throw new Error("OpenWeather API key is missing");
  }

  const response = await axios.get<OpenWeatherResponse>(
    "https://api.openweathermap.org/data/2.5/weather",
    {
      params: {
        id: cityId,
        appid: apiKey,
        units: "metric",
      },
    }
  );

  weatherCache.set(cityId, response.data);

  return response.data;
}

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "SkyMetric API is running",
  });
});

app.get("/api/cities/codes", (req, res) => {
  res.json({
    count: cityCodes.length,
    cityCodes,
  });
});

app.get("/api/weather", async (req, res) => {
  try {
    const weatherResponses = await Promise.all(
      cityCodes.map((cityCode) =>
        getWeatherByCityId(cityCode)
      )
    );

    const weatherData = weatherResponses.map(
      (weather) => {
        const comfortScore = calculateComfortIndex(
          weather.main.temp,
          weather.main.humidity,
          weather.wind.speed
        );

        return {
          cityId: weather.id,
          cityName: weather.name,
          description:
            weather.weather[0]?.description ?? "Unknown",
          temperature: weather.main.temp,
          humidity: weather.main.humidity,
          windSpeed: weather.wind.speed,
          pressure: weather.main.pressure,
          visibility: weather.visibility,
          cloudiness: weather.clouds.all,
          comfortScore,
        };
      }
    );

    weatherData.sort(
      (a, b) => b.comfortScore - a.comfortScore
    );

    const rankedWeatherData = weatherData.map(
      (weather, index) => ({
        ...weather,
        rank: index + 1,
      })
    );

    res.json({
      count: rankedWeatherData.length,
      data: rankedWeatherData,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch weather data",
    });
  }
});

app.get("/api/cache/status", (req, res) => {
  res.json(getCacheStats());
});

app.listen(PORT, () => {
  console.log(`SkyMetric server running on http://localhost:${PORT}`);
});