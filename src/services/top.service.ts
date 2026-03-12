import {axiosInstance} from './axiosInstance.service';
import {urls} from '../constants/urls';
import {ITopCategory, ITopCategoryWithVenues} from '../interfaces/IVenueSearchInterface';
import {IPromise} from '../types/reduxType';

export const topService = {
    getCategories: (): IPromise<ITopCategory[]> =>
        axiosInstance.get(urls.top.base),

    getCategoryBySlug: (slug: string): IPromise<ITopCategoryWithVenues> =>
        axiosInstance.get(`${urls.top.base}/${slug}`),
};