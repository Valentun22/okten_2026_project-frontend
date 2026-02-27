export enum VenueCategoryEnum {
    CAFE = 'CAFE',
    BAR = 'BAR',
    RESTAURANT = 'RESTAURANT',
}

export type WorkingHours = Partial<{
    mon: string;
    tue: string;
    wed: string;
    thu: string;
    fri: string;
    sat: string;
    sun: string;
}>;

export type VenueSocials = Partial<{
    instagram: string;
    facebook: string;
    telegram: string;
}>;

export interface IUserShort {
    id: string;
    name?: string;
    avatar?: string;
}

export interface ITag {
    id: string;
    name: string;
}

export interface IBaseModel {
    id: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IVenueInterface extends IBaseModel {
    name: string;
    avatarVenue?: string;
    logoVenue?: string;
    image?: string[];

    menu?: string;
    averageCheck?: number;

    workingHours?: WorkingHours;

    city?: string;
    address?: string;

    categories?: VenueCategoryEnum[];

    isModerated: boolean;
    isActive: boolean;

    phone?: string;
    email?: string;
    website?: string;

    socials?: VenueSocials;

    description?: string;

    hasWiFi: boolean;
    hasParking: boolean;
    liveMusic: boolean;
    petFriendly: boolean;
    hasTerrace: boolean;
    smokingAllowed: boolean;
    cardPayment: boolean;

    user_id: string;
    user?: IUserShort;

    tags?: ITag[];

    likesCount?: number;
    commentsCount?: number;
    averageRating?: number;

    likes?: number;
    // comments?: IComment[];
    // news?: INews[];
    // complaints?: IComplaint[];
    rating?: number;
    // topItems?: ITopCategoryVenue[];
    // pyachok?: IPyachok[];
    favoritedBy?: IUserShort[];
}