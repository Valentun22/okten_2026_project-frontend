import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/useReduxHooks';
import { authActions } from '../../redux/slices/authSlice';
import { FooterComponent } from '../../components/FooterComponent/FooterComponent';
import { axiosInstance } from '../../services/axiosInstance.service';
import { urls } from '../../constants/urls';
import css from './ProfilePage.module.css';

type Tab = 'info' | 'favorites' | 'my-venues' | 'pyachok';

interface IFavorite   { id: string; name: string; avatarVenue?: string; city?: string; }
interface IMyVenue    { id: string; name: string; avatarVenue?: string; isActive: boolean; isModerated: boolean; }
interface IPyachokRow { id: string; date: string; time: string; purpose?: string; status: string; venue?: { name: string }; }

const ProfilePage = () => {
    const dispatch  = useAppDispatch();
    const navigate  = useNavigate();
    const { isAuth, user } = useAppSelector(state => state.auth);

    const [tab, setTab]             = useState<Tab>('info');
    const [favorites, setFavorites] = useState<IFavorite[]>([]);
    const [myVenues,  setMyVenues]  = useState<IMyVenue[]>([]);
    const [pyachoks,  setPyachoks]  = useState<IPyachokRow[]>([]);
    const [loading,   setLoading]   = useState(false);

    useEffect(() => {
        if (!isAuth) navigate('/login');
    }, [isAuth, navigate]);

    // Завантажуємо дані при зміні вкладки
    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                if (tab === 'favorites') {
                    const { data } = await axiosInstance.get(`${urls.venue.base}?isFavorite=true&limit=50`);
                    setFavorites(data.data ?? data ?? []);
                }
                if (tab === 'my-venues') {
                    const { data } = await axiosInstance.get(`${urls.venue.base}?myVenues=true&limit=50`);
                    setMyVenues(data.data ?? data ?? []);
                }
                if (tab === 'pyachok') {
                    const { data } = await axiosInstance.get(urls.pyachok.myList, { params: { limit: 50 } });
                    setPyachoks(data.data ?? data ?? []);
                }
            } catch { /* ignore */ }
            setLoading(false);
        };
        if (tab !== 'info') load();
    }, [tab]);

    const handleSignOut = () => {
        dispatch(authActions.logout());
        navigate('/');
    };

    const removeFav = async (id: string) => {
        try { await axiosInstance.delete(urls.favorites.remove(id)); }
        catch { /* ignore */ }
        setFavorites(prev => prev.filter(f => f.id !== id));
    };

    const TABS: { key: Tab; label: string; icon: string }[] = [
        { key: 'info',       label: 'Мій профіль',    icon: '👤' },
        { key: 'favorites',  label: 'Улюблені',        icon: '❤️' },
        { key: 'my-venues',  label: 'Мої заклади',    icon: '🏠' },
        { key: 'pyachok',    label: 'Мій пиячок',     icon: '🍺' },
    ];

    return (
        <div className={css.page}>
            <div className={css.content}>
                <div className={css.layout}>
                    <aside className={css.sidebar}>
                        <div className={css.avatarBox}>
                            {user?.avatar
                                ? <img src={user.avatar} alt="" className={css.avatar} />
                                : <div className={css.avatarPlaceholder}>{user?.name?.[0]?.toUpperCase() ?? '?'}</div>
                            }
                            <h2 className={css.userName}>{user?.name ?? 'Користувач'}</h2>
                            <p className={css.userEmail}>{user?.email ?? ''}</p>
                        </div>

                        <nav className={css.tabs}>
                            {TABS.map(({ key, label, icon }) => (
                                <button
                                    key={key}
                                    className={`${css.tabBtn} ${tab === key ? css.tabActive : ''}`}
                                    onClick={() => setTab(key)}
                                >
                                    <span>{icon}</span> {label}
                                </button>
                            ))}
                        </nav>

                        <button className={css.logoutBtn} onClick={handleSignOut}>
                            🚪 Вийти
                        </button>
                    </aside>

                    <main className={css.main}>
                        {tab === 'info' && (
                            <section className={css.section}>
                                <h2 className={css.sectionTitle}>Мій профіль</h2>
                                <div className={css.infoCard}>
                                    <div className={css.infoRow}>
                                        <span className={css.infoKey}>Ім'я</span>
                                        <span className={css.infoVal}>{user?.name ?? '—'}</span>
                                    </div>
                                    <div className={css.infoRow}>
                                        <span className={css.infoKey}>Email</span>
                                        <span className={css.infoVal}>{user?.email ?? '—'}</span>
                                    </div>
                                    <div className={css.infoRow}>
                                        <span className={css.infoKey}>Роль</span>
                                        <span className={css.infoVal}>{user?.role ?? 'Користувач'}</span>
                                    </div>
                                </div>

                                <div className={css.quickActions}>
                                    <button className={css.actionBtn} onClick={() => navigate('/searchVenue')}>
                                        🔍 Знайти заклад
                                    </button>
                                    <button className={css.actionBtn} onClick={() => navigate('/topVenues')}>
                                        🏆 Топ заклади
                                    </button>
                                    <button className={css.actionBtn} onClick={() => navigate('/news')}>
                                        📰 Новини
                                    </button>
                                </div>
                            </section>
                        )}

                        {tab === 'favorites' && (
                            <section className={css.section}>
                                <h2 className={css.sectionTitle}>Улюблені заклади</h2>
                                {loading && <div className={css.loadingMsg}>Завантаження...</div>}
                                {!loading && favorites.length === 0 && (
                                    <div className={css.emptyState}>
                                        <span>💔</span>
                                        <p>Улюблених закладів ще немає</p>
                                        <button className={css.actionBtn} onClick={() => navigate('/searchVenue')}>
                                            Знайти заклади
                                        </button>
                                    </div>
                                )}
                                <div className={css.listGrid}>
                                    {favorites.map(f => (
                                        <div key={f.id} className={css.listCard}>
                                            <div className={css.listCardImg} onClick={() => navigate(`/venues/${f.id}`)}>
                                                {f.avatarVenue
                                                    ? <img src={f.avatarVenue} alt={f.name} />
                                                    : <span>🏠</span>
                                                }
                                            </div>
                                            <div className={css.listCardInfo}>
                                                <h4 onClick={() => navigate(`/venues/${f.id}`)}>{f.name}</h4>
                                                {f.city && <p>📍 {f.city}</p>}
                                            </div>
                                            <button className={css.removeBtn} onClick={() => removeFav(f.id)} title="Видалити з улюблених">
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {tab === 'my-venues' && (
                            <section className={css.section}>
                                <h2 className={css.sectionTitle}>Мої заклади</h2>
                                {loading && <div className={css.loadingMsg}>Завантаження...</div>}
                                {!loading && myVenues.length === 0 && (
                                    <div className={css.emptyState}>
                                        <span>🏗</span>
                                        <p>У вас ще немає доданих закладів</p>
                                    </div>
                                )}
                                <div className={css.listGrid}>
                                    {myVenues.map(v => (
                                        <div key={v.id} className={css.listCard}>
                                            <div className={css.listCardImg} onClick={() => navigate(`/venues/${v.id}`)}>
                                                {v.avatarVenue
                                                    ? <img src={v.avatarVenue} alt={v.name} />
                                                    : <span>🏠</span>
                                                }
                                            </div>
                                            <div className={css.listCardInfo}>
                                                <h4 onClick={() => navigate(`/venues/${v.id}`)}>{v.name}</h4>
                                                <p>
                                                    {v.isModerated
                                                        ? (v.isActive ? '✅ Активний' : '⛔ Неактивний')
                                                        : '⏳ Очікує модерації'
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {tab === 'pyachok' && (
                            <section className={css.section}>
                                <h2 className={css.sectionTitle}>Мої запити «Пиячок»</h2>
                                {loading && <div className={css.loadingMsg}>Завантаження...</div>}
                                {!loading && pyachoks.length === 0 && (
                                    <div className={css.emptyState}>
                                        <span>🍺</span>
                                        <p>Запитів ще немає. Знайди заклад і натисни «Пиячок»!</p>
                                        <button className={css.actionBtn} onClick={() => navigate('/searchVenue')}>
                                            Знайти заклад
                                        </button>
                                    </div>
                                )}
                                <div className={css.pyachokList}>
                                    {pyachoks.map(p => (
                                        <div key={p.id} className={css.pyachokCard}>
                                            <div className={css.pyachokHeader}>
                                                <span className={css.pyachokVenue}>{p.venue?.name ?? 'Заклад'}</span>
                                                <span className={`${css.pyachokStatus} ${p.status === 'open' ? css.statusOpen : css.statusClosed}`}>
                                                    {p.status === 'open' ? '🟢 Відкритий' : '🔴 Закритий'}
                                                </span>
                                            </div>
                                            <div className={css.pyachokMeta}>
                                                <span>📅 {new Date(p.date).toLocaleDateString('uk-UA')}</span>
                                                <span>🕐 {p.time}</span>
                                                {p.purpose && <span>🎯 {p.purpose}</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </main>
                </div>
            </div>
            <FooterComponent />
        </div>
    );
};

export { ProfilePage };