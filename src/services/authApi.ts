export type OAuthProvider = 'google' | 'facebook' | 'apple';

const API_URL =
    (import.meta as any).env?.VITE_API_URL ||
    (process.env as any).REACT_APP_API_URL;

export async function oauthLogin(provider: OAuthProvider, payload: any) {
    const res = await fetch(`${API_URL}/auth/oauth/${provider}`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        credentials: 'include',
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(text || `OAuth login failed: ${res.status}`);
    }

    return res.json() as Promise<{ accessToken: string; refreshToken?: string }>;
}