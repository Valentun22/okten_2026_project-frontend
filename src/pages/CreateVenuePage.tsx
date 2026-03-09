import {Outlet} from "react-router-dom";
import {FooterComponent} from "../components/FooterComponent/FooterComponent";
import css from './css/page.module.css';
import {CreateVenue} from "../components/CreateVenueComponent/CreateVenue";

const CreateVenuePage = () => {
    return (
        <div className={css.page}>
            <div className={css.content}>
                <CreateVenue/>
                <Outlet/>
            </div>
            <FooterComponent/>
        </div>
    );
};

export {CreateVenuePage};