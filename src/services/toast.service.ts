type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastOptions {
    duration?: number;
}

const createToastContainer = (): HTMLElement => {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 8px;
            pointer-events: none;
        `;
        document.body.appendChild(container);
    }
    return container;
};

const colors: Record<ToastType, { bg: string; border: string; icon: string }> = {
    success: {bg: '#f0fdf4', border: '#86efac', icon: '✅'},
    error: {bg: '#fef2f2', border: '#fca5a5', icon: '❌'},
    warning: {bg: '#fefce8', border: '#fde68a', icon: '⚠️'},
    info: {bg: '#eff6ff', border: '#93c5fd', icon: 'ℹ️'},
};

const show = (message: string, type: ToastType = 'info', opts: ToastOptions = {}) => {
    const container = createToastContainer();
    const duration = opts.duration ?? 3500;
    const {bg, border, icon} = colors[type];

    const toast = document.createElement('div');
    toast.style.cssText = `
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px 16px;
        background: ${bg};
        border: 1.5px solid ${border};
        border-radius: 12px;
        box-shadow: 0 4px 16px rgba(0,0,0,0.1);
        font-family: Arial, sans-serif;
        font-size: 14px;
        font-weight: 500;
        color: #222;
        pointer-events: auto;
        max-width: 360px;
        opacity: 0;
        transform: translateX(20px);
        transition: opacity 0.25s, transform 0.25s;
        cursor: pointer;
    `;
    toast.innerHTML = `<span style="font-size:18px;flex-shrink:0">${icon}</span><span>${message}</span>`;
    toast.onclick = () => remove(toast);

    container.appendChild(toast);

    requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(0)';
    });

    const timer = setTimeout(() => remove(toast), duration);
    toast.dataset.timer = String(timer);
};

const remove = (toast: HTMLElement) => {
    clearTimeout(Number(toast.dataset.timer));
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    setTimeout(() => toast.remove(), 250);
};

export const toast = {
    success: (msg: string, opts?: ToastOptions) => show(msg, 'success', opts),
    error: (msg: string, opts?: ToastOptions) => show(msg, 'error', opts),
    warning: (msg: string, opts?: ToastOptions) => show(msg, 'warning', opts),
    info: (msg: string, opts?: ToastOptions) => show(msg, 'info', opts),
};