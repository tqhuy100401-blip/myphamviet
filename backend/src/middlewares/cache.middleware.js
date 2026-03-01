const NodeCache = require('node-cache');

// Create cache instance
const cache = new NodeCache({
  stdTTL: 600, // 10 minutes default
  checkperiod: 120, // Check for expired keys every 2 minutes
  useClones: false // Better performance
});

// Cache middleware factory
const cacheMiddleware = (duration = 600) => {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const key = `cache_${req.originalUrl || req.url}`;
    const cachedResponse = cache.get(key);

    if (cachedResponse) {
      console.log(`✅ Cache HIT: ${key}`);
      return res.json(cachedResponse);
    }

    // Store original res.json
    const originalJson = res.json.bind(res);

    // Override res.json to cache response
    res.json = (data) => {
      cache.set(key, data, duration);
      console.log(`📦 Cache SET: ${key} (TTL: ${duration}s)`);
      return originalJson(data);
    };

    next();
  };
};

// Clear cache by pattern
const clearCacheByPattern = (pattern) => {
  const keys = cache.keys();
  const matchedKeys = keys.filter(key => key.includes(pattern));
  
  matchedKeys.forEach(key => {
    cache.del(key);
  });

  console.log(`🗑️  Cleared ${matchedKeys.length} cache entries matching: ${pattern}`);
  return matchedKeys.length;
};

// Clear specific cache
const clearCache = (key) => {
  return cache.del(key);
};

// Get cache stats
const getCacheStats = () => {
  return cache.getStats();
};

// Clear all cache
const clearAllCache = () => {
  cache.flushAll();
  console.log('🗑️  All cache cleared');
};

module.exports = {
  cache,
  cacheMiddleware,
  clearCache,
  clearCacheByPattern,
  getCacheStats,
  clearAllCache
};
