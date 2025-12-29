/**
 * Authentication Routes
 * Handles admin login/logout
 */
const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const config = require('../config');
const { generateToken, authenticateToken } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimit');

// In-memory hashed password (generated on first run)
let hashedPassword = null;

/**
 * Initialize admin password hash
 */
async function initializePassword() {
    if (!hashedPassword) {
        hashedPassword = await bcrypt.hash(config.adminPassword, 12);
        console.log('Admin password hash initialized');
    }
}

// Initialize on module load
initializePassword();

/**
 * POST /api/auth/login
 * Admin login endpoint
 */
router.post('/login', authLimiter, async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Email and password are required'
            });
        }

        // Check email
        if (email !== config.adminEmail) {
            return res.status(401).json({
                error: 'Authentication failed',
                message: 'Invalid email or password'
            });
        }

        // Ensure password is hashed
        await initializePassword();

        // Check password
        const isValid = await bcrypt.compare(password, hashedPassword);
        if (!isValid) {
            return res.status(401).json({
                error: 'Authentication failed',
                message: 'Invalid email or password'
            });
        }

        // Generate JWT token
        const token = generateToken({ email });

        res.json({
            success: true,
            message: 'Login successful',
            token,
            admin: {
                email: config.adminEmail
            }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/auth/verify
 * Verify token is valid (for frontend auth check)
 */
router.get('/verify', authenticateToken, (req, res) => {
    res.json({
        success: true,
        message: 'Token is valid',
        admin: req.admin
    });
});

/**
 * POST /api/auth/logout
 * Logout endpoint (client-side token removal)
 */
router.post('/logout', authenticateToken, (req, res) => {
    // JWT is stateless, so logout is handled client-side
    // This endpoint exists for logging/tracking purposes
    res.json({
        success: true,
        message: 'Logged out successfully'
    });
});

module.exports = router;
