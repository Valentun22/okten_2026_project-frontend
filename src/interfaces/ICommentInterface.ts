export enum CommentRecommendationEnum {
    RECOMMEND     = 'recommend',
    NOT_RECOMMEND = 'not_recommend',
}

export interface ICreateCommentDto {
    title:          string;
    body:           string;
    rating:         number;
    recommendation?: CommentRecommendationEnum;
    image_check?:   string;
}

export interface ICommentUser {
    id:       string;
    name?:    string;
    image?:   string;
    isCritic?: boolean;
}

export interface IComment {
    id:              string;
    title:           string;
    body:            string;
    rating:          number;
    recommendation?: CommentRecommendationEnum | null;
    image_check?:    string | null;
    created:         string;
    updated:         string;
    user:            ICommentUser;
    isCritic:        boolean;
    isOwner:         boolean;
    venueId?:        string;
}

export interface ICommentListResponse {
    data:   IComment[];
    total:  number;
    limit:  number;
    offset: number;
}