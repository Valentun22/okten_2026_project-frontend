export interface IMessageUser {
    id: string;
    name?: string;
    image?: string;
}

export interface IMessagePyachok {
    id: string;
    date: string;
    time: string;
    purpose?: string;
    venue?: { id: string; name: string };
}

export interface IMessage {
    id: string;
    text: string;
    isRead: boolean;
    created: string;
    sender?: IMessageUser;
    recipient?: IMessageUser;
    pyachok?: IMessagePyachok;
}

export interface IMessageListResponse {
    data: IMessage[];
    total: number;
    unread: number;
}

export interface ISendMessageDto {
    text: string;
    pyachokId?: string;
}