import {Outlet} from "react-router-dom";
import {FooterComponent} from "../components/FooterComponent/FooterComponent";
import css from './css/page.module.css';
import {EditVenueComponent} from "../components/CreateVenueComponent/EditVenueComponent/EditVenueComponent";

const EditVenuePage = () => {
    return (
        <div className={css.page}>
            <div className={css.content}>
                <EditVenueComponent/>
                <Outlet/>
            </div>
            <FooterComponent/>
        </div>
    );
};

export {EditVenuePage};