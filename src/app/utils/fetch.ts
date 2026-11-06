// Backend API URL - uses environment variable in production, localhost in development
export const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4201';
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.injoyplan.com';

// A single in-flight refresh shared by every request that hits a 401,
// so concurrent requests don't each rotate (and invalidate) the refresh token.
let refreshing: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');
    if (!token || !refreshToken) return null;

    try {
        const resp = await fetch(`${BASE_URL}/authentication/refresh-token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ token, refreshToken }),
        });
        const body: any = await resp.json().catch(() => ({}));
        // Backend may return a data wrapper or the tokens directly
        const newToken = body?.data?.token || body?.accessToken;
        const newRefresh = body?.data?.refreshToken || body?.refreshToken;
        if (!resp.ok || !newToken) throw new Error('refresh failed');

        localStorage.setItem('token', newToken);
        if (newRefresh) localStorage.setItem('refreshToken', newRefresh);
        return newToken;
    } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        return null;
    }
}

async function fetchData<T>(url: string, options: RequestInit = {}, retried = false): Promise<T> {
    const response = await fetch(url, options);
    const headers = (options.headers || {}) as Record<string, string>;

    // Retry once with a fresh token if the request was authenticated
    if (response.status === 401 && headers.Authorization && !retried) {
        refreshing ??= refreshAccessToken().finally(() => { refreshing = null; });
        const newToken = await refreshing;
        if (newToken) {
            return fetchData<T>(url, { ...options, headers: { ...headers, Authorization: `Bearer ${newToken}` } }, true);
        }
    }

    // Callers read `message`/`statusCode` from error bodies, so return them instead of throwing
    return response.json().catch(() => ({ statusCode: response.status }) as T);
}

function authHeaders(json = true): Record<string, string> {
    const token = localStorage.getItem('token');
    return {
        ...(json ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

export function get<T>(endpoint: string): Promise<T> {
    return fetchData<T>(`${BASE_URL}/${endpoint}`, { method: 'GET', headers: authHeaders() });
}

export function post<T>(endpoint: string, data: any): Promise<T> {
    return fetchData<T>(`${BASE_URL}/${endpoint}`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(data) });
}

export function patch<T>(endpoint: string, data: any): Promise<T> {
    return fetchData<T>(`${BASE_URL}/${endpoint}`, { method: 'PATCH', headers: authHeaders(), body: JSON.stringify(data) });
}

export function put<T>(endpoint: string, data: any): Promise<T> {
    return fetchData<T>(`${BASE_URL}/${endpoint}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(data) });
}

export function del<T>(endpoint: string): Promise<T> {
    return fetchData<T>(`${BASE_URL}/${endpoint}`, { method: 'DELETE', headers: authHeaders(false) });
}

// Do NOT set Content-Type: the browser adds the multipart boundary.
export function postFormData<T>(endpoint: string, formData: FormData, method: 'POST' | 'PATCH' = 'POST'): Promise<T> {
    return fetchData<T>(`${BASE_URL}/${endpoint}`, { method, headers: authHeaders(false), body: formData });
}

// Backend (NestJS) error bodies look like { statusCode: 4xx, message }
export const isApiError = (resp: any): boolean => typeof resp?.statusCode === 'number' && resp.statusCode >= 400;
