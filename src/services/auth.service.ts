import {urls} from '../constants/urls';
import {tokenStorage} from './tokenStorage';
import {axiosInstance} from "./axiosInstance.service";

type LoginReq = { email: string; password: string; deviceId?: string };
type AuthRes = {
    tokens: { accessToken: string; refreshToken: string };
    user: any;
};

export const authService = {
    async login(dto: LoginReq) {
        const {data} = await axiosInstance.post<AuthRes>(urls.auth.signIn, dto);
        tokenStorage.setAccess(data.tokens.accessToken);
        tokenStorage.setRefresh(data.tokens.refreshToken);
        return data;
    },

    async oauthLogin(dto: { provider: string; token: string }) {
        const {data} = await axiosInstance.post<AuthRes>(urls.auth.oauth, dto);
        tokenStorage.setAccess(data.tokens.accessToken);
        tokenStorage.setRefresh(data.tokens.refreshToken);
        return data;
    },

    async register(dto: any) {
        const {data} = await axiosInstance.post<{ message: string }>(urls.auth.signUp, dto);
        return data;
    },

    logout() {
        tokenStorage.clear();
    },
};