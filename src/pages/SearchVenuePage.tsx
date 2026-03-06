import {Outlet} from "react-router-dom";
import {FooterComponent} from "../components/FooterComponent/FooterComponent";
import css from './css/page.module.css';
import {SearchVenue} from "../components/VenueSearchComponents/SearchVenue/SearchVenue";

const SearchVenuePage = () => {
    return (
        <div className={css.page}>
            <div className={css.content}>
                <SearchVenue/>
                <Outlet/>
            </div>
            <FooterComponent/>
        </div>
    );
};

export {SearchVenuePage};