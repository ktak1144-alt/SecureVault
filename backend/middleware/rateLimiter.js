const rateLimit = require("express-rate-limit");

// General rate limiter
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    message: "❌ Too many requests from this IP, please try again after 15 minutes!"
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Strict limiter for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: {
    message: "❌ Too many login attempts, please try again after 15 minutes!"
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Upload limiter
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  message: {
    message: "❌ Upload limit reached, please try again after 1 hour!"
  }
});

module.exports = { generalLimiter, authLimiter, uploadLimiter };