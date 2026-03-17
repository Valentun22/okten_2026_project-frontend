import {Outlet} from 'react-router-dom';
import {FooterComponent} from '../components/FooterComponent/FooterComponent';
import css from './css/page.module.css';
import {Venues} from "../components/VenueListComponents/Venues/Venues";

const VenuesPage = () => (
    <div className={css.page}>
        <div className={css.content}>
            <Venues/>
            <Outlet/>
        </div>
        <FooterComponent/>
    </div>
);

export {VenuesPage};