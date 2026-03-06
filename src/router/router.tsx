import { createBrowserRouter } from 'react-router-dom';
import { MainLayout }    from '../layouts/MainLayout';
import { HomePage }      from '../components/HomeComponent/HomePage';
import { AboutUsPage }   from '../pages/AboutUsPage';
import { TopVenuesPage } from '../pages/TopVenuesPage';
import { NewsPage }      from '../pages/NewsPage';
import { SearchVenuePage } from '../pages/SearchVenuePage';
import { VenueCardPage } from '../pages/VenueCardPage';
import { LoginPage }     from '../pages/LoginPage/LoginPage';
import { RegisterPage }  from '../pages/RegisterPage/RegisterPage';
import { ProfilePage }   from '../pages/ProfilePage/ProfilePage';

const router = createBrowserRouter([
    {
        path: '',
        element: <MainLayout />,
        children: [
            { index: true,          element: <HomePage /> },
            { path: 'aboutUs',      element: <AboutUsPage /> },
            { path: '/news',        element: <NewsPage /> },
            { path: '/searchVenue', element: <SearchVenuePage /> },
            { path: '/topVenues',   element: <TopVenuesPage /> },
            { path: '/venues/:id',  element: <VenueCardPage /> },
            { path: '/profile',     element: <ProfilePage /> },
        ],
    },
    { path: '/login',    element: <LoginPage /> },
    { path: '/register', element: <RegisterPage /> },
]);

export { router };