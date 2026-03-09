const baseUrl = 'localhost:3000';

const urls = {
    auth: {
        signUp:   `${baseUrl}/auth/sign-up`,
        signIn:   `${baseUrl}/auth/sign-in`,
        refresh:  `${baseUrl}/auth/refresh`,
        signOut:  `${baseUrl}/auth/sign-out`,
    },
    venue: {
        base:      `${baseUrl}/venues`,
        venueById: (id: string) => `${baseUrl}/venues/${id}`,
        create:    `${baseUrl}/venues`,
        update:    (id: string) => `${baseUrl}/venues/${id}`,
        delete:    (id: string) => `${baseUrl}/venues/${id}`,
    },
    tag:  { base: `${baseUrl}/tags/popular` },
    news: { base: `${baseUrl}/news` },
    newsVenue: {
        base:   (venueId: string) => `${baseUrl}/venues/${venueId}/news`,
        update: (newsId: string)  => `${baseUrl}/news/${newsId}`,
        delete: (newsId: string)  => `${baseUrl}/news/${newsId}`,
    },
    top:      { base: `${baseUrl}/top/categories` },
    search:   { base: `${baseUrl}/search/venue` },
    categories: {
        base:         `${baseUrl}/categories`,
        categoryById: (id: string) => `${baseUrl}/categories/${id}`,
    },
    rating: {
        set:    (venueId: string) => `${baseUrl}/venues/${venueId}/rating`,
        remove: (venueId: string) => `${baseUrl}/venues/${venueId}/rating`,
    },
    favorites: {
        add:    (venueId: string) => `${baseUrl}/venues/${venueId}/favorites`,
        remove: (venueId: string) => `${baseUrl}/venues/${venueId}/favorites`,
        myList: `${baseUrl}/users/me/favorites`,
    },
    likes: {
        add:    (venueId: string) => `${baseUrl}/venues/${venueId}/like`,
        remove: (venueId: string) => `${baseUrl}/venues/${venueId}/like`,
    },
    contact: {
        manager: (venueId: string) => `${baseUrl}/venues/${venueId}/contact`,
    },
    complaint: {
        create: (venueId: string) => `${baseUrl}/venues/${venueId}/complaints`,
    },
    comments: {
        list:   (venueId: string) => `${baseUrl}/venues/${venueId}/comments`,
        create: (venueId: string) => `${baseUrl}/venues/${venueId}/comments`,
        update: (commentId: string) => `${baseUrl}/comments/${commentId}`,
        delete: (commentId: string) => `${baseUrl}/comments/${commentId}`,
    },
    users: {
        me:           `${baseUrl}/users/me`,
        updateMe:     `${baseUrl}/users/me`,
        deleteMe:     `${baseUrl}/users/me`,
        myComments:   `${baseUrl}/users/me/comments`,
        myRatings:    `${baseUrl}/users/me/ratings`,
        myFavorites:  `${baseUrl}/users/me/favorites`,
        uploadAvatar: `${baseUrl}/users/me/avatar`,
    },
    pyachok: {
        venueList: (venueId: string) => `${baseUrl}/venues/${venueId}/pyachok`,
        create:    (venueId: string) => `${baseUrl}/venues/${venueId}/pyachok`,
        myList:    `${baseUrl}/users/me/pyachok`,
        close:     (id: string) => `${baseUrl}/pyachok/${id}/close`,
        delete:    (id: string) => `${baseUrl}/pyachok/${id}`,
    },
    analytics: {
        viewsSummary:    (venueId: string) => `${baseUrl}/venues/${venueId}/analytics/views/summary`,
        viewsTimeseries: (venueId: string) => `${baseUrl}/venues/${venueId}/analytics/views/timeseries`,
    },
    admin: {
        venues:            `${baseUrl}/admin/venues`,
        pendingVenues:     `${baseUrl}/admin/venues/pending`,
        moderateVenue:     (id: string) => `${baseUrl}/admin/venues/${id}/moderate`,
        toggleActive:      (id: string) => `${baseUrl}/admin/venues/${id}/active`,
        updateVenue:       (id: string) => `${baseUrl}/admin/venues/${id}`,
        deleteVenue:       (id: string) => `${baseUrl}/admin/venues/${id}`,
        users:             `${baseUrl}/admin/users`,
        updateUser:        (id: string) => `${baseUrl}/admin/users/${id}`,
        deleteUser:        (id: string) => `${baseUrl}/admin/users/${id}`,
        complaints:        `${baseUrl}/admin/complaints`,
        complaintById:     (id: string) => `${baseUrl}/admin/complaints/${id}`,
        complaintStatus:   (id: string) => `${baseUrl}/admin/complaints/${id}/status`,
        topCategories:     `${baseUrl}/admin/top/categories`,
        topCategory:       (id: string) => `${baseUrl}/admin/top/categories/${id}`,
        topCategoryVenues: (id: string) => `${baseUrl}/admin/top/categories/${id}/venues`,
        removeTopVenue:    (catId: string, venueId: string) => `${baseUrl}/admin/top/categories/${catId}/venues/${venueId}`,
        viewsSummary:      (venueId: string) => `${baseUrl}/admin/analytics/venues/${venueId}/views/summary`,
        viewsTimeseries:   (venueId: string) => `${baseUrl}/admin/analytics/venues/${venueId}/views/timeseries`,
        deleteComment:     (id: string) => `${baseUrl}/admin/comments/${id}`,
    },
};

export { baseUrl, urls };