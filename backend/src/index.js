/**
 * Singer Portfolio Backend Server
 * File-based CMS with REST API
 * 
 * This server provides:
 * - JWT authentication for admin
 * - CRUD operations for content.json
 * - Local image upload support
 * - Safe file writes with backup
 */
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const config = require('./config');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimit');
const { sanitizeInput } = require('./middleware/sanitize');
const fileService = require('./services/fileService');

const authRoutes = require('./routes/auth');
const contentRoutes = require('./routes/content');
const uploadRoutes = require('./routes/upload');

const app = express();

// Security middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
app.use(cors({
    origin: config.frontendUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Input sanitization (XSS protection)
app.use(sanitizeInput);

// Rate limiting for API routes
app.use('/api', apiLimiter);

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/upload', uploadRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({
        error: 'Not found',
        message: `Route ${req.method} ${req.originalUrl} not found`
    });
});

// Global error handler
app.use(errorHandler);

// ... imports ...
// (imports section is fine, I will replace the end of file)

// Initialize and start server
async function startServer() {
    try {
        // Initialize content file if needed (No-op in Gist mode)
        await fileService.initializeContent();

        // Only listen if run directly
        if (require.main === module) {
            app.listen(config.port, () => {
                console.log(`
╔════════════════════════════════════════════════════════════╗
║         Singer Portfolio CMS Backend Server                ║
╠════════════════════════════════════════════════════════════╣
║  Status:  Running                                          ║
║  Port:    ${config.port}                                            ║
║  Mode:    ${config.nodeEnv}                                   ║
║  CORS:    ${config.frontendUrl}                     ║
╚════════════════════════════════════════════════════════════╝
`);
            });
        }
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();

// Export for Serverless (Vercel/Netlify)
module.exports = app;
