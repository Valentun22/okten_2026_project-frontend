import {Outlet} from "react-router-dom";
import {TopVenues} from "../components/TopComponents/TopVenuesComponents/TopVenue";
import {FooterComponent} from "../components/FooterComponent/FooterComponent";
import css from './css/page.module.css';

const TopVenuesPage = () => {
    return (
        <div className={css.page}>
            <div className={css.content}>
                <TopVenues/>
                <Outlet/>
            </div>
            <FooterComponent/>
        </div>
    );
};

export {TopVenuesPage};