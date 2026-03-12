import {axiosInstance} from './axiosInstance.service';
import {urls} from '../constants/urls';

export const userService = {
    getMe: () =>
        axiosInstance.get(urls.users.me),

    updateMe: (dto: {
        name?: string;
        bio?: string;
        image?: string;
        birthdate?: string;
        city?: string;
        gender?: string;
        instagram?: string;
        interests?: string;
    }) =>
        axiosInstance.put(urls.users.updateMe, dto),

    deleteMe: () =>
        axiosInstance.delete(urls.users.deleteMe),

    getMyFavorites: () =>
        axiosInstance.get(urls.users.myFavorites),

    getMyComments: (params?: { limit?: number; offset?: number }) =>
        axiosInstance.get(urls.users.myComments, {params}),

    getMyRatings: (params?: { limit?: number; offset?: number }) =>
        axiosInstance.get(urls.users.myRatings, {params}),
};