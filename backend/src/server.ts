import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import fs from "node:fs";
import path from "node:path";
import { calculateComfortIndex } from "./utils/comfortIndex";
import { checkJwt } from "./middleware/auth";
import {
  weatherCache,
  processedWeatherCache,
  recordCacheHit,
  recordCacheMiss,
  recordProcessedCacheHit,
  recordProcessedCacheMiss,
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

interface OpenWeatherForecastResponse {
  list: {
    dt: number;
    main: {
      temp: number;
    };
    weather: {
      description: string;
    }[];
  }[];
  city: {
    id: number;
    name: string;
  };
}

interface ForecastPoint {
  timestamp: number;
  temperature: number;
  description: string;
}

interface ForecastResponse {
  cityId: number;
  cityName: string;
  data: ForecastPoint[];
}

interface ProcessedWeatherCity {
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

interface ProcessedWeatherResponse {
  count: number;
  data: ProcessedWeatherCity[];
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

const FRONTEND_URL =
  process.env.FRONTEND_URL || "http://localhost:5173";

app.use(
  cors({
    origin: FRONTEND_URL,
  })
);
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

app.get("/api/weather", checkJwt, async (req, res) => {
  try {
    const processedCacheKey = "ranked-weather";

    const cachedProcessedData =
      processedWeatherCache.get<ProcessedWeatherResponse>(
        processedCacheKey
      );

    if (cachedProcessedData) {
      recordProcessedCacheHit();

      return res.json(cachedProcessedData);
    }

    recordProcessedCacheMiss();

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

    const processedResponse: ProcessedWeatherResponse = {
      count: rankedWeatherData.length,
      data: rankedWeatherData,
    };

    processedWeatherCache.set(
      processedCacheKey,
      processedResponse
    );

    return res.json(processedResponse);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to fetch weather data",
    });
  }
});

app.get("/api/cache/status", checkJwt, (req, res) => {
  res.json(getCacheStats());
});

app.get("/api/forecast/:cityId", checkJwt, async (req, res) => {
  try {
    const cityIdParam = req.params.cityId;

    const cityId = Array.isArray(cityIdParam)
      ? cityIdParam[0]
      : cityIdParam;

    if (!cityId || !cityCodes.includes(cityId)) {
      return res.status(400).json({
        message: "Invalid city ID",
      });
    }

    const apiKey = process.env.OPENWEATHER_API_KEY;

    if (!apiKey) {
      throw new Error("OpenWeather API key is missing");
    }

    const response = await axios.get<OpenWeatherForecastResponse>(
      "https://api.openweathermap.org/data/2.5/forecast",
      {
        params: {
          id: cityId,
          appid: apiKey,
          units: "metric",
        },
      }
    );

    const forecastData = response.data.list
      .slice(0, 8)
      .map((item) => ({
        timestamp: item.dt,
        temperature: item.main.temp,
        description:
          item.weather[0]?.description ?? "Unknown",
      }));

    const result: ForecastResponse = {
      cityId: response.data.city.id,
      cityName: response.data.city.name,
      data: forecastData,
    };

    return res.json(result);
  } catch (error) {
    console.error("Failed to fetch forecast:", error);

    return res.status(500).json({
      message: "Failed to fetch forecast data",
    });
  }
});

app.listen(PORT, () => {
  console.log(`SkyMetric server running on http://localhost:${PORT}`);
});