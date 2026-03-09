import {Outlet} from "react-router-dom";
import {FooterComponent} from "../components/FooterComponent/FooterComponent";
import css from './css/page.module.css';
import {UserPublicComponent} from "../components/UserPublicComponent/UserPublic";

const UserPublicPage = () => {
    return (
        <div className={css.page}>
            <div className={css.content}>
                <UserPublicComponent/>
                <Outlet/>
            </div>
            <FooterComponent/>
        </div>
    );
};

export {UserPublicPage};