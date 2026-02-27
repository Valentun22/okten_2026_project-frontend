import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { baseUrl, urls } from '../constants/urls';
import { tokenStorage } from './tokenStorage';

type RefreshRes = {
    accessToken: string;
    refreshToken?: string;
};

export const axiosInstance = axios.create({
    baseURL: baseUrl,
});

let isRefreshing = false;
let queue: Array<(token: string | null) => void> = [];

const runQueue = (token: string | null) => {
    queue.forEach((cb) => cb(token));
    queue = [];
};

axiosInstance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = tokenStorage.getAccess();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

axiosInstance.interceptors.response.use(
    (res) => res,
    async (error: AxiosError) => {
        const originalRequest: any = error.config;

        if (error.response?.status !== 401) return Promise.reject(error);

        if (originalRequest?._retry) return Promise.reject(error);
        originalRequest._retry = true;

        const refreshToken = tokenStorage.getRefresh();
        if (!refreshToken) {
            tokenStorage.clear();
            return Promise.reject(error);
        }

        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                queue.push((newToken) => {
                    if (!newToken) return reject(error);
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    resolve(axiosInstance(originalRequest));
                });
            });
        }

        isRefreshing = true;

        try {
            const refreshClient = axios.create({ baseURL: baseUrl });

            const { data } = await refreshClient.post<RefreshRes>(
                urls.auth.refresh,
                { refreshToken }
            );

            tokenStorage.setAccess(data.accessToken);
            if (data.refreshToken) tokenStorage.setRefresh(data.refreshToken);

            runQueue(data.accessToken);

            originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
            return axiosInstance(originalRequest);
        } catch (e) {
            runQueue(null);
            tokenStorage.clear();
            return Promise.reject(e);
        } finally {
            isRefreshing = false;
        }
    }
);