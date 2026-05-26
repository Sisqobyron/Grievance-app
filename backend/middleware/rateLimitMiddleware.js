const RATE_LIMIT_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000);
const RATE_LIMIT_MAX_REQUESTS = Number(process.env.RATE_LIMIT_MAX_REQUESTS || 300);
const rateLimitBuckets = new Map();

const rateLimiter = (req, res, next) => {
  const key = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const current = rateLimitBuckets.get(key);

  if (!current || now > current.resetAt) {
    rateLimitBuckets.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return next();
  }

  current.count += 1;

  if (current.count > RATE_LIMIT_MAX_REQUESTS) {
    res.setHeader('Retry-After', Math.ceil((current.resetAt - now) / 1000));
    return res.status(429).json({ message: 'Too many requests, please try again later.' });
  }

  next();
};

setInterval(() => {
  const now = Date.now();
  rateLimitBuckets.forEach((bucket, key) => {
    if (now > bucket.resetAt) {
      rateLimitBuckets.delete(key);
    }
  });
}, RATE_LIMIT_WINDOW_MS).unref();

module.exports = rateLimiter;
