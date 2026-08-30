# SkyMetric

SkyMetric is a full-stack weather analytics application that compares weather conditions across different cities and ranks them using a custom **Comfort Index Score**.

I developed this project as part of the Fidenz Trainee Software Engineer Full Stack assignment.

The application gets live weather data from OpenWeatherMap, calculates a Comfort Index on the backend, ranks cities from the most comfortable to the least comfortable, and displays the results through a responsive dashboard.

The application also includes Auth0 authentication, MFA, server-side caching, dark/light themes, sorting and filtering, unit tests, and a 24-hour temperature forecast graph.

---

## Features

### Main Features

- Live weather data from OpenWeatherMap
- Processes 10 cities from `cities.json`
- Custom Comfort Index from 0 to 100
- Comfort Index calculated on the backend
- Cities ranked from most comfortable to least comfortable
- Displays:
  - City name
  - Weather description
  - Temperature
  - Humidity
  - Wind speed
  - Comfort score
  - Rank
- Responsive desktop and mobile design

### Authentication

- Auth0 login and logout
- JWT-protected backend endpoints
- Multi-Factor Authentication (MFA)
- Email-based MFA support
- Public signup disabled
- Only manually created / whitelisted users can access the application

### Caching

- Raw OpenWeatherMap responses cached for 5 minutes
- Processed ranked weather response cached for 5 minutes
- Cache HIT / MISS tracking
- Protected cache debug endpoint

### Bonus Features

- Dark mode and light mode
- Theme preference saved in local storage
- City search
- Temperature filtering
- Multiple sorting options
- Comfort Index unit tests
- 24-hour temperature forecast graph
- Weather summary / insight cards
- Animated weather backgrounds
- Smooth UI transitions and interactions

---

## Technology Stack

### Frontend

- React
- TypeScript
- Vite
- Auth0 React SDK
- Recharts
- Framer Motion
- Lucide React
- CSS
- Outfit Font

### Backend

- Node.js
- Express
- TypeScript
- Axios
- NodeCache
- Auth0 JWT Bearer
- Vitest

### External Services

- OpenWeatherMap API
- Auth0

---

## Project Structure

```text
SkyMetric-fidenz/
│
├── backend/
│   ├── src/
│   │   ├── data/
│   │   │   └── cities.json
│   │   │
│   │   ├── middleware/
│   │   │   └── auth.ts
│   │   │
│   │   ├── services/
│   │   │   └── cacheService.ts
│   │   │
│   │   ├── utils/
│   │   │   ├── comfortIndex.ts
│   │   │   └── comfortIndex.test.ts
│   │   │
│   │   └── server.ts
│   │
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── public/
│   │   └── skymetric-icon.png
│   │
│   ├── src/
│   │   ├── components/
│   │   │   ├── AnimatedBackground.tsx
│   │   │   ├── LoadingWeather.tsx
│   │   │   ├── TemperatureTrendChart.tsx
│   │   │   ├── ThemeToggle.tsx
│   │   │   ├── WeatherCard.tsx
│   │   │   └── WeatherInsights.tsx
│   │   │
│   │   ├── services/
│   │   │   └── weatherApi.ts
│   │   │
│   │   ├── types/
│   │   │   └── weather.ts
│   │   │
│   │   ├── App.tsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.tsx
│   │
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
└── README.md
```

---

# Comfort Index

The main part of this project is the custom **Comfort Index**.

The Comfort Index is calculated completely on the backend and gives each city a score between:

```text
0 - Very uncomfortable
100 - Very comfortable
```

I used three weather parameters:

| Parameter | Ideal Value | Weight |
|---|---:|---:|
| Temperature | 22°C | 50% |
| Humidity | 50% | 30% |
| Wind Speed | 3 m/s | 20% |

Each individual score is limited to a value between `0` and `100`.

---

## Temperature Score

I considered around **22°C** as a comfortable outdoor temperature.

```text
Temperature Score =
100 - |temperature - 22| × 5
```

The score is clamped between:

```text
0 and 100
```

As the temperature moves further away from 22°C, the score decreases.

---

## Humidity Score

I used **50% humidity** as the ideal humidity value.

```text
Humidity Score =
100 - |humidity - 50| × 2
```

Very high or very low humidity decreases the score.

---

## Wind Score

I used approximately **3 m/s** as a comfortable light breeze.

```text
Wind Score =
100 - |windSpeed - 3| × 10
```

Wind speeds that are much lower or higher than this reduce the score.

---

## Final Comfort Index Formula

The three scores are combined using different weights:

```text
Comfort Index =
Temperature Score × 0.50
+ Humidity Score × 0.30
+ Wind Score × 0.20
```

The final result is rounded to one decimal place.

Example:

```text
Comfort Score: 87.5 / 100
```

---

# Why I Chose These Weights

## Temperature - 50%

I gave temperature the largest weight because I think it has the biggest effect on outdoor comfort.

For example, even if the humidity and wind are good, extremely hot or cold weather will still feel uncomfortable.

---

## Humidity - 30%

Humidity has the second-highest weight.

High humidity can make warm weather feel hotter and uncomfortable, while very low humidity can also feel unpleasant.

Therefore, I gave humidity a weight of 30%.

---

## Wind Speed - 20%

Wind speed has a smaller weight.

A light breeze can improve comfort, but strong winds can reduce comfort.

I decided to give wind speed a weight of 20% because it is useful but usually has less effect than temperature and humidity.

---

## Total Weight

```text
Temperature = 50%
Humidity    = 30%
Wind        = 20%

Total       = 100%
```

I kept the formula simple so it is easy to understand, test, explain, and improve later.

---

# City Ranking

After calculating the Comfort Index for all cities, the backend sorts them in descending order.

```text
Highest Comfort Score
        ↓
Rank #1
Most Comfortable
        ↓
Rank #2
        ↓
...
        ↓
Rank #10
Least Comfortable
```

The frontend receives the already calculated score and rank from the backend.

The frontend does not calculate the Comfort Index.

---

# Weather Data

The city IDs are stored inside:

```text
backend/src/data/cities.json
```

The application processes 10 cities.

The `CityCode` values are used to request weather data from OpenWeatherMap.

Current weather is requested using the OpenWeatherMap current weather API.

Metric units are used:

```text
Temperature → °C
Wind Speed  → m/s
```

The application receives information such as:

- City name
- Weather description
- Temperature
- Humidity
- Wind speed
- Pressure
- Visibility
- Cloudiness

The current Comfort Index uses only:

```text
Temperature
Humidity
Wind Speed
```

---

# 24-Hour Temperature Forecast

I also added a bonus temperature trend feature.

The backend uses the OpenWeatherMap forecast API to get forecast data for the selected city.

OpenWeatherMap provides forecast values in approximately 3-hour intervals.

The application uses the next 8 forecast points:

```text
8 × 3 hours = approximately 24 hours
```

The frontend displays the result as a line chart using Recharts.

The forecast endpoint is:

```text
GET /api/forecast/:cityId
```

This endpoint is protected using Auth0.

---

# Search, Filtering and Sorting

The dashboard includes frontend controls to make the weather data easier to explore.

## City Search

Users can search for a city by name.

Example:

```text
Search: London
```

Only matching cities are displayed.

---

## Temperature Filters

Available filters are:

```text
All temperatures

Cool
Below 18°C

Mild
18°C to 27°C

Warm
Above 27°C
```

These filters only change what is displayed on the frontend.

They do not change the backend Comfort Index or rank.

---

## Sorting Options

Users can sort the displayed cities by:

- Comfort Score
- Temperature - High to Low
- Temperature - Low to High
- City Name - A to Z

The original Comfort Index rank still comes from the backend.

---

# Dark and Light Mode

SkyMetric supports both light and dark themes.

The selected theme is stored in browser local storage so it remains selected after refreshing the page.

### Light Mode

The light theme uses a bright weather-inspired design with:

- Sky colors
- Sun glow effects
- Soft background elements

### Dark Mode

The dark theme uses:

- Dark navy colors
- Stars
- Atmospheric blue effects

The theme changes only the interface appearance and does not affect application functionality.

---

# Caching Design

SkyMetric uses two server-side caches using `node-cache`.

Both caches have a TTL of:

```text
300 seconds
= 5 minutes
```

The two cache layers are:

1. Raw Weather Cache
2. Processed Output Cache

---

## 1. Raw Weather Cache

The raw weather cache stores the original OpenWeatherMap response for each city.

Each city ID is used as a separate cache key.

Example flow:

```text
Request weather for city
        ↓
Check Raw Cache
        ↓
    Is data cached?
      ↙       ↘
    YES       NO
     ↓         ↓
    HIT       MISS
     ↓         ↓
Return      Request data
cached      from OpenWeatherMap
data            ↓
             Save data
             to cache
```

This helps reduce unnecessary requests to OpenWeatherMap.

---

## 2. Processed Output Cache

I also implemented a second cache for the final processed weather response.

The cache key is:

```text
ranked-weather
```

This cached response already contains:

- Weather data
- Comfort Scores
- Sorted cities
- Rank positions

The request flow is:

```text
GET /api/weather
       ↓
Check Processed Cache
       ↓
   Is data cached?
      ↙       ↘
    YES       NO
     ↓         ↓
    HIT       MISS
     ↓         ↓
Return      Check Raw
cached      Weather Cache
response        ↓
            Get weather data
                ↓
          Calculate Comfort Index
                ↓
             Sort cities
                ↓
            Assign ranks
                ↓
       Save processed response
                ↓
             Return
```

This avoids repeatedly calculating scores and sorting the same data during the five-minute cache period.

---

# Cache Debug Endpoint

Cache statistics can be checked through:

```text
GET /api/cache/status
```

This endpoint requires authentication.

Example response:

```json
{
  "rawWeather": {
    "status": "MISS",
    "hits": 0,
    "misses": 10,
    "keys": 10,
    "ttlSeconds": 300
  },
  "processedOutput": {
    "status": "HIT",
    "hits": 5,
    "misses": 1,
    "keys": 1,
    "ttlSeconds": 300
  }
}
```

`rawWeather` shows information about cached OpenWeatherMap responses.

`processedOutput` shows information about the final calculated and ranked response.

Because I use an in-memory cache, all cached data is cleared when the backend restarts.

---

# Authentication and Authorization

SkyMetric uses Auth0 for authentication.

The frontend uses:

```text
@auth0/auth0-react
```

After login, Auth0 provides an access token.

The frontend sends this token to protected backend endpoints using:

```text
Authorization: Bearer <access_token>
```

The Express backend verifies the token using:

```text
express-oauth2-jwt-bearer
```

The backend checks:

- JWT signature
- Auth0 issuer
- API audience

The Auth0 API audience is:

```text
https://api.skymetric
```

---

# Multi-Factor Authentication

MFA is enabled using Auth0.

The configured authentication flow supports verification using:

- Authenticator OTP
- Email MFA for verified users

Public signup is disabled.

Users need to be manually created or whitelisted before they can access the dashboard.

---

# API Endpoints

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/api/health` | Public | Checks whether the backend is running |
| GET | `/api/cities/codes` | Public | Returns configured city codes |
| GET | `/api/weather` | Protected | Returns current weather, Comfort Scores and rankings |
| GET | `/api/cache/status` | Protected | Returns raw and processed cache statistics |
| GET | `/api/forecast/:cityId` | Protected | Returns approximately 24 hours of forecast data |

---

# Environment Variables

Real `.env` files are not committed to Git.

Example environment files are included in the project.

---

## Backend Environment Variables

Create:

```text
backend/.env
```

based on:

```text
backend/.env.example
```

Example:

```env
PORT=5000
FRONTEND_URL=http://localhost:5173

OPENWEATHER_API_KEY=your_openweather_api_key_here

AUTH0_DOMAIN=your_auth0_domain_here
AUTH0_AUDIENCE=https://api.skymetric
```

---

## Frontend Environment Variables

Create:

```text
frontend/.env
```

based on:

```text
frontend/.env.example
```

Example:

```env
VITE_API_BASE_URL=http://localhost:5000

VITE_AUTH0_DOMAIN=your_auth0_domain_here
VITE_AUTH0_CLIENT_ID=your_auth0_client_id_here
VITE_AUTH0_AUDIENCE=https://api.skymetric
```

Do not commit real API keys or sensitive environment values.

---

# Auth0 Local Configuration

For the frontend Auth0 Single Page Application:

```text
Allowed Callback URLs:
http://localhost:5173

Allowed Logout URLs:
http://localhost:5173

Allowed Web Origins:
http://localhost:5173
```

Create an Auth0 API with:

```text
Identifier:
https://api.skymetric

Signing Algorithm:
RS256
```

Public signup should be disabled on the database connection.

---

# Installation and Setup

## Prerequisites

Before running the application, install:

- Node.js
- npm
- Git

You also need:

- An OpenWeatherMap API key
- An Auth0 account

---

## 1. Clone the Repository

```bash
git clone <repository-url>
cd SkyMetric-fidenz
```

---

## 2. Backend Setup

Open a terminal:

```bash
cd backend
npm install
```

Create a `.env` file using `.env.example`.

Then start the backend:

```bash
npm run dev
```

The backend runs at:

```text
http://localhost:5000
```

You can test it using:

```text
http://localhost:5000/api/health
```

---

## 3. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
```

Create a `.env` file using `.env.example`.

Then start the frontend:

```bash
npm run dev
```

The frontend normally runs at:

```text
http://localhost:5173
```

---

# Testing

I used Vitest to test the Comfort Index function.

Run the tests using:

```bash
cd backend
npm test
```

The current tests check:

- Ideal conditions return 100
- High temperature reduces the score
- Uncomfortable humidity reduces the score
- Strong wind reduces the score
- Extreme values remain inside the 0–100 range
- Same input produces the same result

Current test suite:

```text
1 test file
6 tests
6 passed
```

---

# Build and Code Quality

## Backend

Run tests:

```bash
cd backend
npm test
```

Build the TypeScript backend:

```bash
npm run build
```

---

## Frontend

Run ESLint:

```bash
cd frontend
npm run lint
```

Create the production build:

```bash
npm run build
```

---

# Trade-offs I Considered

## 1. Simple Comfort Formula vs Complex Meteorological Formula

I chose a simple weighted heuristic instead of using a complex official comfort model.

### Advantages

- Easy to understand
- Easy to explain
- Easy to test
- Easy to modify
- Predictable results

### Trade-off

The Comfort Index is my own approximation and does not include every factor that affects human comfort.

---

## 2. In-Memory Cache vs Redis

I used `node-cache` because this is a small take-home project and does not need additional infrastructure.

### Advantages

- Simple setup
- Fast
- No external cache server
- Easy to demonstrate

### Trade-off

The cache is lost when the backend restarts.

It also cannot automatically share data between multiple backend instances.

For a larger production system, I would consider using Redis.

---

## 3. Raw Cache + Processed Cache

I used two cache levels.

The raw cache reduces calls to OpenWeatherMap.

The processed cache avoids repeating:

- Comfort Index calculations
- Sorting
- Ranking

### Trade-off

Both cache layers need to use a consistent TTL so the final output does not become too old compared with the raw data.

---

## 4. Parallel API Requests

Weather data for the cities is loaded using `Promise.all()`.

This allows requests to run at the same time instead of waiting for each city one by one.

### Advantage

The total response time is faster.

### Trade-off

If one OpenWeatherMap request fails, the complete batch can currently fail.

A future improvement could use:

```text
Promise.allSettled()
```

to handle partial failures.

---

# Known Limitations

- The Comfort Index is a custom heuristic and not an official meteorological comfort standard.
- The current Comfort Index uses only temperature, humidity, and wind speed.
- The cache is stored in backend memory.
- Cached data is cleared when the backend restarts.
- The cache is not shared between multiple backend instances.
- The application depends on OpenWeatherMap API availability and rate limits.
- Historical weather data is not stored in a database.
- The forecast graph shows short-term forecast data but does not store historical trends.
- If one current-weather request fails inside `Promise.all()`, the entire weather request can fail.

---

# Future Improvements

Some improvements I would consider in the future are:

- Add more weather parameters to the Comfort Index
- Redis-based distributed caching
- Store historical weather data
- Longer-term weather trend graphs
- Better partial API failure handling
- More automated frontend and API tests
- Production deployment configuration

---

# Summary

SkyMetric combines weather data, backend processing, caching, authentication, responsive design, and data visualization in one full-stack application.

The main goal was to keep the solution understandable and structured while also adding some useful bonus features such as dark mode, sorting/filtering, unit tests, and the temperature trend graph.