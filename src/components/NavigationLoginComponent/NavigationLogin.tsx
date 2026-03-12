import css from './NavigationLogin.module.css';
import {NavLink, useLocation, useNavigate} from 'react-router-dom';

type MyNavLink = { label: string; href: string };
type Props = { navLinks: MyNavLink[]; isAuth: boolean; onSignOut?: () => void };

const NavigationLogin = ({navLinks, isAuth, onSignOut}: Props) => {
    const {pathname} = useLocation();
    const navigate = useNavigate();

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
                    <button type="button" className={css.buttonSecondary}
                            onClick={() => navigate('/profile')}>
                        Профіль
                    </button>
                    <button type="button" className={css.buttonPrimary}
                            onClick={() => onSignOut?.()}>
                        Вийти
                    </button>
                </div>
            ) : (
                <div className={css.boxAuth}>
                    <button type="button" className={css.buttonPrimary}
                            onClick={() => navigate('/login')}>
                        Увійти
                    </button>
                    <button type="button" className={css.buttonSecondary}
                            onClick={() => navigate('/register')}>
                        Реєстрація
                    </button>
                </div>
            )}
        </div>
    );
};

export {NavigationLogin};
