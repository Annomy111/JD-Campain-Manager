const Redis = require('ioredis');
const redis = new Redis(process.env.REDIS_URL);

const cache = {
  route: ({ ttl = 300 } = {}) => async (req, res, next) => {
    if (process.env.NODE_ENV !== 'production') {
      return next();
    }

    const key = `cache:${req.originalUrl}:${req.user._id}`;

    try {
      const cachedData = await redis.get(key);
      
      if (cachedData) {
        return res.json(JSON.parse(cachedData));
      }

      const originalJson = res.json;
      res.json = function(data) {
        redis.setex(key, ttl, JSON.stringify(data));
        originalJson.call(this, data);
      };

      next();
    } catch (error) {
      console.error('Cache error:', error);
      next();
    }
  },

  clear: (pattern) => async () => {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(keys);
    }
  }
};

module.exports = cache; 