import { urls } from '../constants/urls';
import { IVenueInterface } from '../interfaces/IVenueInterface';
import { IPromise } from '../types/reduxType';
import {axiosInstance} from "./axiosInstance.service";

export const venueService = {
    getAll: (page: number): IPromise<IVenueInterface[]> =>
        axiosInstance.get(urls.venue.base, { params: { page } }),

    getByMovieId: (id: string): IPromise<IVenueInterface> =>
        axiosInstance.get(urls.venue.venueById(id)),

    create: (payload: Partial<IVenueInterface>): IPromise<IVenueInterface> =>
        axiosInstance.post(urls.venue.base, payload),

    update: (id: string, payload: Partial<IVenueInterface>): IPromise<IVenueInterface> =>
        axiosInstance.patch(urls.venue.update(id), payload),
};