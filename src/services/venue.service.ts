import {urls} from '../constants/urls';
import {IVenueInterface} from '../interfaces/IVenueInterface';
import {IPromise} from '../types/reduxType';
import {axiosInstance} from './axiosInstance.service';

export const venueService = {
    getAll: (page: number, limit = 12): IPromise<{data: IVenueInterface[], total: number}> =>
        axiosInstance.get(urls.venue.base, {params: {limit, offset: (page - 1) * limit}}),

    getByVenueId: (id: string): IPromise<IVenueInterface> =>
        axiosInstance.get(urls.venue.venueById(id)),

    create: (payload: Partial<IVenueInterface>): IPromise<IVenueInterface> =>
        axiosInstance.post(urls.venue.base, payload),

    update: (id: string, payload: Partial<IVenueInterface>): IPromise<IVenueInterface> =>
        axiosInstance.patch(urls.venue.update(id), payload),

    setRating: (venueId: string, rating: number) =>
        axiosInstance.post(urls.rating.set(venueId), {rating}),

    removeRating: (venueId: string) =>
        axiosInstance.delete(urls.rating.remove(venueId)),

    addToFavorites: (venueId: string) =>
        axiosInstance.post(urls.favorites.add(venueId)),

    removeFromFavorites: (venueId: string) =>
        axiosInstance.delete(urls.favorites.remove(venueId)),

    contactManager: (venueId: string, message: string) =>
        axiosInstance.post(urls.contact.manager(venueId), {message}),
};