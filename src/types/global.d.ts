interface ImportMetaEnv {
    readonly VITE_API_URL: string;
    readonly VITE_GOOGLE_CLIENT_ID: string;
    readonly VITE_FACEBOOK_APP_ID: string;
    readonly VITE_APPLE_CLIENT_ID: string;
    readonly VITE_APPLE_REDIRECT_URI: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

interface Window {
    google?: {
        accounts: {
            id: {
                initialize: (cfg: any) => void;
                renderButton: (el: HTMLElement | null, cfg: any) => void;
                prompt: () => void;
            };
        };
    };
    FB?: {
        init: (cfg: any) => void;
        login: (cb: (r: any) => void, opts: any) => void;
        getLoginStatus: (cb: (r: any) => void) => void;
    };
}