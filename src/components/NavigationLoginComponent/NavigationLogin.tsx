import css from './NavigationLogin.module.css';
import {NavLink, useLocation, useNavigate} from 'react-router-dom';

type MyNavLink = { label: string; href: string };
type Props = { navLinks: MyNavLink[]; isAuth: boolean; onSignOut?: () => void; unreadCount?: number };

const NavigationLogin = ({navLinks, isAuth, onSignOut, unreadCount = 0}: Props) => {
    const {pathname} = useLocation();
    const navigate = useNavigate();

    const userRaw = localStorage.getItem('user');
    const userObj = userRaw ? JSON.parse(userRaw) : null;
    const userImage: string | null = userObj?.image ?? null;
    const userName: string = userObj?.name ?? '';

    return (
        <div className={css.boxAll}>
            {navLinks.map((link) => (
                <NavLink
                    key={link.label}
                    to={link.href}
                    className={pathname === link.href ? css.active : ''}
                >
                    {link.label}
                </NavLink>
            ))}

            {isAuth ? (
                <div className={css.boxAuth}>
                    <div style={{position: 'relative', display: 'inline-flex'}}>
                        <button type="button" className={css.buttonSecondary}
                                onClick={() => navigate('/profile')}>
                            Профіль
                        </button>
                        {unreadCount > 0 && (
                            <span className={css.badge}>
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </div>
                    <button type="button" className={css.buttonPrimary} onClick={() => onSignOut?.()}>
                        Вийти
                    </button>
                </div>
            ) : (
                <div className={css.boxAuth}>
                    <button type="button" className={css.buttonPrimary} onClick={() => navigate('/login')}>
                        Увійти
                    </button>
                    <button type="button" className={css.buttonSecondary} onClick={() => navigate('/register')}>
                        Реєстрація
                    </button>
                </div>
            )}
        </div>
    );
};

export {NavigationLogin};
