const NodeCache = require('node-cache');

// In-memory cache: TTL 300s, check period 60s
const cache = new NodeCache({ stdTTL: 300, checkperiod: 60, useClones: false });

const getCache = async (key) => {
  try {
    return cache.get(key) ?? null;
  } catch {
    return null;
  }
};

const setCache = async (key, value, ttlSeconds = 300) => {
  try {
    cache.set(key, value, ttlSeconds);
  } catch {
    // silent fail
  }
};

const deleteCache = async (key) => {
  try {
    cache.del(key);
  } catch {
    // silent fail
  }
};

const deleteCachePattern = async (pattern) => {
  try {
    const prefix = pattern.replace('*', '');
    const keys = cache.keys().filter((k) => k.startsWith(prefix));
    if (keys.length > 0) cache.del(keys);
  } catch {
    // silent fail
  }
};

module.exports = { getCache, setCache, deleteCache, deleteCachePattern };
