import {Outlet} from "react-router-dom";
import {FooterComponent} from "../components/FooterComponent/FooterComponent";
import css from './css/page.module.css';
import {MessagesComponent} from "../components/MessagesComponent/MessagesComponent";

const MessagesPage = () => {
    return (
        <div className={css.page}>
            <div className={css.content}>
                <MessagesComponent/>
                <Outlet/>
            </div>
            <FooterComponent/>
        </div>
    );
};

export {MessagesPage};