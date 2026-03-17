import {Outlet} from 'react-router-dom';
import {FooterComponent} from '../components/FooterComponent/FooterComponent';
import {VenuesCard} from '../components/VenueCardComponents/VenuesCard/VenuesCard';
import css from './css/page.module.css';

const VenueCardPage = () => (
    <div className={css.page}>
        <div className={css.content}>
            <VenuesCard/>
            <Outlet/>
        </div>
        <FooterComponent/>
    </div>
);

export {VenueCardPage};