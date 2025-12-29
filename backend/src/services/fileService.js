/**
 * File Service - Safe File Operations for CMS
 * 
 * Implements:
 * - Read-modify-write pattern
 * - Atomic file writes (temp file + rename)
 * - Auto-backup before every write
 * - File locking to prevent concurrent writes
 * - Proper error handling
 */
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const config = require('../config');

// Simple in-memory lock to prevent concurrent writes
let isWriting = false;

/**
 * Read content from content.json
 * @returns {Promise<Object>} Parsed content object
 */
async function readContent() {
    try {
        const data = await fs.readFile(config.contentPath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            // File doesn't exist, return empty content structure
            console.log('content.json not found, returning default structure');
            return getDefaultContent();
        }
        throw error;
    }
}

/**
 * Write content to content.json with safety measures
 * @param {Object} content - Content object to write
 * @throws {Error} If another write is in progress
 */
async function writeContent(content) {
    // Check for concurrent writes
    if (isWriting) {
        throw new Error('Another write operation is in progress. Please try again.');
    }

    isWriting = true;
    const tempPath = config.contentPath + '.tmp.' + uuidv4();

    try {
        // 1. Create backup of current content (if exists)
        try {
            await fs.copyFile(config.contentPath, config.backupPath);
            console.log('Backup created at:', config.backupPath);
        } catch (backupError) {
            if (backupError.code !== 'ENOENT') {
                throw backupError;
            }
            // Original file doesn't exist yet, skip backup
        }

        // 2. Write to temp file first
        await fs.writeFile(tempPath, JSON.stringify(content, null, 2), 'utf-8');

        // 3. Atomic rename temp file to actual content file
        await fs.rename(tempPath, config.contentPath);

        console.log('Content saved successfully');
    } catch (error) {
        // Cleanup temp file if it exists
        try {
            await fs.unlink(tempPath);
        } catch (unlinkError) {
            // Temp file might not exist, ignore
        }
        throw error;
    } finally {
        isWriting = false;
    }
}

/**
 * Update a specific section of content
 * @param {string} section - Section name to update
 * @param {any} data - New data for the section
 */
async function updateSection(section, data) {
    const content = await readContent();
    content[section] = data;
    await writeContent(content);
    return content;
}

/**
 * Add an item to an array section (gallery, events, etc.)
 * @param {string} section - Section name
 * @param {Object} item - Item to add
 */
async function addItem(section, item) {
    const content = await readContent();
    if (!Array.isArray(content[section])) {
        throw new Error(`Section "${section}" is not an array`);
    }

    // Add unique ID if not present
    if (!item.id) {
        item.id = uuidv4();
    }

    content[section].push(item);
    await writeContent(content);
    return { content, item };
}

/**
 * Update an item in an array section
 * @param {string} section - Section name
 * @param {string} itemId - Item ID to update
 * @param {Object} updates - Updates to apply
 */
async function updateItem(section, itemId, updates) {
    const content = await readContent();
    if (!Array.isArray(content[section])) {
        throw new Error(`Section "${section}" is not an array`);
    }

    const index = content[section].findIndex(item => item.id === itemId);
    if (index === -1) {
        throw new Error(`Item with id "${itemId}" not found in "${section}"`);
    }

    content[section][index] = { ...content[section][index], ...updates };
    await writeContent(content);
    return content;
}

/**
 * Delete an item from an array section
 * @param {string} section - Section name
 * @param {string} itemId - Item ID to delete
 */
async function deleteItem(section, itemId) {
    const content = await readContent();
    if (!Array.isArray(content[section])) {
        throw new Error(`Section "${section}" is not an array`);
    }

    const index = content[section].findIndex(item => item.id === itemId);
    if (index === -1) {
        throw new Error(`Item with id "${itemId}" not found in "${section}"`);
    }

    content[section].splice(index, 1);
    await writeContent(content);
    return content;
}

/**
 * Get default content structure
 */
function getDefaultContent() {
    return {
        hero: {
            title: 'Shubhangii Kedar',
            subtitle: 'Singer | Performer | Playback Artist',
            backgroundImage: '',
            ctaText: 'Listen Now',
            ctaLink: '#music'
        },
        about: {
            title: 'About Me',
            description: '',
            image: '',
            stats: []
        },
        featureStats: [],
        musicReleases: [],
        events: [],
        gallery: [],
        testimonials: [],
        contact: {
            email: '',
            phone: '',
            location: ''
        },
        socialLinks: [],
        journeyMilestones: []
    };
}

/**
 * Ensure data directory exists
 */
async function ensureDataDirectory() {
    const dataDir = path.dirname(config.contentPath);
    try {
        await fs.mkdir(dataDir, { recursive: true });
    } catch (error) {
        if (error.code !== 'EEXIST') {
            throw error;
        }
    }
}

/**
 * Initialize content file if it doesn't exist
 */
async function initializeContent() {
    await ensureDataDirectory();
    try {
        await fs.access(config.contentPath);
        console.log('Content file exists');
    } catch {
        console.log('Creating initial content.json');
        await writeContent(getDefaultContent());
    }
}

module.exports = {
    readContent,
    writeContent,
    updateSection,
    addItem,
    updateItem,
    deleteItem,
    initializeContent,
    getDefaultContent
};
