/**
 * Admin API Client
 * Centralized API calls for admin panel
 */
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Get authorization headers
 */
function getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('admin_token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
}

/**
 * Handle API response
 */
async function handleResponse(response: Response) {
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'API request failed');
    }

    return data;
}

// ============ Content API ============

/**
 * Fetch all content
 */
export async function fetchContent() {
    const response = await fetch(`${API_URL}/api/content`);
    return handleResponse(response);
}

/**
 * Fetch specific section
 */
export async function fetchSection(section: string) {
    const response = await fetch(`${API_URL}/api/content/${section}`);
    return handleResponse(response);
}

/**
 * Update entire section
 */
export async function updateSection(section: string, data: unknown) {
    const response = await fetch(`${API_URL}/api/content/${section}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    return handleResponse(response);
}

/**
 * Add item to array section
 */
export async function addItem(section: string, item: unknown) {
    const response = await fetch(`${API_URL}/api/content/${section}/items`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(item)
    });
    return handleResponse(response);
}

/**
 * Update item in array section
 */
export async function updateItem(section: string, itemId: string, updates: unknown) {
    const response = await fetch(`${API_URL}/api/content/${section}/items/${itemId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates)
    });
    return handleResponse(response);
}

/**
 * Delete item from array section
 */
export async function deleteItem(section: string, itemId: string) {
    const response = await fetch(`${API_URL}/api/content/${section}/items/${itemId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    return handleResponse(response);
}

// ============ Upload API ============

/**
 * Upload image
 */
export async function uploadImage(file: File) {
    const token = localStorage.getItem('admin_token');
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        headers: {
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: formData
    });

    return handleResponse(response);
}

/**
 * Delete uploaded image
 */
export async function deleteImage(filename: string) {
    const response = await fetch(`${API_URL}/api/upload/${filename}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    return handleResponse(response);
}

/**
 * List uploaded images
 */
export async function listImages() {
    const response = await fetch(`${API_URL}/api/upload/list`, {
        headers: getAuthHeaders()
    });
    return handleResponse(response);
}

export { API_URL };
