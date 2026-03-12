import {axiosInstance} from './axiosInstance.service';
import {urls} from '../constants/urls';
import {IVenueListResponse, IVenueSearchQuery} from '../interfaces/IVenueSearchInterface';
import {IPromise} from '../types/reduxType';

export const venueSearchService = {
    search: (query: IVenueSearchQuery): IPromise<IVenueListResponse> =>
        axiosInstance.get(urls.venue.base, {params: query}),
};