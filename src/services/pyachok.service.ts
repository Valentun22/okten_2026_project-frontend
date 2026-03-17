import {axiosInstance} from './axiosInstance.service';
import {urls} from '../constants/urls';
import {
    ICreatePyachokDto,
    IPyachokItem,
    IPyachokListQuery,
    IPyachokListResponse,
} from '../interfaces/IPyachokInterface';

export const pyachokService = {
    create: (venueId: string, dto: ICreatePyachokDto) =>
        axiosInstance.post<IPyachokItem>(urls.pyachok.create(venueId), dto),

    getOpenFeed: (query?: IPyachokListQuery) =>
        axiosInstance.get<IPyachokListResponse>(urls.pyachok.feed, {params: query}),

    getVenueList: (venueId: string, query?: IPyachokListQuery) =>
        axiosInstance.get<IPyachokListResponse>(urls.pyachok.venueList(venueId), {params: query}),

    getMyList: (query?: IPyachokListQuery) =>
        axiosInstance.get<IPyachokListResponse>(urls.pyachok.myList, {params: query}),

    update: (id: string, dto: ICreatePyachokDto) =>
        axiosInstance.patch<IPyachokItem>(urls.pyachok.update(id), dto),

    close: (id: string) =>
        axiosInstance.patch<IPyachokItem>(urls.pyachok.close(id)),

    closeAny: (id: string) =>
        axiosInstance.patch<IPyachokItem>(urls.pyachok.closeAny(id)),

    delete: (id: string) =>
        axiosInstance.delete<void>(urls.pyachok.delete(id)),

    deleteAny: (id: string) =>
        axiosInstance.delete<void>(urls.pyachok.deleteAny(id)),
};