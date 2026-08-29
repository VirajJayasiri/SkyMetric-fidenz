# SkyMetric

SkyMetric is a secure full-stack weather analytics application that compares live weather conditions across multiple cities and ranks them using a custom **Comfort Index Score**.

The application retrieves live weather data from OpenWeatherMap, calculates each city's comfort score on the backend, ranks cities from most comfortable to least comfortable, caches API responses for five minutes, and protects the dashboard using Auth0 authentication and MFA.

## Features

- Live weather data from OpenWeatherMap
- Processes 10 cities from `cities.json`
- Custom backend Comfort Index from 0–100
- City ranking from most comfortable to least comfortable
- 5-minute server-side weather caching
- Cache HIT / MISS monitoring
- Responsive desktop and mobile dashboard
- Auth0 authentication
- Login and logout flow
- JWT-protected backend API
- Multi-factor authentication
- Public signup disabled
- Whitelisted user access only

## Technology Stack

### Frontend

- React
- TypeScript
- Vite
- Auth0 React SDK
- CSS

### Backend

- Node.js
- Express
- TypeScript
- Axios
- NodeCache
- Auth0 JWT Bearer authentication

### External Services

- OpenWeatherMap API
- Auth0

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
│   │   │   └── comfortIndex.ts
│   │   └── server.ts
│   ├── .env.example
│   └── package.json
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
│   │   └── main.tsx
│   ├── .env.example
│   └── package.json
│
└── README.md
```

## Comfort Index

The Comfort Index is calculated entirely on the backend and produces a score between **0 and 100**.

The current algorithm uses three weather parameters:

| Parameter | Ideal value | Weight |
|---|---:|---:|
| Temperature | 22°C | 50% |
| Humidity | 50% | 30% |
| Wind Speed | 3 m/s | 20% |

### Temperature Score

The algorithm treats approximately **22°C** as the ideal comfortable temperature.

```text
Temperature Score =
100 - |temperature - 22| × 5
```

The result is clamped between 0 and 100.

### Humidity Score

Approximately **50% humidity** is treated as the ideal value.

```text
Humidity Score =
100 - |humidity - 50| × 2
```

The result is also clamped between 0 and 100.

### Wind Score

A light breeze of approximately **3 m/s** is treated as comfortable.

```text
Wind Score =
100 - |windSpeed - 3| × 10
```

The result is clamped between 0 and 100.

### Final Comfort Score

```text
Comfort Index =
Temperature Score × 0.50
+ Humidity Score × 0.30
+ Wind Score × 0.20
```

The final value is rounded to one decimal place.

## Why These Weights?

### Temperature — 50%

Temperature receives the highest weight because it has the strongest direct effect on how comfortable outdoor weather feels.

### Humidity — 30%

Humidity receives the second-highest weight because very high or very low humidity can make otherwise reasonable temperatures feel uncomfortable.

### Wind Speed — 20%

Wind receives a smaller weight because a light breeze can improve comfort, while stronger winds reduce comfort, but it generally has less influence than temperature and humidity.

The weights add up to 100% and keep the formula easy to understand, explain, and modify.

## Ranking

After the Comfort Index has been calculated for every city, the backend sorts the results in descending order:

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

A rank number is then added to each city.

## Caching Design

SkyMetric caches the **raw OpenWeatherMap response for each city** on the backend.

The cache uses `node-cache` with:

```text
TTL: 300 seconds
Duration: 5 minutes
```

Each city ID is used as its cache key.

When weather data is requested:

```text
Request
   ↓
Check cache
   ↓
┌──────────────┐
│ Data exists? │
└──────────────┘
   ↓         ↓
  YES        NO
   ↓          ↓
  HIT       MISS
   ↓          ↓
Return       Call
cached       OpenWeatherMap
data          ↓
              Cache response
```

Caching reduces unnecessary requests to OpenWeatherMap and improves response time for repeated requests.

### Cache Debug Endpoint

Authenticated users can inspect cache statistics using:

```text
GET /api/cache/status
```

Example response:

```json
{
  "status": "HIT",
  "hits": 10,
  "misses": 10,
  "keys": 10,
  "ttlSeconds": 300
}
```

The processed Comfort Index output is recalculated from the cached raw weather data rather than being cached separately.

## Authentication and Authorization

SkyMetric uses Auth0.

The frontend authenticates users using the Auth0 React SDK.

After login, the frontend obtains an Auth0 access token and sends it to the backend:

```text
Authorization: Bearer <access_token>
```

The Express backend validates:

- JWT signature
- Auth0 issuer
- API audience

The API audience used by the application is:

```text
https://api.skymetric
```

Protected endpoints include:

```text
GET /api/weather
GET /api/cache/status
```

Public signup is disabled in Auth0, so users must be created manually/whitelisted.

MFA is enabled, including email-based MFA for verified users.

## Environment Variables

Environment files are excluded from Git.

Use the included `.env.example` files to create local `.env` files.

### Backend

Create:

```text
backend/.env
```

Example:

```env
PORT=5000
OPENWEATHER_API_KEY=your_openweather_api_key_here
AUTH0_DOMAIN=your_auth0_domain_here
AUTH0_AUDIENCE=https://api.skymetric
```

### Frontend

Create:

```text
frontend/.env
```

Example:

```env
VITE_API_BASE_URL=http://localhost:5000
VITE_AUTH0_DOMAIN=your_auth0_domain
VITE_AUTH0_CLIENT_ID=your_auth0_client_id
VITE_AUTH0_AUDIENCE=https://api.skymetric
```

## Auth0 Local Configuration

For the frontend Auth0 Single Page Application, configure:

```text
Allowed Callback URLs:
http://localhost:5173

Allowed Logout URLs:
http://localhost:5173

Allowed Web Origins:
http://localhost:5173
```

Create an Auth0 API using:

```text
Identifier:
https://api.skymetric
```

The SkyMetric frontend application must have user-delegated access to this API.

Public signup should be disabled for the database connection.

## Installation and Setup

### Prerequisites

Install:

- Node.js
- npm
- Git

You also need:

- OpenWeatherMap API key
- Auth0 account

### 1. Clone the repository

```bash
git clone <repository-url>
cd SkyMetric-fidenz
```

### 2. Install backend dependencies

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

and add your OpenWeatherMap and Auth0 values.

Start the backend:

```bash
npm run dev
```

The API runs at:

```text
http://localhost:5000
```

### 3. Install frontend dependencies

Open another terminal:

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

and add the Auth0 configuration.

Start the frontend:

```bash
npm run dev
```

The application normally runs at:

```text
http://localhost:5173
```

## Useful API Endpoints

### Health Check

```text
GET /api/health
```

### City Codes

```text
GET /api/cities/codes
```

### Ranked Weather Data

Requires Auth0 access token:

```text
GET /api/weather
```

### Cache Status

Requires Auth0 access token:

```text
GET /api/cache/status
```

## Build and Code Quality

### Backend

```bash
cd backend
npm run build
```

### Frontend

```bash
cd frontend
npm run lint
npm run build
```

## Trade-offs

### Simple Explainable Comfort Formula

I chose a weighted heuristic instead of a complex meteorological model.

Advantages:

- Easy to understand
- Easy to test
- Easy to explain
- Easy to modify
- Produces deterministic scores

Trade-off:

It does not represent every factor that affects real human comfort.

### In-Memory Cache

`node-cache` was selected because this application is small and does not require distributed storage.

Advantages:

- Very simple implementation
- Fast access
- No external database/cache service required

Trade-off:

The cache is lost when the backend restarts and would not automatically be shared across multiple backend instances.

### Parallel Weather Requests

Weather for the cities is fetched using `Promise.all()`.

This reduces the total wait time compared with requesting each city sequentially.

Trade-off:

If one upstream request fails, the complete batch currently returns an error.

## Known Limitations

- The Comfort Index is a custom heuristic rather than an official meteorological standard.
- It currently uses temperature, humidity, and wind speed only.
- Factors such as precipitation, UV index, dew point, air quality, and perceived temperature are not currently included.
- The cache is stored in backend memory and is reset when the server restarts.
- Processed Comfort Index results are not cached separately.
- Live weather depends on OpenWeatherMap availability and API limits.
- The current application displays current weather only and does not store historical weather data.
- CORS configuration is intended for development and should be restricted to trusted production origins before production deployment.

## Responsive Design

The dashboard supports both desktop and mobile layouts.

On larger screens, city cards use a multi-column layout. On smaller screens, they collapse into a single-column layout for readability.

## Security Notes

- OpenWeatherMap API keys are stored only in backend environment variables.
- Auth0 Client Secret is never exposed to the React frontend.
- `.env` files are excluded from Git.
- Protected API endpoints require valid Auth0 JWT access tokens.
- Public Auth0 signup is disabled.

## Future Improvements

Possible improvements include:

- Dark mode
- Additional Comfort Index parameters
- Historical weather graphs
- Frontend filtering and sorting controls
- Redis-based distributed caching
- Better partial-failure handling for weather API requests
- Additional automated tests