import { urls } from '../constants/urls';
import { tokenStorage } from './tokenStorage';
import {axiosInstance} from "./axiosInstance.service";

type LoginReq = { email: string; password: string; deviceId?: string };
type LoginRes = { accessToken: string; refreshToken: string };

export const authService = {
    async login(dto: LoginReq) {
        const { data } = await axiosInstance.post<LoginRes>(urls.auth.signIn, dto);
        tokenStorage.setAccess(data.accessToken);
        tokenStorage.setRefresh(data.refreshToken);
        return data;
    },

    async register(dto: any) {
        const { data } = await axiosInstance.post(urls.auth.signUp, dto);
        return data;
    },

    logout() {
        tokenStorage.clear();
    },
};