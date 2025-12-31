/**
 * File Service - Strict Gist Storage Implementation
 * 
 * STRATEGY:
 * We use GitHub Gist as the PRIMARY Database.
 * No reliance on local storage for persistence.
 * 
 * HOW IT WORKS:
 * 1. READ: We fetch the raw JSON from your private Gist URL (or API).
 * 2. WRITE: We use the GitHub API to update that Gist.
 * 3. CACHE: To make it fast/avoid rate limits, we remember the last fetch for 30 seconds.
 * 
 * REQUIRED ENV VARS:
 * - GIST_ID: 9edd7314a8b2f69a855037af01072b7e
 * - GITHUB_TOKEN: ghp_...
 */
const config = require('../config');

// Simple in-memory cache to prevent hitting GitHub Rate Limits
let memoryCache = null;
let lastFetch = 0;
const CACHE_TTL = 30000; // 30 seconds cache

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
    const now = Date.now();
    // Use cache if fresh
    if (memoryCache && (now - lastFetch) < CACHE_TTL) {
        return memoryCache;
    }

    try {
        const gistId = process.env.GIST_ID;
        if (!gistId || !process.env.GITHUB_TOKEN) {
            console.error('CRITICAL: GIST_ID or GITHUB_TOKEN not set');
            throw new Error('GIST_ID or GITHUB_TOKEN not set');
        }

        console.log(`Fetching Gist: ${gistId}...`);
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

        let content;
        try {
            content = JSON.parse(file.content);
        } catch (e) {
            // If gist file is truncated or raw url needed
            if (file.truncated) {
                const rawResp = await fetch(file.raw_url);
                content = await rawResp.json();
            } else {
                throw e;
            }
        }

        // Update cache
        memoryCache = content;
        lastFetch = now;
        console.log('Gist fetched successfully');

        return content;
    } catch (error) {
        console.error('Failed to read from Gist:', error);
        // Fallback to cache if available
        if (memoryCache) return memoryCache;
        throw error;
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

        console.log('Writing to Gist...');
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
 * Update a specific section
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
        content[section] = [];
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

// Initialize content (optional prompt)
async function initializeContent() {
    console.log('Gist storage mode active');
}

module.exports = {
    readContent,
    writeContent,
    updateSection,
    addItem,
    updateItem,
    deleteItem,
    initializeContent
};
