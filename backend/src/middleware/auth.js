/**
 * JWT Authentication Middleware
 * Verifies JWT tokens for protected routes
 */
const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * Middleware to verify JWT token
 * Extracts token from Authorization header (Bearer token)
 */
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({
            error: 'Access denied',
            message: 'No authentication token provided'
        });
    }

    try {
        const decoded = jwt.verify(token, config.jwtSecret);
        req.admin = decoded;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                error: 'Token expired',
                message: 'Your session has expired. Please login again.'
            });
        }
        return res.status(403).json({
            error: 'Invalid token',
            message: 'Authentication failed'
        });
    }
}

/**
 * Generate JWT token for admin
 * @param {Object} admin - Admin data to encode
 * @returns {string} JWT token
 */
function generateToken(admin) {
    return jwt.sign(
        { email: admin.email, role: 'admin' },
        config.jwtSecret,
        { expiresIn: config.jwtExpiresIn }
    );
}

module.exports = {
    authenticateToken,
    generateToken
};
