/**
 * Backend Configuration
 * Loads environment variables and exports configuration object
 */
require('dotenv').config();

const allowedGoogleAdminEmails = (process.env.GOOGLE_ADMIN_EMAILS || process.env.ADMIN_EMAIL || 'admin@example.com')
    .split(',')
    .map(email => email.trim().toLowerCase())
    .filter(Boolean);

module.exports = {
    // Server configuration
    port: process.env.PORT || 3001,
    nodeEnv: process.env.NODE_ENV || 'development',

    // JWT configuration
    jwtSecret: process.env.JWT_SECRET || 'fallback-secret-change-this',
    jwtExpiresIn: '24h',

    // Admin credentials
    adminEmail: process.env.ADMIN_EMAIL || 'admin@example.com',
    adminPassword: process.env.ADMIN_PASSWORD || 'admin123',
    passwordLoginEnabled: process.env.ADMIN_PASSWORD_LOGIN_ENABLED !== 'false',

    // Cookie authentication
    authCookieSecure: process.env.AUTH_COOKIE_SECURE
        ? process.env.AUTH_COOKIE_SECURE === 'true'
        : process.env.NODE_ENV === 'production',
    authCookieSameSite: process.env.AUTH_COOKIE_SAMESITE || (process.env.NODE_ENV === 'production' ? 'none' : 'lax'),

    // CORS configuration
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',

    // Google OAuth configuration
    googleOAuth: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        hostedDomain: process.env.GOOGLE_HOSTED_DOMAIN || '',
        allowedAdminEmails: allowedGoogleAdminEmails
    },

    // File paths
    contentPath: require('path').join(__dirname, '../../data/content.json'),
    backupPath: require('path').join(__dirname, '../../data/content.backup.json'),
    uploadsPath: require('path').join(__dirname, '../../uploads'),

    // Rate limiting
    rateLimitWindowMs: 15 * 60 * 1000, // 15 minutes
    rateLimitMax: 5, // 5 login attempts per window

    // Cloudinary configuration
    cloudinary: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        apiSecret: process.env.CLOUDINARY_API_SECRET
    },

    // GitHub Gist configuration
    gistId: process.env.GIST_ID,
    githubToken: process.env.GITHUB_TOKEN
};
