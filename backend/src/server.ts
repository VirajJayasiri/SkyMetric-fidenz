import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import fs from "node:fs";
import path from "node:path";

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

app.get("/api/weather/test", async (req, res) => {
  try {
    const apiKey = process.env.OPENWEATHER_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        message: "OpenWeather API key is missing",
      });
    }

    const cityId = 2172797;

    const response = await axios.get(
      "https://api.openweathermap.org/data/2.5/weather",
      {
        params: {
          id: cityId,
          appid: apiKey,
          units: "metric",
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch weather data",
    });
  }
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
      (weather) => ({
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
      })
    );

    res.json({
      count: weatherData.length,
      data: weatherData,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch weather data",
    });
  }
});

app.listen(PORT, () => {
  console.log(`SkyMetric server running on http://localhost:${PORT}`);
});