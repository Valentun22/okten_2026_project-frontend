import css from './Header.module.css';
import img1 from '../../img/img1.png';
import {NavLink, useNavigate} from "react-router-dom";
import {NavigationLogin} from "../NavigationLoginComponent/NavigationLogin";


const Header = () => {
    const navigate = useNavigate();
    return (
        <div className={`${css.Header} ${css.flex}`}>
            <div className={css.logoBox}>
                <NavLink to="/">
                    <img  src={img1} alt="Logo" />
                </NavLink>
            </div>

            <div className={`${css.infoBlock} ${css.flex}`}>
                <button className={css.btn2} onClick={() => navigate("aboutUs")}>Про нас</button>
                <button className={css.btn2} onClick={() => navigate("/")}>Головна</button>
                <button className={css.btn2} onClick={() => navigate("/search/:query")}>Пошук</button>
                <button className={css.btn2} onClick={() => navigate("/topVenue")}>Топ</button>
                <button className={css.btn2} onClick={() => navigate("/news")}>Новини</button>
            </div>

            <div className={`${css.naviBox} ${css.flex}`}>
                <NavigationLogin navLinks={[]} isAuth={false} onSignOut={() => {}} />
            </div>
        </div>);
};

export {Header};