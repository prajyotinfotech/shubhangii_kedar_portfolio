/**
 * Input Sanitization Middleware
 * Prevents XSS attacks by sanitizing user input
 */

/**
 * Sanitize string by removing potentially dangerous HTML/script tags
 * @param {string} str - Input string to sanitize
 * @returns {string} Sanitized string
 */
function sanitizeString(str) {
    if (typeof str !== 'string') return str;
    
    return str
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .trim();
}

/**
 * Recursively sanitize object properties
 * @param {any} obj - Object to sanitize
 * @returns {any} Sanitized object
 */
function sanitizeObject(obj) {
    if (obj === null || obj === undefined) return obj;
    
    if (typeof obj === 'string') {
        return sanitizeString(obj);
    }
    
    if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item));
    }
    
    if (typeof obj === 'object') {
        const sanitized = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                sanitized[key] = sanitizeObject(obj[key]);
            }
        }
        return sanitized;
    }
    
    return obj;
}

/**
 * Middleware to sanitize request body
 */
function sanitizeInput(req, res, next) {
    if (req.body) {
        req.body = sanitizeObject(req.body);
    }
    
    if (req.params) {
        req.params = sanitizeObject(req.params);
    }
    
    if (req.query) {
        req.query = sanitizeObject(req.query);
    }
    
    next();
}

module.exports = {
    sanitizeInput,
    sanitizeString,
    sanitizeObject
};
