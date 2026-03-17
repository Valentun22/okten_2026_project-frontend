import {Outlet} from "react-router-dom";
import {FooterComponent} from "../components/FooterComponent/FooterComponent";
import css from './css/page.module.css';
import VerifyEmailComponent from "../components/VerifyEmailComponent/VerifyEmailComponent";

const VerifyEmailPage = () => {
    return (
        <div className={css.page}>
            <div className={css.content}>
                <VerifyEmailComponent/>
                <Outlet/>
            </div>
            <FooterComponent/>
        </div>
    );
};

export {VerifyEmailPage};