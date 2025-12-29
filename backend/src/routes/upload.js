/**
 * Upload Routes
 * Handle local image uploads (Cloudinary integration to be added later)
 */
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const config = require('../config');

// Ensure uploads directory exists
async function ensureUploadsDir() {
    try {
        await fs.mkdir(config.uploadsPath, { recursive: true });
    } catch (error) {
        if (error.code !== 'EEXIST') {
            throw error;
        }
    }
}

ensureUploadsDir();

// Configure multer for local storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, config.uploadsPath);
    },
    filename: (req, file, cb) => {
        // Generate unique filename with original extension
        const ext = path.extname(file.originalname);
        const filename = `${uuidv4()}${ext}`;
        cb(null, filename);
    }
});

// File filter for images only
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only JPEG, PNG, GIF, and WebP images are allowed'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

/**
 * POST /api/upload
 * Upload single image (protected)
 */
router.post('/', authenticateToken, upload.single('image'), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                error: 'Upload failed',
                message: 'No image file provided'
            });
        }

        // Generate URL for the uploaded file
        const imageUrl = `/uploads/${req.file.filename}`;

        res.status(201).json({
            success: true,
            message: 'Image uploaded successfully',
            data: {
                filename: req.file.filename,
                originalName: req.file.originalname,
                size: req.file.size,
                mimetype: req.file.mimetype,
                url: imageUrl
            }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * DELETE /api/upload/:filename
 * Delete uploaded image (protected)
 */
router.delete('/:filename', authenticateToken, async (req, res, next) => {
    try {
        const { filename } = req.params;
        const filePath = path.join(config.uploadsPath, filename);

        // Security: prevent directory traversal
        if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
            return res.status(400).json({
                error: 'Invalid filename',
                message: 'Invalid characters in filename'
            });
        }

        await fs.unlink(filePath);

        res.json({
            success: true,
            message: 'Image deleted successfully'
        });
    } catch (error) {
        if (error.code === 'ENOENT') {
            return res.status(404).json({
                error: 'Not found',
                message: 'Image file not found'
            });
        }
        next(error);
    }
});

/**
 * GET /api/upload/list
 * List all uploaded images (protected)
 */
router.get('/list', authenticateToken, async (req, res, next) => {
    try {
        const files = await fs.readdir(config.uploadsPath);
        const imageFiles = files.filter(file => {
            const ext = path.extname(file).toLowerCase();
            return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
        });

        const images = await Promise.all(
            imageFiles.map(async (filename) => {
                const filePath = path.join(config.uploadsPath, filename);
                const stats = await fs.stat(filePath);
                return {
                    filename,
                    url: `/uploads/${filename}`,
                    size: stats.size,
                    uploadedAt: stats.mtime
                };
            })
        );

        res.json({
            success: true,
            data: images
        });
    } catch (error) {
        next(error);
    }
});

// Handle multer errors
router.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                error: 'File too large',
                message: 'Image must be less than 5MB'
            });
        }
        return res.status(400).json({
            error: 'Upload error',
            message: error.message
        });
    }
    next(error);
});

module.exports = router;
