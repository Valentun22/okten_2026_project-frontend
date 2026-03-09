import {axiosInstance} from './axiosInstance.service';
import {urls} from '../constants/urls';

export const adminService = {
    // ── Venues ──────────────────────────────────────────────
    getVenues: (params?: object) => axiosInstance.get(urls.admin.venues, {params}),
    getPending: (params?: object) => axiosInstance.get(urls.admin.pendingVenues, {params}),
    moderateVenue: (id: string) => axiosInstance.patch(urls.admin.moderateVenue(id)),
    toggleActive: (id: string) => axiosInstance.patch(urls.admin.toggleActive(id)),
    updateVenue: (id: string, dto: object) => axiosInstance.patch(urls.admin.updateVenue(id), dto),
    deleteVenue: (id: string) => axiosInstance.delete(urls.admin.deleteVenue(id)),

    // ── Users ────────────────────────────────────────────────
    getUsers: (params?: object) => axiosInstance.get(urls.admin.users, {params}),
    updateUser: (id: string, dto: object) => axiosInstance.patch(urls.admin.updateUser(id), dto),
    deleteUser: (id: string) => axiosInstance.delete(urls.admin.deleteUser(id)),

    // ── Complaints ───────────────────────────────────────────
    getComplaints: (params?: object) => axiosInstance.get(urls.admin.complaints, {params}),
    getComplaint: (id: string) => axiosInstance.get(urls.admin.complaintById(id)),
    updateComplaintStatus: (id: string, status: string) =>
        axiosInstance.patch(urls.admin.complaintStatus(id), {status}),

    // ── Comments ─────────────────────────────────────────────
    deleteComment: (id: string) => axiosInstance.delete(urls.admin.deleteComment(id)),

    // ── Analytics ────────────────────────────────────────────
    getViewsSummary: (venueId: string, params?: object) =>
        axiosInstance.get(urls.admin.viewsSummary(venueId), {params}),

    // ── Top Categories ───────────────────────────────────────
    getTopCategories: () => axiosInstance.get(urls.admin.topCategories),
    createTopCategory: (dto: object) => axiosInstance.post(urls.admin.topCategories, dto),
    updateTopCategory: (id: string, dto: object) => axiosInstance.patch(urls.admin.topCategory(id), dto),
    deleteTopCategory: (id: string) => axiosInstance.delete(urls.admin.topCategory(id)),
    addVenueToTop: (catId: string, dto: object) => axiosInstance.post(urls.admin.topCategoryVenues(catId), dto),
    removeVenueFromTop: (catId: string, venueId: string) => axiosInstance.delete(urls.admin.removeTopVenue(catId, venueId)),
};