import {axiosInstance} from './axiosInstance.service';
import {urls} from '../constants/urls';
import {IMessage, IMessageListResponse} from '../interfaces/IMessageInterface';

export const messageService = {
    send: (recipientId: string, text: string, pyachokId?: string) =>
        axiosInstance.post<IMessage>(urls.messages.send(recipientId), {text, pyachokId}),

    getInbox: (limit = 20, offset = 0) =>
        axiosInstance.get<IMessageListResponse>(urls.messages.inbox, {params: {limit, offset}}),

    getSent: (limit = 20, offset = 0) =>
        axiosInstance.get<IMessageListResponse>(urls.messages.sent, {params: {limit, offset}}),

    getUnreadCount: () =>
        axiosInstance.get<{count: number}>(urls.messages.unreadCount),

    markRead: (id: string) =>
        axiosInstance.patch<void>(urls.messages.markRead(id)),

    markAllRead: () =>
        axiosInstance.patch<void>(urls.messages.markAllRead),

    delete: (id: string) =>
        axiosInstance.delete<void>(urls.messages.delete(id)),
};