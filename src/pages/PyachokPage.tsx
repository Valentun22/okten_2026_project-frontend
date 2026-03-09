import {Outlet} from "react-router-dom";
import {FooterComponent} from "../components/FooterComponent/FooterComponent";
import css from './css/page.module.css';
import {PyachokComponent} from "../components/PyachokComponents/PyachokComponent/PyachokComponent";

const PyachokPage = () => {
    return (
        <div className={css.page}>
            <div className={css.content}>
                <PyachokComponent/>
                <Outlet/>
            </div>
            <FooterComponent/>
        </div>
    );
};

export {PyachokPage};