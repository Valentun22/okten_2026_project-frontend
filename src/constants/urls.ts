const baseUrl = 'localhost:3000';

const urls = {
    auth: {
        signUp:   `${baseUrl}/auth/sign-up`,
        signIn:   `${baseUrl}/auth/sign-in`,
        refresh:  `${baseUrl}/auth/refresh`,
        signOut:  `${baseUrl}/auth/sign-out`,
    },
    venue: {
        base:       `${baseUrl}/venues`,
        venueById:  (venueId: string): string => `${baseUrl}/venues/${venueId}`,
        create:     `${baseUrl}/venues`,
        update:     (venueId: string): string => `${baseUrl}/venues/${venueId}`,
    },
    tag:  { base: `${baseUrl}/tags/popular` },
    news: { base: `${baseUrl}/news` },
    newsVenue: {
        base: (venueId: string): string => `${baseUrl}/venues/${venueId}/news`,
    },
    top:      { base: `${baseUrl}/top/categories` },
    search:   { base: `${baseUrl}/search/venue` },
    categories: {
        base:          `${baseUrl}/categories`,
        categoryById:  (id: string): string => `${baseUrl}/categories/${id}`,
    },
    rating: {
        set:    (venueId: string): string => `${baseUrl}/venues/${venueId}/rating`,
        remove: (venueId: string): string => `${baseUrl}/venues/${venueId}/rating`,
    },
    favorites: {
        add:    (venueId: string): string => `${baseUrl}/venues/${venueId}/favorites`,
        remove: (venueId: string): string => `${baseUrl}/venues/${venueId}/favorites`,
    },
    contact: {
        manager: (venueId: string): string => `${baseUrl}/venues/${venueId}/contact`,
    },
    pyachok: {
        venueList: (venueId: string): string => `${baseUrl}/venues/${venueId}/pyachok`,
        create:    (venueId: string): string => `${baseUrl}/venues/${venueId}/pyachok`,
        myList:    `${baseUrl}/users/me/pyachok`,
        close:     (id: string): string => `${baseUrl}/pyachok/${id}/close`,
        delete:    (id: string): string => `${baseUrl}/pyachok/${id}`,
    },
};

export { baseUrl, urls };