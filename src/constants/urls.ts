const baseUrl = 'localhost:3001';

const urls = {
    auth: {
        signUp: `${baseUrl}/auth/sign-up`,
        signIn: `${baseUrl}/auth/sign-in`,
        refresh: `${baseUrl}/auth/refresh`,
        signOut: `${baseUrl}/auth/sign-out`,
    },
    venue: {
        base: `${baseUrl}/venues`,
        venueById: (venueId: string): string => `${baseUrl}/venues/${venueId}`,
        create: `${baseUrl}/venues`,
        update: (venueId: string): string => `${baseUrl}/venues/${venueId}`,
    },
    tag: {
        base: `${baseUrl}/tags/popular`,
    },
    news: {
        base: `${baseUrl}/news`
    },
    newsVenue: {
        base: (venueId: string): string => `${baseUrl}/venues/${venueId}/news`
    },
    top: {
        base: `${baseUrl}/top/categories`
    },
    search: {
        base: `${baseUrl}/search/venue`
    },
    categories: {
        base: `${baseUrl}/categories`,
        categoryById: (id: string): string => `${baseUrl}/categories/${id}`,
    },
};
export {
    baseUrl,
    urls
};
