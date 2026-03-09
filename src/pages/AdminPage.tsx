import {Outlet} from "react-router-dom";
import {FooterComponent} from "../components/FooterComponent/FooterComponent";
import css from './css/page.module.css';
import {AdminComponent} from "../components/AdminComponents/AdminComponent";

const AdminPage = () => {
    return (
        <div className={css.page}>
            <div className={css.content}>
                <AdminComponent/>
                <Outlet/>
            </div>
            <FooterComponent/>
        </div>
    );
};

export {AdminPage};