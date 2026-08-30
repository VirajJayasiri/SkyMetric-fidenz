# SkyMetric

SkyMetric is a secure full-stack weather analytics application that compares live weather conditions across multiple cities and ranks them using a custom **Comfort Index Score**.

The application retrieves live weather data from OpenWeatherMap, calculates each city's Comfort Index on the backend, ranks cities from most comfortable to least comfortable, provides 24-hour temperature forecast trend charts, caches both raw and processed weather data for five minutes, and protects the dashboard using Auth0 authentication and multi-factor authentication.

---

## Features

- **Live Weather Data**: Real-time weather fetched from OpenWeatherMap for 10 cities defined in `cities.json`.
- **Custom Comfort Index**: Backend algorithm scoring cities on a scale from 0 to 100 based on temperature, humidity, and wind speed.
- **City Ranking**: Automatic sorting and ranking from "Most Comfortable" (Rank #1) to "Least Comfortable".
- **24-Hour Temperature Forecast Graph**: Interactive line chart displaying upcoming 24-hour temperature trends for any selected city using Recharts.
- **Raw Weather Response Caching**: In-memory caching of raw OpenWeatherMap API responses for 5 minutes (300 seconds) per city.
- **Processed Output Caching**: In-memory caching of the final calculated, sorted, and ranked weather data for 5 minutes (300 seconds).
- **Cache HIT / MISS Monitoring**: Protected debug endpoint (`/api/cache/status`) reporting real-time cache statistics and hit/miss statuses.
- **Dark Mode & Light Mode**: Seamless theme switching with local storage persistence and full dark mode support across login and dashboard screens.
- **City Search**: Real-time frontend search filtering cities by name.
- **Temperature Filtering**: Instant filtering by temperature category (All, Cool <15°C, Mild 15°C–25°C, Warm >25°C).
- **Frontend Sorting**: Multi-criteria sorting by Comfort Score, Temperature (High to Low), Temperature (Low to High), and Alphabetical (City Name).
- **Auth0 Authentication**: Secure login/logout flow with JWT Bearer token authorization on protected backend endpoints.
- **Multi-Factor Authentication (MFA)**: Support for email and authenticator-based verification.
- **Restricted Signup**: Public registration disabled; only authorized/whitelisted users can access the dashboard.
- **Responsive Design**: Clean, modern interface designed for desktop, tablet, and mobile layouts.
- **Unit Tests**: Automated unit test suite for the Comfort Index algorithm powered by Vitest.

---

## Technology Stack

### Frontend

- **React**: Component-based UI library
- **TypeScript**: Static typing for reliability and maintainability
- **Vite**: Next-generation frontend build tool and dev server
- **Auth0 React SDK**: Authentication and token management
- **Recharts**: Composable charting library for the 24-hour forecast graph
- **CSS**: Custom vanilla CSS design system with CSS custom properties (variables)
- **Outfit**: Modern typography from Google Fonts

### Backend

- **Node.js**: JavaScript runtime environment
- **Express**: Web framework for building REST APIs
- **TypeScript**: Strongly-typed backend development
- **Axios**: HTTP client for OpenWeatherMap API calls
- **NodeCache**: Fast in-memory caching engine
- **Auth0 JWT Bearer**: JWT validation middleware using `express-oauth2-jwt-bearer`
- **Vitest**: Unit testing framework

### External Services

- **OpenWeatherMap API**: Current weather and 5-day / 3-hour forecast data
- **Auth0**: Identity platform for authentication, MFA, and user management

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
│   │   └── skymetric-icon.png
│   ├── src/
│   │   ├── components/
│   │   │   ├── TemperatureTrendChart.tsx
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
│   ├── package.json
│   └── tsconfig.json
│
└── README.md
```

---

## Comfort Index Algorithm

The Comfort Index is calculated entirely on the backend and produces a numerical score between **0 and 100**.

The algorithm evaluates three key meteorological parameters:

| Parameter | Ideal Value | Weight |
|---|---:|---:|
| Temperature | 22°C | 50% |
| Humidity | 50% | 30% |
| Wind Speed | 3 m/s | 20% |

Each individual parameter score is clamped between `0` and `100`.

---

### Parameter Formulas

#### 1. Temperature Score (50% Weight)
Approximately **22°C** is treated as the ideal comfortable temperature.

$$\text{Temperature Score} = \text{clamp}(100 - |\text{temperature} - 22| \times 5, 0, 100)$$

Temperatures deviating from 22°C lose points linearly (5 points per degree Celsius).

#### 2. Humidity Score (30% Weight)
Approximately **50% relative humidity** is treated as the ideal humidity level.

$$\text{Humidity Score} = \text{clamp}(100 - |\text{humidity} - 50| \times 2, 0, 100)$$

High humidity (causing mugginess) and low humidity (causing dryness) reduce the score by 2 points per percentage deviation.

#### 3. Wind Score (20% Weight)
A gentle breeze around **3 m/s** is considered comfortable.

$$\text{Wind Score} = \text{clamp}(100 - |\text{windSpeed} - 3| \times 10, 0, 100)$$

Stagnant air or strong winds reduce the score by 10 points per m/s deviation.

---

### Final Comfort Score

The final weighted Comfort Index is calculated as:

$$\text{Comfort Index} = (\text{Temperature Score} \times 0.50) + (\text{Humidity Score} \times 0.30) + (\text{Wind Score} \times 0.20)$$

The final value is rounded to one decimal place.

---

## Reasoning Behind Variable Weights

- **Temperature (50%)**: Temperature has the strongest physiological impact on outdoor comfort. Extremes in temperature immediately make an environment uncomfortable regardless of humidity or wind.
- **Humidity (30%)**: Humidity significantly influences how temperature is perceived (e.g., heat index and evaporative cooling). High humidity amplifies heat discomfort, while low humidity causes irritation.
- **Wind Speed (20%)**: Wind provides beneficial air circulation at moderate speeds, but excessive wind creates chill or disruption. It receives a moderate weight to reflect its supporting role in comfort perception.

The weights sum to $100\%$ ($0.50 + 0.30 + 0.20 = 1.00$), ensuring a normalized 0–100 scale that is transparent, deterministic, and easy to extend.

---

## City Ranking

After calculating the Comfort Index for each city, the backend sorts all cities in descending order:

```text
Highest Comfort Score  ──►  Rank #1 (Most Comfortable)
       ↓
Intermediate Scores    ──►  Rank #2 ... Rank #9
       ↓
Lowest Comfort Score   ──►  Rank #10 (Least Comfortable)
```

Each city object includes its calculated `comfortScore` and assigned `rank`.

---

## Weather Data & Forecasts

1. **City Extraction**: City IDs and names are extracted from `backend/src/data/cities.json` (10 cities across global regions).
2. **Current Weather Retrieval**: Fetched from OpenWeatherMap `2.5/weather` in metric units (°C, m/s).
3. **24-Hour Forecast Retrieval**: Fetched from OpenWeatherMap `2.5/forecast` returning 8 consecutive 3-hour forecast intervals (24 hours total) and rendered via Recharts in the interactive forecast section.

---

## Caching Design

SkyMetric implements a two-tier in-memory caching architecture using `node-cache`. Both layers use a **5-minute (300-second) TTL**.

```text
                     Client Request: GET /api/weather
                                   │
                                   ▼
                   ┌───────────────────────────────┐
                   │  Check Processed Cache Layer  │
                   │    (Key: "ranked-weather")    │
                   └───────────────┬───────────────┘
                                   │
                     ┌─────────────┴─────────────┐
                     │                           │
                 [Cache HIT]                 [Cache MISS]
                     │                           │
                     ▼                           ▼
            Return Cached JSON        ┌─────────────────────┐
            (No computation)          │ Check Raw City Cache │
                                      │ (Key: cityId)        │
                                      └──────────┬──────────┘
                                                 │
                                   ┌─────────────┴─────────────┐
                                   │                           │
                               [Cache HIT]                 [Cache MISS]
                                   │                           │
                                   ▼                           ▼
                             Use Cached Raw          Fetch from OpenWeather
                                   │                           │
                                   └─────────────┬─────────────┘
                                                 │
                                                 ▼
                                     Compute Comfort Index
                                                 │
                                                 ▼
                                        Sort & Assign Ranks
                                                 │
                                                 ▼
                                      Save to Processed Cache
                                                 │
                                                 ▼
                                        Return Response
```

### 1. Raw Weather Cache
- **Key**: Individual `cityId` (e.g., `"2172797"`)
- **TTL**: 300 seconds (5 minutes)
- **Purpose**: Prevents redundant external HTTP calls to OpenWeatherMap when individual city data is refreshed.

### 2. Processed Output Cache
- **Key**: `"ranked-weather"`
- **TTL**: 300 seconds (5 minutes)
- **Purpose**: Stores the pre-calculated, sorted, and ranked list of all cities. Bypasses Comfort Index computations, array sorting, and response packaging entirely on repeated requests.

> **Note**: Both caches are stored in backend memory and reset whenever the backend server process restarts. Caches are not shared across multiple backend instances.

### Cache Status Debug Endpoint
Authenticated clients can inspect real-time cache performance:

`GET /api/cache/status`

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

---

## Authentication and Authorization

SkyMetric uses **Auth0** to secure the application.

1. **Frontend Flow**: The React application uses `@auth0/auth0-react` to handle user login, logout, and token acquisition.
2. **Backend Protection**: Express routes use `express-oauth2-jwt-bearer` middleware to validate incoming JWTs:
   - Token signature verification
   - Issuer verification (`AUTH0_DOMAIN`)
   - Audience verification (`AUTH0_AUDIENCE`: `https://api.skymetric`)
3. **Multi-Factor Authentication (MFA)**: Configured in Auth0 to enforce email or authenticator verification during login.
4. **Restricted Signups**: Public user registration is disabled; only whitelisted accounts can access the application.

---

## API Endpoints

| Method | Endpoint | Authentication | Description |
|---|---|:---:|---|
| `GET` | `/api/health` | Public | Health check indicating backend status. |
| `GET` | `/api/cities/codes` | Public | Returns the list of configured city codes. |
| `GET` | `/api/weather` | **Protected** (Auth0 JWT) | Returns calculated weather data, Comfort Scores, and rankings. |
| `GET` | `/api/cache/status` | **Protected** (Auth0 JWT) | Returns hit/miss stats and status for raw and processed caches. |
| `GET` | `/api/forecast/:cityId` | **Protected** (Auth0 JWT) | Returns 24-hour temperature forecast points for a given city ID. |

---

## Environment Variables

### Backend (`backend/.env`)

Copy `backend/.env.example` to `backend/.env`:

```env
PORT=5000
FRONTEND_URL=http://localhost:5173
OPENWEATHER_API_KEY=your_openweather_api_key_here
AUTH0_DOMAIN=your_auth0_domain_here
AUTH0_AUDIENCE=https://api.skymetric
```

### Frontend (`frontend/.env`)

Copy `frontend/.env.example` to `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000
VITE_AUTH0_DOMAIN=your_auth0_domain_here
VITE_AUTH0_CLIENT_ID=your_auth0_client_id_here
VITE_AUTH0_AUDIENCE=https://api.skymetric
```

---

## Auth0 Configuration Guide

1. **Create Single-Page Application (SPA)**:
   - **Allowed Callback URLs**: `http://localhost:5173`
   - **Allowed Logout URLs**: `http://localhost:5173`
   - **Allowed Web Origins**: `http://localhost:5173`
2. **Create API**:
   - **Identifier**: `https://api.skymetric`
   - **Signing Algorithm**: `RS256`
3. **MFA Configuration**:
   - Enable Multi-Factor Authentication (Email / OTP) under Security settings.
4. **Disable Signups**:
   - Under Authentication > Database > Disable Sign Ups.

---

## Installation and Setup

### Prerequisites
- Node.js (v18+)
- npm
- OpenWeatherMap API Key
- Auth0 Account

### 1. Clone the Repository
```bash
git clone <repository-url>
cd SkyMetric-fidenz
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your real API keys and Auth0 domain
npm run dev
```
Backend runs at `http://localhost:5000`.

### 3. Frontend Setup
```bash
cd ../frontend
npm install
cp .env.example .env
# Edit .env with your Auth0 client configuration
npm run dev
```
Frontend runs at `http://localhost:5173`.

---

## Testing & Quality Assurance

### Backend Unit Tests & Build
```bash
cd backend

# Run Vitest test suite for Comfort Index
npm test

# Build TypeScript to dist/
npm run build
```

### Frontend Lint & Build
```bash
cd frontend

# Run ESLint validation
npm run lint

# Build production bundle with Vite
npm run build
```

---

## Trade-offs Considered

1. **Heuristic vs Meteorological Formula**: A weighted polynomial heuristic was chosen over complex thermodynamic indexes (e.g., UTCI, Humidex) for clarity, predictable determinism, unit testability, and ease of live demonstration.
2. **In-Memory Caching vs Distributed Cache**: `node-cache` was selected for zero infrastructure overhead, minimal latency, and straightforward setup, avoiding external dependencies like Redis for a single-instance take-home deployment.
3. **Two-Level Cache Strategy**: Combining raw per-city caching with aggregate processed caching prevents redundant downstream score recalculations while allowing individual city data reuse.
4. **Concurrent API Requests**: Fetching weather data in parallel using `Promise.all` minimizes user perceived latency compared to serial requests.

---

## Known Limitations

- **In-Memory Cache**: Cache state is local to the Node.js process and resets whenever the server restarts.
- **Single-Instance Caching**: Cache is not shared across horizontally scaled backend instances (would require Redis/Memcached).
- **OpenWeatherMap Dependency**: Application availability and response times depend on OpenWeatherMap API uptime and rate limits.
- **No Persistent Database**: Historical weather records are not stored persistently across days/months.
- **Custom Comfort Metric**: The Comfort Index is a subjective heuristic rather than an official meteorological standard.
- **Batch Error Handling**: If any single city request in `Promise.all` encounters a network failure or invalid API key, the batch request fails.

---

## Future Improvements

- Additional Comfort Index parameters (e.g., visibility, atmospheric pressure, UV index).
- Redis-backed distributed cache for multi-instance deployments.
- Historical weather persistence and multi-day trend analysis.
- Resilient partial-failure handling using `Promise.allSettled()`.