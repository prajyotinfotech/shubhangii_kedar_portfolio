/**
 * Authentication Routes
 * Handles admin login/logout
 */
const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const router = express.Router();
const config = require('../config');
const { ADMIN_TOKEN_COOKIE, generateToken, authenticateToken } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimit');

const GOOGLE_JWKS_URL = 'https://www.googleapis.com/oauth2/v3/certs';
const GOOGLE_ISSUERS = new Set(['accounts.google.com', 'https://accounts.google.com']);
let googleJwksCache = {
    keys: [],
    expiresAt: 0
};

// In-memory hashed password (generated on first run)
let hashedPassword = null;

function getBaseCookieOptions(path = '/') {
    return {
        httpOnly: true,
        secure: config.authCookieSecure,
        sameSite: config.authCookieSameSite,
        path
    };
}

function setAuthCookie(res, token) {
    res.cookie(ADMIN_TOKEN_COOKIE, token, {
        ...getBaseCookieOptions('/'),
        maxAge: 24 * 60 * 60 * 1000
    });
}

function clearAuthCookie(res) {
    res.clearCookie(ADMIN_TOKEN_COOKIE, getBaseCookieOptions('/'));
}

function isGoogleLoginConfigured() {
    return Boolean(config.googleOAuth.clientId);
}

function decodeBase64UrlJson(value) {
    return JSON.parse(Buffer.from(value, 'base64url').toString('utf8'));
}

function decodeGoogleCredential(credential) {
    const parts = credential.split('.');
    if (parts.length !== 3) {
        throw new Error('Malformed Google credential');
    }

    return {
        header: decodeBase64UrlJson(parts[0]),
        payload: decodeBase64UrlJson(parts[1]),
        signedData: `${parts[0]}.${parts[1]}`,
        signature: Buffer.from(parts[2], 'base64url')
    };
}

async function getGoogleJwks() {
    if (googleJwksCache.keys.length && Date.now() < googleJwksCache.expiresAt) {
        return googleJwksCache.keys;
    }

    const response = await fetch(GOOGLE_JWKS_URL);
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !Array.isArray(data.keys)) {
        throw new Error('Unable to fetch Google signing keys');
    }

    const cacheControl = response.headers.get('cache-control') || '';
    const maxAgeMatch = cacheControl.match(/max-age=(\d+)/);
    const maxAgeSeconds = maxAgeMatch ? Number(maxAgeMatch[1]) : 3600;

    googleJwksCache = {
        keys: data.keys,
        expiresAt: Date.now() + maxAgeSeconds * 1000
    };

    return googleJwksCache.keys;
}

async function verifyGoogleCredential(credential) {
    const { header, payload, signedData, signature } = decodeGoogleCredential(credential);

    if (header.alg !== 'RS256' || !header.kid) {
        throw new Error('Unsupported Google credential signature');
    }

    const keys = await getGoogleJwks();
    const jwk = keys.find(key => key.kid === header.kid);
    if (!jwk) {
        throw new Error('Google signing key not found');
    }

    const publicKey = crypto.createPublicKey({ key: jwk, format: 'jwk' });
    const isValidSignature = crypto
        .createVerify('RSA-SHA256')
        .update(signedData)
        .end()
        .verify(publicKey, signature);

    if (!isValidSignature) {
        throw new Error('Invalid Google credential signature');
    }

    const nowSeconds = Math.floor(Date.now() / 1000);
    if (payload.aud !== config.googleOAuth.clientId) {
        throw new Error('Google credential audience mismatch');
    }

    if (!GOOGLE_ISSUERS.has(payload.iss)) {
        throw new Error('Invalid Google credential issuer');
    }

    if (!payload.exp || Number(payload.exp) <= nowSeconds) {
        throw new Error('Expired Google credential');
    }

    if (payload.nbf && Number(payload.nbf) > nowSeconds) {
        throw new Error('Google credential is not active yet');
    }

    return payload;
}

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
        if (!config.passwordLoginEnabled) {
            return res.status(403).json({
                error: 'Password login disabled',
                message: 'Password login is disabled. Please sign in with Google.'
            });
        }

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
        setAuthCookie(res, token);

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
 * GET /api/auth/google/status
 * Allows the login page to know whether Google login is configured
 */
router.get('/google/status', (req, res) => {
    res.json({
        success: true,
        enabled: isGoogleLoginConfigured()
    });
});

/**
 * POST /api/auth/google/credential
 * Verifies a Google Identity Services ID token and creates an admin session
 */
router.post('/google/credential', authLimiter, async (req, res) => {
    try {
        if (!isGoogleLoginConfigured()) {
            return res.status(500).json({
                error: 'Google login not configured',
                message: 'Google login is not configured yet.'
            });
        }

        const { credential } = req.body;
        if (!credential || typeof credential !== 'string') {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Google credential is required.'
            });
        }

        const googleUser = await verifyGoogleCredential(credential);
        const email = String(googleUser.email || '').toLowerCase();
        const emailVerified = googleUser.email_verified === true || googleUser.email_verified === 'true';

        if (!emailVerified) {
            return res.status(401).json({
                error: 'Authentication failed',
                message: 'Your Google account email is not verified.'
            });
        }

        if (config.googleOAuth.hostedDomain && googleUser.hd !== config.googleOAuth.hostedDomain) {
            return res.status(401).json({
                error: 'Authentication failed',
                message: 'This Google Workspace account is not allowed to access the admin panel.'
            });
        }

        if (!config.googleOAuth.allowedAdminEmails.includes(email)) {
            return res.status(401).json({
                error: 'Authentication failed',
                message: 'This Google account is not allowed to access the admin panel.'
            });
        }

        const token = generateToken({ email });
        setAuthCookie(res, token);

        res.json({
            success: true,
            message: 'Google login successful',
            admin: { email }
        });
    } catch (error) {
        console.error('Google credential verification failed:', error);
        res.status(401).json({
            error: 'Authentication failed',
            message: 'Google sign-in could not be verified.'
        });
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
 * Logout endpoint
 */
router.post('/logout', (req, res) => {
    clearAuthCookie(res);
    res.json({
        success: true,
        message: 'Logged out successfully'
    });
});

module.exports = router;
