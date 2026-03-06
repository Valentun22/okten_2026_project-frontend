import css from './Header.module.css';
import img1 from '../../img/img1.png';
import { NavLink, useNavigate } from 'react-router-dom';
import { NavigationLogin } from '../NavigationLoginComponent/NavigationLogin';
import { useAppDispatch, useAppSelector } from '../../hooks/useReduxHooks';
import { authActions } from '../../redux/slices/authSlice';

const NAV_LINKS = [
    { label: 'Головна', path: '/' },
    { label: 'Пошук', path: '/searchVenue' },
    { label: 'Топ', path: '/topVenues' },
    { label: 'Новини', path: '/news' },
    { label: 'Пиячок', path: '/pyachok' },
    { label: 'Про нас', path: '/aboutUs' },
];

const Header = () => {
    const navigate   = useNavigate();
    const dispatch   = useAppDispatch();
    const { isAuth } = useAppSelector(state => state.auth);

    const handleSignOut = () => {
        dispatch(authActions.logout());
        navigate('/');
    };

    return (
        <div className={`${css.Header} ${css.flex}`}>
            <div className={css.logoBox}>
                <NavLink to="/"><img src={img1} alt="Logo" /></NavLink>
            </div>

            <nav className={`${css.infoBlock} ${css.flex}`}>
                {NAV_LINKS.map(({ label, path }) => (
                    <button
                        key={path}
                        className={css.btn2}
                        onClick={() => navigate(path)}
                    >
                        {label}
                    </button>
                ))}
            </nav>

            <div className={`${css.naviBox} ${css.flex}`}>
                <NavigationLogin
                    navLinks={[]}
                    isAuth={isAuth}
                    onSignOut={handleSignOut}
                />
            </div>
        </div>
    );
};

export { Header };