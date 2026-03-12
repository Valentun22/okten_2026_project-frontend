import {axiosInstance} from './axiosInstance.service';
import {urls} from '../constants/urls';
import {INewsListResponse, INewsQuery} from '../interfaces/INewsInterface';
import {IPromise} from '../types/reduxType';

export const newsService = {
    getAll: (query?: INewsQuery): IPromise<INewsListResponse> =>
        axiosInstance.get(urls.news.base, {params: query}),
};