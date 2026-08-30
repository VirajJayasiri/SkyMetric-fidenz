import NodeCache from "node-cache";

const CACHE_TTL_SECONDS = 300;

// Raw OpenWeatherMap responses
export const weatherCache = new NodeCache({
  stdTTL: CACHE_TTL_SECONDS,
  checkperiod: 60,
});

// Final calculated + sorted + ranked response
export const processedWeatherCache = new NodeCache({
  stdTTL: CACHE_TTL_SECONDS,
  checkperiod: 60,
});

let rawCacheHits = 0;
let rawCacheMisses = 0;
let rawLastStatus: "HIT" | "MISS" | "EMPTY" = "EMPTY";

let processedCacheHits = 0;
let processedCacheMisses = 0;
let processedLastStatus: "HIT" | "MISS" | "EMPTY" = "EMPTY";

export function recordCacheHit() {
  rawCacheHits++;
  rawLastStatus = "HIT";
}

export function recordCacheMiss() {
  rawCacheMisses++;
  rawLastStatus = "MISS";
}

export function recordProcessedCacheHit() {
  processedCacheHits++;
  processedLastStatus = "HIT";
}

export function recordProcessedCacheMiss() {
  processedCacheMisses++;
  processedLastStatus = "MISS";
}

export function getCacheStats() {
  return {
    rawWeather: {
      status: rawLastStatus,
      hits: rawCacheHits,
      misses: rawCacheMisses,
      keys: weatherCache.keys().length,
      ttlSeconds: CACHE_TTL_SECONDS,
    },

    processedOutput: {
      status: processedLastStatus,
      hits: processedCacheHits,
      misses: processedCacheMisses,
      keys: processedWeatherCache.keys().length,
      ttlSeconds: CACHE_TTL_SECONDS,
    },
  };
}