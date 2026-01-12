// Simple in-memory cache utility
const cache = new Map();
const DEFAULT_CACHE_DURATION = 300000; // 5 minutes in milliseconds
const STATS_CACHE_DURATION = 60000; // 60 seconds for stats

// Function to get cached data
export function getCachedData(key) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < cached.duration) {
    return cached.data;
  }
  cache.delete(key); // Clean up expired cache
  return null;
}

// Function to set cached data with optional custom duration (in seconds)
export function setCachedData(key, data, durationSeconds = null) {
  const duration = durationSeconds 
    ? durationSeconds * 1000 
    : DEFAULT_CACHE_DURATION;
  
  cache.set(key, {
    data,
    timestamp: Date.now(),
    duration
  });
}

// Function to invalidate specific cache key
export function invalidateCache(key) {
  cache.delete(key);
  console.log(`✨ Invalidated cache key: ${key}`);
}

// Function to clear all cache
export function clearAllCache() {
  cache.clear();
  console.log('🧹 Cleared all cache');
}

// Function to invalidate cache by prefix
export function invalidateCacheByPrefix(prefix) {
  let count = 0;
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) {
      cache.delete(key);
      count++;
    }
  }
  if (count > 0) {
    console.log(`✨ Invalidated ${count} cache keys starting with: ${prefix}`);
  }
}
