import {createBrowserRouter, Navigate} from "react-router-dom";
import {MainLayout} from "../layouts/MainLayout";
import {NewsPage} from "../pages/NewsPage";
import {HomePage} from "../components/HomeComponent/HomePage";
import {SearchPage} from "../pages/SearchPage";
import {AboutUsPage} from "../pages/AboutUsPage";
import {TopVenuePage} from "../pages/TopVenuePage";

const router = createBrowserRouter([
    {path: '', element: <MainLayout/>,
        children: [
            { index: true, element: <HomePage/>},
            { path: 'news', element: <NewsPage/> },
            { path: 'topVenue', element: <TopVenuePage/> },
            { path: 'aboutUs', element: <AboutUsPage/> },
            { path: 'search/:query', element: <SearchPage/>,
                children: [
                    { index: true, element: <Navigate to={'venues'}/> }
                ] }
        ]
    }

]);
export { router };