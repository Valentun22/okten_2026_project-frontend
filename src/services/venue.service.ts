import { urls } from '../constants/urls';
import { IVenueInterface } from '../interfaces/IVenueInterface';
import { IPromise } from '../types/reduxType';
import {axiosInstance} from "./axiosInstance.service";

export const venueService = {
    getAll: (page: number): IPromise<IVenueInterface[]> =>
        axiosInstance.get(urls.venue.base, { params: { page } }),

    getById: (venueId: string): IPromise<IVenueInterface> =>
        axiosInstance.get(urls.venue.venueById(venueId)),

    create: (payload: Partial<IVenueInterface>): IPromise<IVenueInterface> =>
        axiosInstance.post(urls.venue.base, payload),

    update: (venueId: string, payload: Partial<IVenueInterface>): IPromise<IVenueInterface> =>
        axiosInstance.patch(urls.venue.update(venueId), payload),
};