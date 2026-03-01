// Central API utility — reads base URL from env so it works everywhere
const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

async function request<T>(
    path: string,
    options: RequestInit = {}
): Promise<T> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('gameon_token') : null;
    const res = await fetch(`${BASE}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(options.headers || {}),
        },
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(err.message || 'Request failed');
    }
    return res.json();
}

export const api = {
    get: <T>(path: string) => request<T>(path),
    post: <T>(path: string, body: unknown) =>
        request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
    put: <T>(path: string, body: unknown) =>
        request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
    delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};

// Auth helpers
export function getStoredToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('gameon_token');
}

export interface StoredUser {
    id: string;
    username: string;
    email: string;
    displayName?: string;
    avatarUrl?: string;
}

export function getStoredUser(): StoredUser | null {
    if (typeof window === 'undefined') return null;
    try {
        const raw = localStorage.getItem('gameon_user');
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export function storeAuth(token: string, user: StoredUser) {
    localStorage.setItem('gameon_token', token);
    localStorage.setItem('gameon_user', JSON.stringify(user));
}

export function clearAuth() {
    localStorage.removeItem('gameon_token');
    localStorage.removeItem('gameon_user');
}
