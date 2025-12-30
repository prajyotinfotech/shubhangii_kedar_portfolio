/**
 * Backend Configuration
 * Loads environment variables and exports configuration object
 */
require('dotenv').config();

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

    // CORS configuration
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',

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
