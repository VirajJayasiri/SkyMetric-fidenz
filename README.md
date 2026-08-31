# SkyMetric

SkyMetric is a full-stack weather analytics application that compares live weather conditions across different cities and ranks them using a custom **Comfort Index Score**.

I developed this project as part of the **Fidenz Trainee Software Engineer - Full Stack Assignment**.

The application gets current weather data from OpenWeatherMap, calculates the Comfort Index on the backend, ranks cities from the most comfortable to the least comfortable, and displays the results through a responsive dashboard.

I also implemented authentication with Auth0, Multi-Factor Authentication (MFA), server-side caching, dark/light themes, searching, filtering, sorting, unit tests, weather insights, and a 24-hour temperature forecast graph.

---

## Features

### Main Features

- Live weather data from OpenWeatherMap
- Reads city codes from `cities.json`
- Processes 10 cities
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
- Responsive desktop, tablet, and mobile design

### Authentication

- Auth0 login and logout
- JWT-protected backend endpoints
- Multi-Factor Authentication (MFA)
- Email-based MFA support
- Public signup disabled
- Only manually created / whitelisted users can access the dashboard

### Caching

- Raw OpenWeatherMap responses cached for 5 minutes
- Processed ranked weather response cached for 5 minutes
- Cache HIT / MISS tracking
- Protected cache status endpoint

### Bonus Features

- Dark mode and light mode
- Theme preference saved in local storage
- City search
- Temperature filtering
- Multiple sorting options
- Comfort Index unit tests
- 24-hour temperature forecast graph
- Weather insight cards
- Animated weather backgrounds
- Smooth UI transitions and micro-interactions
- Responsive custom dropdown controls

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
│   │   │   ├── ResponsiveSelect.tsx
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

The main processing part of SkyMetric is the custom **Comfort Index**.

The Comfort Index is calculated completely on the backend and gives each city a score between:

```text
0   = Very uncomfortable
100 = Very comfortable
```

The current algorithm uses three weather parameters:

| Parameter | Ideal Value | Weight |
|---|---:|---:|
| Temperature | 22°C | 50% |
| Humidity | 50% | 30% |
| Wind Speed | 3 m/s | 20% |

Each individual parameter score is clamped between `0` and `100`.

---

## Temperature Score

I considered approximately **22°C** as a comfortable outdoor temperature.

```text
Temperature Score =
100 - |temperature - 22| × 5
```

The result is clamped between:

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

I considered approximately **3 m/s** as a comfortable light breeze.

```text
Wind Score =
100 - |windSpeed - 3| × 10
```

Wind speeds that are much lower or higher than the ideal value reduce the score.

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

Even if humidity and wind are good, extremely hot or cold weather can still feel uncomfortable.

---

## Humidity - 30%

Humidity has the second-highest weight.

High humidity can make warm temperatures feel hotter and less comfortable, while very low humidity can also feel unpleasant.

For this reason, I gave humidity a weight of 30%.

---

## Wind Speed - 20%

Wind speed has the smallest weight in the current formula.

A light breeze can improve comfort, but strong wind can make outdoor conditions uncomfortable.

I gave wind speed a weight of 20% because it is important, but usually has less influence than temperature and humidity.

---

## Total Weight

```text
Temperature = 50%
Humidity    = 30%
Wind Speed  = 20%

Total       = 100%
```

I kept the formula simple so it is easy to understand, test, explain, and extend later.

---

# City Ranking

After calculating the Comfort Index for all cities, the backend sorts the cities in descending order.

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

The frontend receives the calculated `comfortScore` and `rank` from the backend.

The frontend does not calculate the Comfort Index.

---

# Weather Data

City IDs are stored in:

```text
backend/src/data/cities.json
```

The application processes 10 cities.

The `CityCode` values are used to request current weather data from OpenWeatherMap.

The backend requests weather using metric units:

```text
Temperature → °C
Wind Speed  → m/s
```

The application receives weather information including:

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

I added a temperature trend graph as a bonus feature.

The backend uses the OpenWeatherMap forecast API to get forecast information for a selected city.

OpenWeatherMap provides forecast data in approximately 3-hour intervals.

SkyMetric uses the next 8 forecast points:

```text
8 × 3 hours ≈ 24 hours
```

The frontend displays the temperatures as a line graph using **Recharts**.

The forecast endpoint is:

```text
GET /api/forecast/:cityId
```

This endpoint is protected using Auth0.

---

# Search, Filtering and Sorting

The dashboard contains frontend controls to make the city data easier to explore.

## City Search

Users can search for a city by name.

Example:

```text
Search: London
```

Only matching cities are displayed.

---

## Temperature Filters

The available temperature filters are:

```text
All temperatures

Cool
Below 18°C

Mild
18°C to 27°C

Warm
Above 27°C
```

Filtering only changes the cities displayed on the frontend.

It does not change the backend Comfort Index or original rank.

---

## Sorting Options

Users can sort displayed cities by:

- Comfort Score
- Temperature - High to Low
- Temperature - Low to High
- City Name - A to Z

The original Comfort Index rank still comes from the backend.

---

# Dark and Light Mode

SkyMetric supports both light and dark themes.

The selected theme is stored in browser local storage so the preferred theme remains selected after refreshing the application.

## Light Mode

The light theme uses:

- Sky-inspired colors
- Sun glow effects
- Soft atmospheric backgrounds
- Light glass-style panels

## Dark Mode

The dark theme uses:

- Dark navy colors
- Star effects
- Subtle blue atmospheric effects
- Dark glass-style panels

Changing the theme only affects the interface appearance and does not affect application functionality.

---

# Caching Design

SkyMetric uses two server-side cache layers with `node-cache`.

Both caches use the same TTL:

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

```text
Request city weather
        ↓
Check Raw Cache
        ↓
   Is data cached?
      ↙       ↘
    YES       NO
     ↓         ↓
    HIT       MISS
     ↓         ↓
Return      Request from
cached      OpenWeatherMap
data            ↓
             Store in
              cache
```

This reduces unnecessary calls to OpenWeatherMap.

---

## 2. Processed Output Cache

I also implemented a second cache for the final processed response.

The processed cache uses the key:

```text
ranked-weather
```

This response already contains:

- Weather data
- Comfort Scores
- Sorted city results
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
            Get weather
               data
                ↓
        Calculate Comfort
              Index
                ↓
            Sort cities
                ↓
            Assign ranks
                ↓
        Store processed
             response
                ↓
             Return
```

This avoids repeatedly calculating Comfort Scores, sorting cities, and assigning ranks during the five-minute cache period.

---

# Cache Debug Endpoint

Cache information can be checked using:

```text
GET /api/cache/status
```

This endpoint requires authentication.

Example:

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

`processedOutput` shows information about the final calculated, sorted, and ranked response.

Because this project uses an in-memory cache, all cached data is cleared when the backend restarts.

---

# Authentication and Authorization

SkyMetric uses **Auth0** for authentication and authorization.

The frontend uses:

```text
@auth0/auth0-react
```

After login, Auth0 provides an access token.

The frontend sends this access token to protected backend endpoints:

```text
Authorization: Bearer <access_token>
```

The Express backend validates the JWT using:

```text
express-oauth2-jwt-bearer
```

The backend validates:

- JWT signature
- Auth0 issuer
- API audience

The API audience used by SkyMetric is:

```text
https://api.skymetric
```

---

# Multi-Factor Authentication

MFA is configured through Auth0.

The authentication flow supports:

- Authenticator OTP
- Email MFA for verified users

Public signup is disabled.

Users need to be manually created / whitelisted before they can access the dashboard.

---

# API Endpoints

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/api/health` | Public | Checks whether the backend is running |
| GET | `/api/cities/codes` | Public | Returns configured city codes |
| GET | `/api/weather` | Protected | Returns current weather, Comfort Scores, and rankings |
| GET | `/api/cache/status` | Protected | Returns raw and processed cache information |
| GET | `/api/forecast/:cityId` | Protected | Returns approximately 24 hours of forecast data |

---

# Environment Variables

Real `.env` files are not committed to Git.

The repository includes `.env.example` files to show the required variables.

---

## Backend Environment Variables

Create:

```text
backend/.env
```

using:

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

using:

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

Do not commit real API keys, access tokens, or sensitive environment values.

---

# Auth0 Local Configuration

Create an Auth0 **Single Page Application** for the frontend.

Use the following local development URLs:

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

Users who need access should be manually created.

---

# Installation and Setup

## Prerequisites

Before running the application, install:

- Node.js
- npm
- Git

You also need:

- OpenWeatherMap account and API key
- Auth0 account

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

Create a `.env` file based on `.env.example` and add your OpenWeatherMap and Auth0 configuration.

Start the backend:

```bash
npm run dev
```

The backend runs at:

```text
http://localhost:5000
```

The health endpoint can be checked at:

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

Create a `.env` file based on `.env.example` and add your Auth0 configuration.

Start the frontend:

```bash
npm run dev
```

The frontend normally runs at:

```text
http://localhost:5173
```

---

# Testing

I used **Vitest** to test the Comfort Index function.

Run the tests using:

```bash
cd backend
npm test
```

The current tests check:

- Ideal conditions return a score of 100
- Uncomfortable temperature reduces the score
- Uncomfortable humidity reduces the score
- Uncomfortable wind speed reduces the score
- Extreme values remain within the 0–100 range
- The same inputs produce the same result

Current test suite:

```text
1 test file
6 tests
6 passed
```

---

# Build and Code Quality

## Backend

Run the tests:

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

Build the frontend:

```bash
npm run build
```

---

# Trade-offs I Considered

## 1. Simple Comfort Formula vs Complex Meteorological Formula

I chose a simple weighted heuristic instead of using a complex official meteorological comfort model.

### Advantages

- Easy to understand
- Easy to explain
- Easy to test
- Easy to modify
- Predictable output

### Trade-off

The Comfort Index is my own approximation and does not include every possible factor that affects human comfort.

---

## 2. In-Memory Cache vs Redis

I used `node-cache` because this is a small take-home project and does not need additional infrastructure.

### Advantages

- Simple setup
- Fast
- No external cache server
- Easy to test and demonstrate

### Trade-off

The cache is lost when the backend restarts.

It also cannot automatically share cached data between multiple backend instances.

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

Both caches need to use a consistent TTL so processed data does not become older than the raw weather data.

---

## 4. Parallel API Requests

Weather data for all cities is loaded using `Promise.all()`.

This allows requests to happen at the same time instead of waiting for every city one by one.

### Advantage

The overall response time is faster.

### Trade-off

If one OpenWeatherMap request fails, the complete batch can currently fail.

A possible future improvement would be:

```text
Promise.allSettled()
```

to support partial failures.

---

# Known Limitations

- The Comfort Index is a custom heuristic and is not an official meteorological comfort standard.
- The current Comfort Index uses temperature, humidity, and wind speed only.
- Both cache layers are stored in backend memory.
- Cached data is cleared when the backend restarts.
- Cached data is not shared between multiple backend instances.
- The application depends on OpenWeatherMap API availability and rate limits.
- Historical weather data is not stored in a database.
- The forecast graph shows short-term forecast data but does not store historical trends.
- If one current-weather request fails inside `Promise.all()`, the complete weather request can fail.

---

# Future Improvements

Some improvements I would consider in the future are:

- Add additional weather parameters to the Comfort Index
- Use Redis for distributed caching
- Store historical weather data
- Add longer-term weather trend graphs
- Improve partial API failure handling
- Add more frontend and API automated tests
- Add production deployment configuration

---

# Summary

SkyMetric combines live weather data, backend processing, caching, authentication, responsive UI design, and data visualization in one full-stack application.

My main goal was to keep the solution understandable and well structured while also implementing useful bonus features such as dark mode, sorting and filtering, unit tests, responsive custom controls, and the temperature trend graph.