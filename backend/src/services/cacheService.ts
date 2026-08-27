import NodeCache from "node-cache";

export const weatherCache = new NodeCache({
  stdTTL: 300,
  checkperiod: 60,
});

let cacheHits = 0;
let cacheMisses = 0;
let lastCacheStatus: "HIT" | "MISS" | "EMPTY" = "EMPTY";

export function recordCacheHit() {
  cacheHits++;
  lastCacheStatus = "HIT";
}

export function recordCacheMiss() {
  cacheMisses++;
  lastCacheStatus = "MISS";
}

export function getCacheStats() {
  return {
    status: lastCacheStatus,
    hits: cacheHits,
    misses: cacheMisses,
    keys: weatherCache.keys().length,
    ttlSeconds: 300,
  };
}