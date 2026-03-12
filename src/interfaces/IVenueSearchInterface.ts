export enum VenueCategoryEnum {
    RESTAURANT = 'restaurant',
    BAR = 'bar',
    CAFE = 'cafe',
    PUB = 'pub',
    CLUB = 'club',
    FAST_FOOD = 'fast_food',
    PIZZERIA = 'pizzeria',
    SUSHI = 'sushi',
    BREWERY = 'brewery',
    LOUNGE = 'lounge',
    STEAKHOUSE = 'steakhouse',
    BAKERY = 'bakery',
    COFFEE_SHOP = 'coffee_shop',
    WINE_BAR = 'wine_bar',
    FOOD_COURT = 'food_court',
    STREET_FOOD = 'street_food',
    KARAOKE = 'karaoke',
    HOOKAH = 'hookah',
}

export enum VenueSortByEnum {
    RATING = 'rating',
    AVERAGE_CHECK = 'averageCheck',
    CREATED = 'created',
    NAME = 'name',
}

export enum SortOrderEnum {
    ASC = 'ASC',
    DESC = 'DESC',
}

export interface IVenueListItem {
    id: string;
    name: string;
    avatarVenue?: string;
    created: string;
    averageCheck?: number;
    categories?: VenueCategoryEnum[];
    description?: string;
    tags?: string[];
    tag?: string;
    city?: string;
    ratingAvg?: number;
    ratingCount?: number;
    isActive: boolean;
    isLiked: boolean;
    isFavorite: boolean;
}

export interface IVenueSearchQuery {
    search?: string;
    limit?: number;
    offset?: number;
    categories?: VenueCategoryEnum[];
    city?: string;
    tag?: string;
    averageCheckFrom?: number;
    averageCheckTo?: number;
    ratingFrom?: number;
    ratingTo?: number;
    hasWiFi?: boolean;
    hasParking?: boolean;
    liveMusic?: boolean;
    petFriendly?: boolean;
    hasTerrace?: boolean;
    smokingAllowed?: boolean;
    cardPayment?: boolean;
    sortBy?: VenueSortByEnum;
    sortOrder?: SortOrderEnum;
}

export interface IVenueListResponse {
    data: IVenueListItem[];
    total: number;
    limit: number;
    offset: number;
}

export interface ITopCategory {
    id: string;
    title: string;
    slug: string;
    isActive: boolean;
    order: number;
}

export interface ITopCategoryWithVenues {
    category: ITopCategory;
    venues: IVenueListItem[];
}