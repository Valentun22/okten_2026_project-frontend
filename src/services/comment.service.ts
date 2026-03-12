import {axiosInstance} from './axiosInstance.service';
import {urls} from '../constants/urls';
import {IComment, ICommentListResponse, ICreateCommentDto} from '../interfaces/ICommentInterface';

export const commentService = {
    getList: (venueId: string, params?: { limit?: number; offset?: number }) =>
        axiosInstance.get<ICommentListResponse>(urls.comments.list(venueId), {params}),

    create: (venueId: string, dto: ICreateCommentDto) =>
        axiosInstance.post<IComment>(urls.comments.create(venueId), dto),

    update: (commentId: string, dto: Partial<ICreateCommentDto>) =>
        axiosInstance.patch<IComment>(urls.comments.update(commentId), dto),

    delete: (commentId: string) =>
        axiosInstance.delete<void>(urls.comments.delete(commentId)),
};