/**
 * Rate Limiting Middleware
 * Prevents brute force attacks on login
 */
const rateLimit = require('express-rate-limit');
const config = require('../config');

/**
 * Rate limiter for authentication routes
 * Limits login attempts to prevent brute force attacks
 */
const authLimiter = rateLimit({
    windowMs: config.rateLimitWindowMs, // 15 minutes
    max: config.rateLimitMax, // 5 attempts per window
    message: {
        error: 'Too many attempts',
        message: 'Too many login attempts. Please try again after 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * General API rate limiter
 * More generous limits for regular API calls
 */
const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100, // 100 requests per minute
    message: {
        error: 'Rate limit exceeded',
        message: 'Too many requests. Please slow down.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    authLimiter,
    apiLimiter
};
