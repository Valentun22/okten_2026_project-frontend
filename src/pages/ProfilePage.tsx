import {Outlet} from "react-router-dom";
import {FooterComponent} from "../components/FooterComponent/FooterComponent";
import css from './css/page.module.css';
import {Profile} from "../components/ProfileComponent/Profile";

const ProfilePage = () => {
    return (
        <div className={css.page}>
            <div className={css.content}>
                <Profile/>
                <Outlet/>
            </div>
            <FooterComponent/>
        </div>
    );
};

export {ProfilePage};