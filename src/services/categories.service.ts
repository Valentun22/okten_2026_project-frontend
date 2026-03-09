import {IVenueInterface} from "../interfaces/IVenueInterface";
import {IPromise} from "../types/reduxType";
import {axiosInstance} from "./axiosInstance.service";
import {IVenueCategoryInterface} from "../interfaces/IVenueCategoryInterface";
import {urls} from "../constants/urls";

export const categoriesService = {
    getAll: (): IPromise<{ categories: IVenueCategoryInterface[] }> => axiosInstance.get(urls.categories.base),
    getByCategoryId: (id: string, page?: number): IPromise<{
        results: IVenueInterface[]
    }> => axiosInstance.get(urls.categories.categoryById(id), {params: {page}})
}