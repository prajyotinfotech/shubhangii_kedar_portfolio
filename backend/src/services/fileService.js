/**
 * File Service - Gist Storage Implementation
 * 
 * STRATEGY:
 * instead of saving to a local JSON file (which gets deleted on free hosting),
 * we use GitHub Gist as a "Cloud Database".
 * 
 * HOW IT WORKS:
 * 1. READ: We fetch the raw JSON from your private Gist URL.
 * 2. WRITE: We use the GitHub API to update that Gist.
 * 3. CACHE: To make it fast, we remember the last fetch for 30 seconds.
 * 
 * REQUIRED ENV VARS:
 * - GIST_ID: The ID of your secret gist
 * - GITHUB_TOKEN: Your Personal Access Token
 */
const config = require('../config');

// Simple in-memory cache to prevent hitting GitHub Rate Limits
// We keep data in memory for 30 seconds.
let memoryCache = null;
let lastFetch = 0;
const CACHE_TTL = 30000; // 30 seconds

/**
 * Get headers for GitHub API
 */
function getHeaders() {
    return {
        'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Singer-Portfolio-Backend'
    };
}

/**
 * Read content from Gist
 * @returns {Promise<Object>} Parsed content object
 */
async function readContent() {
    // Return cache if valid
    const now = Date.now();
    if (memoryCache && (now - lastFetch) < CACHE_TTL) {
        return memoryCache;
    }

    try {
        const gistId = process.env.GIST_ID;
        if (!gistId || !process.env.GITHUB_TOKEN) {
            console.warn('GIST_ID or GITHUB_TOKEN not set, using default content');
            return getDefaultContent();
        }

        const response = await fetch(`https://api.github.com/gists/${gistId}`, {
            headers: getHeaders()
        });

        if (!response.ok) {
            throw new Error(`GitHub API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const file = data.files['content.json'];

        if (!file) {
            throw new Error('content.json not found in Gist');
        }

        const content = JSON.parse(file.content);

        // Update cache
        memoryCache = content;
        lastFetch = now;

        return content;
    } catch (error) {
        console.error('Failed to read from Gist:', error);
        // Fallback to cache if available even if stale
        if (memoryCache) return memoryCache;
        return getDefaultContent();
    }
}

/**
 * Write content to Gist
 * @param {Object} content - Content object to write
 */
async function writeContent(content) {
    try {
        const gistId = process.env.GIST_ID;
        if (!gistId || !process.env.GITHUB_TOKEN) {
            throw new Error('GIST_ID or GITHUB_TOKEN not set');
        }

        const response = await fetch(`https://api.github.com/gists/${gistId}`, {
            method: 'PATCH',
            headers: {
                ...getHeaders(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                files: {
                    'content.json': {
                        content: JSON.stringify(content, null, 2)
                    }
                }
            })
        });

        if (!response.ok) {
            throw new Error(`GitHub API Update Error: ${response.status} ${response.statusText}`);
        }

        // Update cache immediately
        memoryCache = content;
        lastFetch = Date.now();

        console.log('Content saved to Gist successfully');
        return content;
    } catch (error) {
        console.error('Failed to write to Gist:', error);
        throw error;
    }
}

/**
 * Update a specific section of content
 */
async function updateSection(section, data) {
    const content = await readContent();
    content[section] = data;
    await writeContent(content);
    return content;
}

/**
 * Add an item to an array section
 */
async function addItem(section, item) {
    const { v4: uuidv4 } = require('uuid');
    const content = await readContent();

    if (!Array.isArray(content[section])) {
        throw new Error(`Section "${section}" is not an array`);
    }

    if (!item.id) {
        item.id = uuidv4();
    }

    content[section].push(item);
    await writeContent(content);
    return { content, item };
}

/**
 * Update an item in an array section
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
 * Get default content structure (Fallback)
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

// No-op for Gist implementation
async function initializeContent() {
    console.log('Gist storage initialized');
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
