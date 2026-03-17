import {createBrowserRouter} from 'react-router-dom';
import {MainLayout} from '../layouts/MainLayout';
import {AboutUsPage} from '../pages/AboutUsPage';
import {TopVenuesPage} from '../pages/TopVenuesPage';
import {NewsPage} from '../pages/NewsPage';
import {SearchVenuePage} from '../pages/SearchVenuePage';
import {VenueCardPage} from '../pages/VenueCardPage';
import {CreateVenuePage} from "../pages/CreateVenuePage";
import {ProfilePage} from "../pages/ProfilePage";
import {PyachokPage} from "../pages/PyachokPage";
import {LoginPage} from "../pages/LoginPage";
import {RegisterPage} from "../pages/RegisterPage";
import {EditVenuePage} from "../pages/EditVenuePage";
import {AdminPage} from "../pages/AdminPage";
import {VenuesPage} from "../pages/VenuesPage";
import {UserPublicPage} from "../pages/UserPublicPage";
import {MessagesPage} from "../pages/MessagesPage";
import {VerifyEmailPage} from "../pages/VerifyEmailPage";
import {HomePage} from "../components/HomeComponent/HomePage";
import {NotFoundPage} from "../pages/NotFoundPage";

const router = createBrowserRouter([
    {
        path: '',
        element: <MainLayout/>,
        children: [
            {index: true, element: <HomePage/>},
            {path: 'aboutUs', element: <AboutUsPage/>},
            {path: '/news', element: <NewsPage/>},
            {path: '/searchVenue', element: <SearchVenuePage/>},
            {path: '/topVenues', element: <TopVenuesPage/>},
            {path: '/venues', element: <VenuesPage/>},
            {path: '/venues/create', element: <CreateVenuePage/>},
            {path: '/venues/:id', element: <VenueCardPage/>},
            {path: '/venues/:id/edit', element: <EditVenuePage/>},
            {path: '/profile', element: <ProfilePage/>},
            {path: '/pyachok', element: <PyachokPage/>},
            {path: '/users/:id', element: <UserPublicPage/>},
            {path: '/messages', element: <MessagesPage/>},
            {path: '*', element: <NotFoundPage/>},
        ],
    },
    {path: '/login', element: <LoginPage/>},
    {path: '/register', element: <RegisterPage/>},
    {path: '/verify-email', element: <VerifyEmailPage/>},
    {path: '/admin', element: <AdminPage/>},
    {path: '*', element: <NotFoundPage/>},
]);

export {router};