// Simple in-memory cache utility
const cache = new Map();
const CACHE_DURATION = 300000; // 5 minutes in milliseconds

// Function to get cached data
export function getCachedData(key) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
}

// Function to set cached data
export function setCachedData(key, data) {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
}

// Function to invalidate specific cache key
export function invalidateCache(key) {
  cache.delete(key);
  console.log(`Invalidated cache key: ${key}`);
}

// Function to clear all cache
export function clearAllCache() {
  cache.clear();
  console.log('Cleared all cache');
}
