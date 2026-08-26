import NodeCache from "node-cache";

export const weatherCache = new NodeCache({
  stdTTL: 300,
  checkperiod: 60,
});

let cacheHits = 0;
let cacheMisses = 0;

export function recordCacheHit() {
  cacheHits++;
}

export function recordCacheMiss() {
  cacheMisses++;
}

export function getCacheStats() {
  return {
    hits: cacheHits,
    misses: cacheMisses,
    keys: weatherCache.keys().length,
    ttlSeconds: 300,
  };
}