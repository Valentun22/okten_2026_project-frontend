import {Link} from 'react-router-dom';
import css from './NotFoundComponent.module.css';

const NotFoundComponent = () => (
    <div className={css.page}>
        <div className={css.card}>
            <div className={css.code}>404</div>
            <div className={css.icon}>🍺</div>
            <h1 className={css.title}>Сторінку не знайдено</h1>
            <p className={css.text}>
                Схоже, ця сторінка кудись зникла... Можливо, вона пішла на пиячок 😄
            </p>
            <div className={css.buttons}>
                <Link to="/" className={css.btnPrimary}>🏠 На головну</Link>
                <Link to="/searchVenue" className={css.btnSecondary}>🔍 Пошук закладів</Link>
            </div>
        </div>
    </div>
);

export {NotFoundComponent};