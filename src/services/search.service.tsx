import {urls} from '../constants/urls';
import {IVenueInterface} from '../interfaces/IVenueInterface';
import {IPromise} from '../types/reduxType';
import {axiosInstance} from './axiosInstance.service';

interface ISearchResponse {
    page: number;
    results: IVenueInterface[];
    total_pages: number;
    total_results: number;
}

export const searchService = {
    getAll: (query: string, page: number): IPromise<ISearchResponse> =>
        axiosInstance.get(urls.search.base, {params: {query, page}}),
};