/**
 * Content Routes
 * CRUD operations for content.json sections
 */
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const fileService = require('../services/fileService');

/**
 * GET /api/content
 * Get all content (public endpoint)
 */
router.get('/', async (req, res, next) => {
    try {
        const content = await fileService.readContent();
        res.json(content);
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/content/:section
 * Get specific section (public endpoint)
 */
router.get('/:section', async (req, res, next) => {
    try {
        const { section } = req.params;
        const content = await fileService.readContent();

        if (!(section in content)) {
            return res.status(404).json({
                error: 'Section not found',
                message: `Section "${section}" does not exist`
            });
        }

        res.json(content[section]);
    } catch (error) {
        next(error);
    }
});

/**
 * PUT /api/content/:section
 * Update entire section (protected)
 */
router.put('/:section', authenticateToken, async (req, res, next) => {
    try {
        const { section } = req.params;
        const data = req.body;

        if (data === undefined || data === null) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Request body is required'
            });
        }

        const content = await fileService.updateSection(section, data);

        res.json({
            success: true,
            message: `Section "${section}" updated successfully`,
            data: content[section]
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/content/:section/items
 * Add item to array section (gallery, events, etc.) (protected)
 */
router.post('/:section/items', authenticateToken, async (req, res, next) => {
    try {
        const { section } = req.params;
        const item = req.body;

        if (!item || Object.keys(item).length === 0) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Item data is required'
            });
        }

        const result = await fileService.addItem(section, item);

        res.status(201).json({
            success: true,
            message: `Item added to "${section}" successfully`,
            item: result.item
        });
    } catch (error) {
        if (error.message.includes('not an array')) {
            return res.status(400).json({
                error: 'Invalid operation',
                message: error.message
            });
        }
        next(error);
    }
});

/**
 * PUT /api/content/:section/items/:itemId
 * Update item in array section (protected)
 */
router.put('/:section/items/:itemId', authenticateToken, async (req, res, next) => {
    try {
        const { section, itemId } = req.params;
        const updates = req.body;

        if (!updates || Object.keys(updates).length === 0) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Update data is required'
            });
        }

        const content = await fileService.updateItem(section, itemId, updates);

        res.json({
            success: true,
            message: `Item updated in "${section}" successfully`,
            data: content[section]
        });
    } catch (error) {
        if (error.message.includes('not found') || error.message.includes('not an array')) {
            return res.status(404).json({
                error: 'Not found',
                message: error.message
            });
        }
        next(error);
    }
});

/**
 * DELETE /api/content/:section/items/:itemId
 * Delete item from array section (protected)
 */
router.delete('/:section/items/:itemId', authenticateToken, async (req, res, next) => {
    try {
        const { section, itemId } = req.params;

        const content = await fileService.deleteItem(section, itemId);

        res.json({
            success: true,
            message: `Item deleted from "${section}" successfully`,
            data: content[section]
        });
    } catch (error) {
        if (error.message.includes('not found') || error.message.includes('not an array')) {
            return res.status(404).json({
                error: 'Not found',
                message: error.message
            });
        }
        next(error);
    }
});

module.exports = router;
