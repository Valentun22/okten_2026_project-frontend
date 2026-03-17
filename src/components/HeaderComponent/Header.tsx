import {useEffect, useState} from 'react';
import css from './Header.module.css';
import img1 from '../../img/img1.png';
import {NavLink, useNavigate} from 'react-router-dom';
import {NavigationLogin} from '../NavigationLoginComponent/NavigationLogin';
import {useAppDispatch, useAppSelector} from '../../hooks/useReduxHooks';
import {authActions} from '../../redux/slices/authSlice';
import {messageService} from "../../services/massage.service";

const Header = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const {isAuth} = useAppSelector(state => state.auth);
    const [menuOpen, setMenuOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const userRaw = localStorage.getItem('user');
    const userObj = userRaw ? JSON.parse(userRaw) : null;
    const roles = Array.isArray(userObj?.role) ? userObj.role : (userObj?.role ? [userObj.role] : []);
    const isVenueAdmin = roles.includes('venue_admin');
    const isAdmin = roles.includes('superadmin');

    useEffect(() => {
        if (!isAuth) {
            setUnreadCount(0);
            return;
        }
        const fetch = () => messageService.getUnreadCount().then(({data}) => setUnreadCount(data.count)).catch(() => {
        });
        fetch();
        const interval = setInterval(fetch, 60000);
        return () => clearInterval(interval);
    }, [isAuth]);

    const handleSignOut = () => {
        dispatch(authActions.logout());
        navigate('/');
        setMenuOpen(false);
    };

    const NAV_LINKS = [
        {label: 'Головна', path: '/'},
        {label: 'Заклади', path: '/venues'},
        {label: 'Топ', path: '/topVenues'},
        {label: 'Новини', path: '/news'},
        {label: 'Пиячок', path: '/pyachok'},
        ...(isVenueAdmin ? [{label: '+Заклад', path: '/venues/create'}] : []),
        ...(isAdmin ? [{label: '⚙️ Адмін', path: '/admin'}] : []),
        {label: 'Про нас', path: '/aboutUs'},
        {label: 'Пошук', path: '/searchVenue', highlight: true},
    ];

    const handleNav = (path: string) => {
        navigate(path);
        setMenuOpen(false);
    };

    return (
        <div className={`${css.Header} ${css.flex}`}>
            <div className={css.logoBox}>
                <NavLink to="/"><img src={img1} alt="Logo"/></NavLink>
            </div>

            <nav className={`${css.infoBlock} ${css.flex}`}>
                {NAV_LINKS.map(({label, path, highlight}: any) => (
                    <button
                        key={path}
                        className={css.btn2}
                        style={highlight ? {background: 'rgba(193,138,102,0.96)', color: '#fff'} : undefined}
                        onClick={() => navigate(path)}>
                        {label}
                    </button>
                ))}
            </nav>

            <div className={`${css.naviBox} ${css.flex}`}>
                <NavigationLogin navLinks={[]} isAuth={isAuth} onSignOut={handleSignOut} unreadCount={unreadCount}/>
            </div>

            <button
                className={`${css.burger} ${menuOpen ? css.burgerOpen : ''}`}
                onClick={() => setMenuOpen(p => !p)}
                aria-label="Меню">
                <span/><span/><span/>
            </button>

            {menuOpen && (
                <div className={css.mobileMenu}>
                    {NAV_LINKS.map(({label, path}) => (
                        <button key={path} className={css.mobileLink} onClick={() => handleNav(path)}>
                            {label}
                        </button>
                    ))}
                    <div className={css.mobileDivider}/>
                    {isAuth
                        ? <>
                            <button className={css.mobileLink} onClick={() => handleNav('/profile')}>👤 Профіль</button>
                            <button className={css.mobileLink} onClick={() => handleNav('/messages')}>
                                ✉️ Повідомлення{unreadCount > 0 ? ` (${unreadCount})` : ''}
                            </button>
                            <button className={css.mobileLink} onClick={handleSignOut}>🚪 Вийти</button>
                        </>
                        : <>
                            <button className={css.mobileLink} onClick={() => handleNav('/login')}>Увійти</button>
                            <button className={css.mobileLink} onClick={() => handleNav('/register')}>Реєстрація
                            </button>
                        </>
                    }
                </div>
            )}
        </div>
    );
};

export {Header};