/**
 * Upload Routes
 * Handle image uploads to Cloudinary
 */
const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const config = require('../config');

// Configure Cloudinary
cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret
});

// Configure Multer Storage for Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        // Generate a clean public_id from original filename + timestamp
        const name = file.originalname.split('.')[0].replace(/[^a-zA-Z0-9]/g, '');
        const fileId = `${name}-${Date.now()}`;

        return {
            folder: 'singer_portfolio',
            public_id: fileId,
            // Use 'format' to force format or let Cloudinary detect it.
            // allowed_formats is a property of the storage engine options, NOT the params object in some versions.
            // But if we return it here it might be passed to upload.
            // Safer to just rely on Cloudinary's auto-detection or explicit format if needed.
        };
    },
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // Increased to 10MB
    }
});

/**
 * POST /api/upload
 * Upload single image to Cloudinary (protected)
 */
router.post('/', authenticateToken, upload.single('image'), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                error: 'Upload failed',
                message: 'No image file provided'
            });
        }

        // Return the Cloudinary URL
        res.status(201).json({
            success: true,
            message: 'Image uploaded successfully',
            data: {
                filename: req.file.filename,
                originalName: req.file.originalname,
                size: req.file.size,
                mimetype: req.file.mimetype,
                url: req.file.path // Secure URL from Cloudinary
            }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * DELETE /api/upload/:publicId
 * Delete uploaded image from Cloudinary (protected)
 */
router.delete('/:publicId', authenticateToken, async (req, res, next) => {
    try {
        const { publicId } = req.params;

        // publicId in Cloudinary typically includes the folder name, e.g., 'singer_portfolio/filename'
        // But multer-storage-cloudinary might return it differently.
        // We expect the full public_id to be passed here.

        const result = await cloudinary.uploader.destroy(publicId);

        if (result.result !== 'ok') {
            return res.status(400).json({
                error: 'Delete failed',
                message: result.result === 'not found' ? 'Image not found' : 'Failed to delete from Cloudinary'
            });
        }

        res.json({
            success: true,
            message: 'Image deleted from Cloudinary successfully'
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/upload/list
 * List all uploaded images from Cloudinary (protected)
 */
router.get('/list', authenticateToken, async (req, res, next) => {
    try {
        const { resources } = await cloudinary.api.resources({
            type: 'upload',
            prefix: 'singer_portfolio/', // Only list files in our folder
            max_results: 100
        });

        const images = resources.map(resource => ({
            filename: resource.public_id,
            url: resource.secure_url,
            size: resource.bytes,
            uploadedAt: resource.created_at
        }));

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
    console.error('Upload Error Details:', error); // Debug logging
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
    // Handle Cloudinary/Storage errors that might not be MulterErrors
    if (error.message && error.message.includes('Cloudinary')) {
        return res.status(400).json({
            error: 'Cloudinary Error',
            message: error.message
        });
    }

    next(error);
});

module.exports = router;
