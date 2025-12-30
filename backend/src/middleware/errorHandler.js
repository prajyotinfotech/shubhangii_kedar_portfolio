/**
 * Global Error Handler Middleware
 * Catches and formats all errors consistently
 */

function errorHandler(err, req, res, next) {
    console.error('Error:', err.message);
    console.error('Stack:', err.stack);

    // Default error values
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal server error';

    // Handle specific error types
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = err.message;
    } else if (err.name === 'SyntaxError' && err.status === 400) {
        statusCode = 400;
        message = 'Invalid JSON in request body';
    } else if (err.code === 'ENOENT') {
        statusCode = 404;
        message = 'Resource not found';
    }

    // Don't expose internal errors in production
    if (process.env.NODE_ENV === 'production' && statusCode === 500) {
        message = 'An unexpected error occurred';
    }

    res.status(statusCode).json({
        error: true,
        message,
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    });
}

module.exports = errorHandler;
