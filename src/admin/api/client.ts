/**
 * Admin API Client
 * Centralized API calls for admin panel
 */
import { normalizeApiBaseUrl } from '../../utils/apiUrl';
import { markContentUpdated } from '../../services/contentService';

const API_URL = normalizeApiBaseUrl(import.meta.env.VITE_API_URL, 'http://localhost:3001');
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

    let data: any = {};
    try {
        const text = await response.text();
        data = text.trim() ? JSON.parse(text) : {};
    } catch {
        throw new Error(`Request failed with status ${response.status}`);
    }

    if (!response.ok) {
        throw new Error(data.message || 'API request failed');
    }

    return data;
}

// ============ Auth API ============

/**
 * Get which sign-in methods the server currently allows
 */
export async function getAuthMethods(): Promise<{ enabled: boolean; passwordLoginEnabled: boolean }> {
    const response = await fetch(`${API_URL}/api/auth/google/status`);
    return handleResponse(response);
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
    const result = await handleResponse(response);
    markContentUpdated();
    return result;
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
    const result = await handleResponse(response);
    markContentUpdated();
    return result;
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
    const result = await handleResponse(response);
    markContentUpdated();
    return result;
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
    
    const result = await handleResponse(response);
    markContentUpdated();
    return result;
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

export const VIDEO_RECOMMENDED_MAX_BYTES = 8 * 1024 * 1024;
export const VIDEO_MAX_BYTES = 25 * 1024 * 1024; // mirrors backend VIDEO_MAX_BYTES

/**
 * Read a video file's duration and dimensions in the browser (no upload).
 * Resolves with nulls if the browser cannot decode the file.
 */
export function probeVideoFile(file: File): Promise<{ duration: number | null; width: number | null; height: number | null }> {
    return new Promise((resolve) => {
        const url = URL.createObjectURL(file);
        const el = document.createElement('video');
        el.preload = 'metadata';
        const done = (v: { duration: number | null; width: number | null; height: number | null }) => { URL.revokeObjectURL(url); resolve(v); };
        el.onloadedmetadata = () => done({ duration: el.duration, width: el.videoWidth, height: el.videoHeight });
        el.onerror = () => done({ duration: null, width: null, height: null });
        el.src = url;
    });
}

/**
 * Upload a video directly from the browser to Cloudinary.
 *
 * Flow: ask our API for a signature (auth-protected, tiny JSON), then POST the
 * file to Cloudinary's upload endpoint. The file never passes through our
 * serverless API, so it is not subject to Vercel's ~4.5 MB body limit.
 * Progress is reported via `onProgress` (0..1).
 */
export async function uploadVideo(
    file: File,
    onProgress?: (fraction: number) => void
): Promise<{ url: string; bytes: number; duration?: number; publicId: string }> {
    if (!file.type.startsWith('video/')) {
        throw new Error('Please choose a video file (MP4 recommended).');
    }
    if (file.size > VIDEO_MAX_BYTES) {
        throw new Error(`Video is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum is ${Math.round(VIDEO_MAX_BYTES / 1024 / 1024)} MB; please compress it first.`);
    }

    const signed = await fetch(`${API_URL}/api/upload/video/sign`, {
        method: 'POST',
        credentials: AUTH_CREDENTIALS,
        headers: getAuthHeaders(),
        body: JSON.stringify({ filename: file.name })
    }).then(handleResponse);

    const { cloudName, apiKey, signature, timestamp, folder, public_id, maxBytes } = signed.data;

    if (typeof maxBytes === 'number' && file.size > maxBytes) {
        throw new Error(`Video is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum is ${Math.round(maxBytes / 1024 / 1024)} MB; please compress it first.`);
    }

    const form = new FormData();
    form.append('file', file);
    form.append('api_key', apiKey);
    form.append('timestamp', String(timestamp));
    form.append('signature', signature);
    form.append('folder', folder);
    form.append('public_id', public_id);

    type CloudinaryVideoResponse = {
        secure_url: string;
        bytes: number;
        duration?: number;
        public_id: string;
        error?: { message?: string };
    };

    const result = await new Promise<CloudinaryVideoResponse>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`);
        xhr.upload.onprogress = (e) => {
            if (e.lengthComputable && onProgress) onProgress(e.loaded / e.total);
        };
        xhr.onerror = () => reject(new Error('Network error while uploading video'));
        xhr.onload = () => {
            let body: Partial<CloudinaryVideoResponse> = {};
            try { body = JSON.parse(xhr.responseText || '{}'); } catch { /* fall through */ }
            if (xhr.status >= 200 && xhr.status < 300) resolve(body as CloudinaryVideoResponse);
            else reject(new Error(body?.error?.message || `Video upload failed (${xhr.status})`));
        };
        xhr.send(form);
    });

    // q_auto lets Cloudinary re-encode at a perceptually tuned bitrate on
    // delivery; the container stays MP4 so <video src> works everywhere.
    const url: string = String(result.secure_url).replace('/video/upload/', '/video/upload/q_auto/');

    return {
        url,
        bytes: result.bytes,
        duration: result.duration,
        publicId: result.public_id
    };
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
