import { axiosInstance } from './axiosInstance.service';
import { urls } from '../constants/urls';
import {
    ICreatePyachokDto,
    IPyachokItem,
    IPyachokListQuery,
    IPyachokListResponse,
} from '../interfaces/IPyachokInterface';

export const pyachokService = {
    create: (venueId: string, dto: ICreatePyachokDto) =>
        axiosInstance.post<IPyachokItem>(urls.pyachok.create(venueId), dto),

    getVenueList: (venueId: string, query?: IPyachokListQuery) =>
        axiosInstance.get<IPyachokListResponse>(urls.pyachok.venueList(venueId), { params: query }),

    getMyList: (query?: IPyachokListQuery) =>
        axiosInstance.get<IPyachokListResponse>(urls.pyachok.myList, { params: query }),

    close: (id: string) =>
        axiosInstance.patch<IPyachokItem>(urls.pyachok.close(id)),

    delete: (id: string) =>
        axiosInstance.delete<void>(urls.pyachok.delete(id)),
};