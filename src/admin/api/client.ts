/**
 * Admin API Client
 * Centralized API calls for admin panel
 */
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const AUTH_CREDENTIALS: RequestCredentials = 'include';

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
    if (response.status === 413) {
        throw new Error('Image too large. Please use an image under 4MB.');
    }

    let data: any;
    try {
        data = await response.json();
    } catch {
        throw new Error(`Request failed with status ${response.status}`);
    }

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
        credentials: AUTH_CREDENTIALS,
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
        credentials: AUTH_CREDENTIALS,
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
        credentials: AUTH_CREDENTIALS,
        headers: getAuthHeaders(),
        body: JSON.stringify(updates)
    });
    return handleResponse(response);
}

/**
 * Delete item from array section
 */
export async function deleteItem(section: string, itemId: string) {
    const url = `${API_URL}/api/content/${section}/items/${itemId}`;
    const headers = getAuthHeaders();
    
    console.log('DELETE Request Details:');
    console.log('   URL:', url);
    console.log('   Section:', section);
    console.log('   Item ID:', itemId);
    console.log('   Headers:', headers);
    
    const response = await fetch(url, {
        method: 'DELETE',
        credentials: AUTH_CREDENTIALS,
        headers: headers
    });
    
    console.log('DELETE Response:');
    console.log('   Status:', response.status);
    console.log('   Status Text:', response.statusText);
    console.log('   OK:', response.ok);
    
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
        credentials: AUTH_CREDENTIALS,
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
        credentials: AUTH_CREDENTIALS,
        headers: getAuthHeaders()
    });
    return handleResponse(response);
}

/**
 * List uploaded images
 */
export async function listImages() {
    const response = await fetch(`${API_URL}/api/upload/list`, {
        credentials: AUTH_CREDENTIALS,
        headers: getAuthHeaders()
    });
    return handleResponse(response);
}

export { API_URL };
