const ACCESS_KEY = 'accessToken';
const REFRESH_KEY = 'refreshToken';

export const tokenStorage = {
    getAccess(): string | null {
        return localStorage.getItem(ACCESS_KEY);
    },
    setAccess(token: string) {
        localStorage.setItem(ACCESS_KEY, token);
    },
    getRefresh(): string | null {
        return localStorage.getItem(REFRESH_KEY);
    },
    setRefresh(token: string) {
        localStorage.setItem(REFRESH_KEY, token);
    },
    clear() {
        localStorage.removeItem(ACCESS_KEY);
        localStorage.removeItem(REFRESH_KEY);
    },
};