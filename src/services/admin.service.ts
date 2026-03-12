import {axiosInstance} from './axiosInstance.service';
import {urls} from '../constants/urls';

export const adminService = {
    getVenues: (params?: object) => axiosInstance.get(urls.admin.venues, {params}),
    getPending: (params?: object) => axiosInstance.get(urls.admin.pendingVenues, {params}),
    moderateVenue: (id: string) => axiosInstance.patch(urls.admin.moderateVenue(id)),
    toggleActive: (id: string) => axiosInstance.patch(urls.admin.toggleActive(id)),
    updateVenue: (id: string, dto: object) => axiosInstance.patch(urls.admin.updateVenue(id), dto),
    deleteVenue: (id: string) => axiosInstance.delete(urls.admin.deleteVenue(id)),

    getUsers: (params?: object) => axiosInstance.get(urls.admin.users, {params}),
    updateUser: (id: string, dto: object) => axiosInstance.patch(urls.admin.updateUser(id), dto),
    deleteUser: (id: string) => axiosInstance.delete(urls.admin.deleteUser(id)),

    getComplaints: (params?: object) => axiosInstance.get(urls.admin.complaints, {params}),
    getComplaint: (id: string) => axiosInstance.get(urls.admin.complaintById(id)),
    updateComplaintStatus: (id: string, status: string) =>
        axiosInstance.patch(urls.admin.complaintStatus(id), {status}),

    getComments: (params?: object) => axiosInstance.get(urls.admin.allComments, {params}),
    deleteComment: (id: string) => axiosInstance.delete(urls.admin.deleteComment(id)),
    updateComment: (id: string, dto: object) => axiosInstance.patch(urls.admin.updateComment(id), dto),

    changeOwner: (venueId: string, userId: string) => axiosInstance.patch(urls.admin.changeOwner(venueId), {userId}),
    setVenueRating: (venueId: string, dto: {
        userId: string;
        rating: number
    }) => axiosInstance.patch(urls.admin.setRating(venueId), dto),
    deleteVenueRating: (venueId: string, userId: string) => axiosInstance.delete(urls.admin.deleteRating(venueId, userId)),

    getViewsSummary: (venueId: string, params?: object) =>
        axiosInstance.get(urls.admin.viewsSummary(venueId), {params}),
    getViewsTimeseries: (venueId: string, params?: object) =>
        axiosInstance.get(urls.admin.viewsTimeseries(venueId), {params}),

    getTopCategories: () => axiosInstance.get(urls.admin.topCategories),
    createTopCategory: (dto: object) => axiosInstance.post(urls.admin.topCategories, dto),
    updateTopCategory: (id: string, dto: object) => axiosInstance.patch(urls.admin.topCategory(id), dto),
    deleteTopCategory: (id: string) => axiosInstance.delete(urls.admin.topCategory(id)),
    addVenueToTop: (catId: string, dto: object) => axiosInstance.post(urls.admin.topCategoryVenues(catId), dto),
    removeVenueFromTop: (catId: string, venueId: string) => axiosInstance.delete(urls.admin.removeTopVenue(catId, venueId)),

    getCmsSettings: () => axiosInstance.get(urls.admin.settings),
    updateCmsSettings: (dto: Record<string, string>) => axiosInstance.patch(urls.admin.settings, dto),
};