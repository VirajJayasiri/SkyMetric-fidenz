# SkyMetric

SkyMetric is a secure full-stack weather analytics application that compares live weather conditions across multiple cities and ranks them using a custom **Comfort Index Score**.

The application retrieves live weather data from OpenWeatherMap, calculates each city's Comfort Index on the backend, ranks cities from most comfortable to least comfortable, caches both raw and processed weather data for five minutes, and protects the dashboard using Auth0 authentication and multi-factor authentication.

---

## Features

- Live weather data from OpenWeatherMap
- Processes 10 cities from `cities.json`
- Custom backend Comfort Index from 0–100
- City ranking from most comfortable to least comfortable
- Raw weather response caching
- Processed weather response caching
- 5-minute server-side cache TTL
- Cache HIT / MISS monitoring
- Responsive desktop and mobile dashboard
- Auth0 authentication
- Login and logout flow
- JWT-protected backend API
- Multi-factor authentication
- Email-based MFA support
- Public signup disabled
- Whitelisted user access only
- Unit tests for the Comfort Index

---

## Technology Stack

### Frontend

- React
- TypeScript
- Vite
- Auth0 React SDK
- CSS
- Outfit font

### Backend

- Node.js
- Express
- TypeScript
- Axios
- NodeCache
- Auth0 JWT Bearer authentication
- Vitest

### External Services

- OpenWeatherMap API
- Auth0

---

## Project Structure

```text
SkyMetric-fidenz/
├── backend/
│   ├── src/
│   │   ├── data/
│   │   │   └── cities.json
│   │   ├── middleware/
│   │   │   └── auth.ts
│   │   ├── services/
│   │   │   └── cacheService.ts
│   │   ├── utils/
│   │   │   ├── comfortIndex.ts
│   │   │   └── comfortIndex.test.ts
│   │   └── server.ts
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   └── WeatherCard.tsx
│   │   ├── services/
│   │   │   └── weatherApi.ts
│   │   ├── types/
│   │   │   └── weather.ts
│   │   ├── App.tsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.tsx
│   ├── .env.example
│   └── package.json
│
└── README.md
```

---

## Comfort Index

The Comfort Index is calculated entirely on the backend and produces a numerical score between **0 and 100**.

The current algorithm uses three weather parameters:

| Parameter | Ideal Value | Weight |
|---|---:|---:|
| Temperature | 22°C | 50% |
| Humidity | 50% | 30% |
| Wind Speed | 3 m/s | 20% |

Each individual parameter score is clamped between `0` and `100`.

---

### Temperature Score

Approximately **22°C** is treated as the ideal comfortable temperature.

```text
Temperature Score =
100 - |temperature - 22| × 5
```

Temperatures further away from 22°C receive lower scores.

---

### Humidity Score

Approximately **50% humidity** is treated as the ideal humidity level.

```text
Humidity Score =
100 - |humidity - 50| × 2
```

Very high or very low humidity reduces the score.

---

### Wind Score

A light breeze of approximately **3 m/s** is treated as comfortable.

```text
Wind Score =
100 - |windSpeed - 3| × 10
```

Wind speeds that differ significantly from this value receive lower scores.

---

### Final Comfort Score

The final weighted Comfort Index is calculated as:

```text
Comfort Index =
Temperature Score × 0.50
+ Humidity Score × 0.30
+ Wind Score × 0.20
```

The final value is rounded to one decimal place.

---

## Why These Weights?

### Temperature — 50%

Temperature receives the highest weight because it has the strongest direct effect on how comfortable outdoor weather feels.

A location that is significantly too hot or too cold will usually feel uncomfortable even if its humidity and wind conditions are reasonable.

### Humidity — 30%

Humidity receives the second-highest weight.

Very high humidity can make warm weather feel hotter and less comfortable, while very low humidity may also feel unpleasant.

### Wind Speed — 20%

Wind speed receives a smaller weight.

A light breeze can improve outdoor comfort, while excessive wind can reduce comfort. However, wind generally has less influence than temperature and humidity in this simplified model.

The weights add up to:

```text
50% + 30% + 20% = 100%
```

This keeps the formula simple, deterministic, explainable, and easy to extend.

---

## Ranking

After the Comfort Index has been calculated for every city, the backend sorts the cities by Comfort Index in descending order.

```text
Highest Comfort Score
        ↓
Most Comfortable City
        ↓
...
        ↓
Lowest Comfort Score
        ↓
Least Comfortable City
```

A rank number is then assigned to each city.

For example:

```text
Rank #1 → Highest Comfort Index
Rank #2 → Second highest
...
Rank #10 → Lowest Comfort Index
```

---

## Weather Data

City codes are loaded from:

```text
backend/src/data/cities.json
```

The application processes 10 cities.

Each `CityCode` is used to request current weather data from OpenWeatherMap.

The backend uses metric units so temperatures are returned in degrees Celsius.

Relevant weather information includes:

- City name
- Weather description
- Temperature
- Humidity
- Wind speed
- Pressure
- Visibility
- Cloudiness

The current Comfort Index uses temperature, humidity, and wind speed.

---

## Caching Design

SkyMetric uses two server-side cache layers with `node-cache`.

Both caches use a **5-minute / 300-second TTL**.

The two cache layers are:

1. Raw Weather Cache
2. Processed Output Cache

---

### 1. Raw Weather Cache

The raw cache stores the original OpenWeatherMap response for each city.

Each city ID is used as the cache key.

```text
Request city weather
        ↓
Check raw cache
        ↓
   ┌─────────┐
   │ Exists? │
   └─────────┘
      ↓   ↓
     YES  NO
      ↓    ↓
     HIT  MISS
      ↓    ↓
   Return   Call
   cached   OpenWeatherMap
   data       ↓
           Cache response
```

If the raw response is already cached, another OpenWeatherMap request is not required.

This reduces unnecessary external API requests.

---

### 2. Processed Output Cache

SkyMetric also caches the final response returned by:

```text
GET /api/weather
```

The processed response contains:

- Weather information
- Comfort Index scores
- Sorted city results
- Rank positions

The processed cache uses:

```text
ranked-weather
```

as its cache key.

The complete request flow is:

```text
/api/weather
      ↓
Check processed cache
      ↓
 ┌──────────────┐
 │ Cache exists?│
 └──────────────┘
     ↓       ↓
    YES      NO
     ↓        ↓
    HIT      MISS
     ↓        ↓
 Return     Check raw
 cached     weather cache
 result        ↓
           Fetch missing
           weather data
               ↓
        Calculate Comfort Index
               ↓
          Sort results
               ↓
           Add ranks
               ↓
      Cache processed response
               ↓
            Return
```

This second cache avoids repeatedly:

- Calculating Comfort Index values
- Sorting cities
- Assigning ranks
- Rebuilding the final response

when the same data is requested again within five minutes.

---

### Cache Duration

Both cache layers use:

```text
TTL: 300 seconds
Duration: 5 minutes
```

The caches are stored in backend memory.

Therefore, restarting the backend clears both caches.

---

### Cache Debug Endpoint

Authenticated users can inspect cache statistics using:

```text
GET /api/cache/status
```

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
    "hits": 4,
    "misses": 1,
    "keys": 1,
    "ttlSeconds": 300
  }
}
```

The `rawWeather` section reports statistics for cached OpenWeatherMap responses.

The `processedOutput` section reports statistics for the final calculated, sorted, and ranked response.

---

## Authentication and Authorization

SkyMetric uses **Auth0** for authentication and authorization.

Only authenticated users are allowed to access the Comfort Index dashboard.

The frontend uses the Auth0 React SDK.

After login, the frontend obtains an Auth0 access token.

The access token is sent to protected backend routes using:

```text
Authorization: Bearer <access_token>
```

The backend validates the token using Auth0 JWT Bearer authentication.

Validation includes:

- JWT signature
- Auth0 issuer
- API audience

The API audience is:

```text
https://api.skymetric
```

---

## Protected API Endpoints

The following routes require a valid Auth0 access token:

```text
GET /api/weather
GET /api/cache/status
```

The health endpoint remains public:

```text
GET /api/health
```

---

## Multi-Factor Authentication

MFA is enabled through Auth0.

The application supports:

- Authenticator-based MFA
- Email-based MFA for verified users

Public signup is disabled.

Users must be manually created or whitelisted before they can log in.

---

## Environment Variables

Real environment files are excluded from Git.

The project provides `.env.example` files containing placeholder values.

---

### Backend Environment Variables

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
OPENWEATHER_API_KEY=your_openweather_api_key_here
AUTH0_DOMAIN=your_auth0_domain_here
AUTH0_AUDIENCE=https://api.skymetric
```

Never commit the real OpenWeatherMap API key.

---

### Frontend Environment Variables

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
VITE_AUTH0_DOMAIN=your_auth0_domain
VITE_AUTH0_CLIENT_ID=your_auth0_client_id
VITE_AUTH0_AUDIENCE=https://api.skymetric
```

---

## Auth0 Local Configuration

Create an Auth0 **Single Page Application** for the React frontend.

Configure:

```text
Allowed Callback URLs:
http://localhost:5173

Allowed Logout URLs:
http://localhost:5173

Allowed Web Origins:
http://localhost:5173
```

Create an Auth0 API using the identifier:

```text
https://api.skymetric
```

The frontend application must be authorized to request access tokens for this API.

Public signup should be disabled for the database connection.

Users who need access should be created manually.

---

## Installation and Setup

### Prerequisites

Install:

- Node.js
- npm
- Git

You will also need:

- OpenWeatherMap account and API key
- Auth0 account

---

### 1. Clone the Repository

```bash
git clone <repository-url>
cd SkyMetric-fidenz
```

---

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

Copy:

```text
.env.example
```

to:

```text
.env
```

Add the required OpenWeatherMap and Auth0 values.

Start the development server:

```bash
npm run dev
```

The backend runs at:

```text
http://localhost:5000
```

Test the health endpoint:

```text
http://localhost:5000/api/health
```

---

### 3. Install Frontend Dependencies

Open a second terminal.

```bash
cd frontend
npm install
```

Copy:

```text
.env.example
```

to:

```text
.env
```

Add the required Auth0 configuration.

Start the frontend:

```bash
npm run dev
```

The frontend normally runs at:

```text
http://localhost:5173
```

---

## API Endpoints

### Health Check

```text
GET /api/health
```

Authentication:

```text
Not required
```

---

### City Codes

```text
GET /api/cities/codes
```

Returns the city IDs loaded from `cities.json`.

---

### Ranked Weather Data

```text
GET /api/weather
```

Authentication:

```text
Required
```

Returns weather information, Comfort Index scores, and rankings.

---

### Cache Status

```text
GET /api/cache/status
```

Authentication:

```text
Required
```

Returns raw and processed cache statistics.

---

## Unit Tests

The Comfort Index function is tested using **Vitest**.

Current tests cover:

- Ideal weather conditions returning a score of 100
- Uncomfortable temperature reducing the score
- Uncomfortable humidity reducing the score
- Uncomfortable wind speed reducing the score
- Extreme values remaining within the 0–100 range
- Deterministic output for identical input values

Run the tests using:

```bash
cd backend
npm test
```

Current test result:

```text
Test Files: 1 passed
Tests:      6 passed
```

---

## Build and Code Quality

### Backend

Run unit tests:

```bash
cd backend
npm test
```

Build the TypeScript backend:

```bash
npm run build
```

---

### Frontend

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

## Responsive Design

The dashboard supports desktop and mobile layouts.

On larger screens, weather cards are displayed using a multi-column layout.

On smaller screens, cards collapse into a single-column layout to maintain readability and usability.

The layout was designed to remain usable on mobile screen sizes without horizontal scrolling.

---

## Trade-offs

### Simple and Explainable Comfort Formula

I chose a weighted heuristic instead of implementing a complex meteorological or physiological comfort model.

Advantages:

- Easy to understand
- Easy to test
- Easy to explain
- Deterministic
- Easy to modify
- Easy to add additional weather parameters

Trade-off:

The score is a custom approximation and does not represent every factor that affects real human comfort.

---

### In-Memory Caching

`node-cache` was selected because the application is small and does not require distributed cache storage.

Advantages:

- Fast
- Simple implementation
- No additional infrastructure
- No external cache database required

Trade-off:

The cache is lost whenever the backend process restarts.

It also would not automatically be shared between multiple backend instances.

For a larger production system, a distributed cache such as Redis could be considered.

---

### Two-Level Cache Strategy

The application caches both raw weather data and the final processed response.

Advantages:

- Reduces OpenWeatherMap requests
- Avoids unnecessary Comfort Index calculations
- Avoids repeated sorting and ranking
- Improves repeated request response time

Trade-off:

Both cache layers must remain consistent with the same TTL strategy.

---

### Parallel Weather Requests

Weather for all cities is retrieved using `Promise.all()`.

This allows requests to run concurrently rather than sequentially.

Advantages:

- Faster total response time
- Better user experience

Trade-off:

If one upstream weather request fails, the complete batch currently returns an error.

A larger production implementation could use partial-failure handling such as `Promise.allSettled()`.

---

## Known Limitations

- The Comfort Index is a custom heuristic rather than an official meteorological comfort standard.
- The current Comfort Index uses temperature, humidity, and wind speed only.
- Other factors such as visibility, cloudiness, precipitation, UV index, air quality, dew point, and perceived temperature could also affect real-world comfort.
- Both cache layers are stored in backend memory.
- Cache contents are lost when the backend restarts.
- The cache is not shared across multiple backend instances.
- Live weather depends on OpenWeatherMap availability and API limits.
- The application currently displays current weather only.
- Historical weather data is not stored.
- Historical weather trend graphs are not currently implemented.
- If one OpenWeatherMap request fails, the complete weather request currently fails.
- Production CORS configuration should be restricted to trusted production origins.

---

## Security Notes

- OpenWeatherMap API keys are stored only in backend environment variables.
- Real `.env` files are excluded from Git.
- The Auth0 Client Secret is never exposed to the React frontend.
- Protected API endpoints require valid Auth0 JWT access tokens.
- Public Auth0 signup is disabled.
- Only manually created or whitelisted users can access the dashboard.
- MFA is enabled through Auth0.

---

## Future Improvements

Possible future improvements include:

- Dark mode
- Additional Comfort Index parameters
- Historical weather graphs
- Frontend sorting and filtering controls
- Redis-based distributed caching
- Partial-failure handling for external weather requests
- Expanded automated test coverage
- Production deployment configuration