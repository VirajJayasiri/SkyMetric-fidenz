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

app.listen(PORT, () => {
  console.log(`SkyMetric server running on http://localhost:${PORT}`);
});