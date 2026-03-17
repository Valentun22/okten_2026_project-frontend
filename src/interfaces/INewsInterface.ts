export enum NewsTypeEnum {
    GENERAL = 'general',
    PROMOTION = 'promotion',
    EVENT = 'event',
}

export interface INewsVenue {
    id: string;
    name: string;
    avatarVenue?: string | null;
    logoVenue?: string | null;
}

export interface INewsItem {
    id: string;
    title: string;
    body: string;
    type: NewsTypeEnum;
    isActive: boolean;
    isPaid: boolean;
    avatarNews?: string | null;
    images?: string[] | null;
    created: string;
    updated: string;
    venue: INewsVenue;
}

export interface INewsListResponse {
    data: INewsItem[];
    total: number;
    limit: number;
    offset: number;
}

export interface INewsQuery {
    type?: NewsTypeEnum;
    offset?: number;
    limit?: number;
}