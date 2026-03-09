import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useAppDispatch, useAppSelector} from '../../hooks/useReduxHooks';
import {authActions} from '../../redux/slices/authSlice';
import {userService} from '../../services/user.service';
import {pyachokService} from '../../services/pyachok.service';
import css from './Profile.module.css';

type Tab = 'info' | 'favorites' | 'comments' | 'pyachok';

interface IFavoriteVenue {
    id: string;
    name: string;
    avatarVenue?: string;
    city?: string;
}

interface IMyComment {
    id: string;
    title: string;
    rating: number;
    created: string;
    venue?: { id: string; name: string };
}

interface IPyachokRow {
    id: string;
    date: string;
    time: string;
    purpose?: string;
    status: string;
    venue?: { name: string };
}

interface IFullUser {
    id: string;
    name?: string;
    email?: string;
    image?: string;
    bio?: string;
    isCritic?: boolean;
}

const Profile = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const {isAuth} = useAppSelector(state => state.auth);

    const [tab, setTab] = useState<Tab>('info');
    const [me, setMe] = useState<IFullUser | null>(null);
    const [favorites, setFavorites] = useState<IFavoriteVenue[]>([]);
    const [comments, setComments] = useState<IMyComment[]>([]);
    const [pyachoks, setPyachoks] = useState<IPyachokRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [meLoading, setMeLoading] = useState(true);

    // Redirect if not auth
    useEffect(() => {
        if (!isAuth) navigate('/login');
    }, [isAuth, navigate]);

    useEffect(() => {
        if (!isAuth) return;
        setMeLoading(true);
        userService.getMe()
            .then(({data}) => setMe(data))
            .catch(() => {/* ignore */
            })
            .finally(() => setMeLoading(false));
    }, [isAuth]);

    useEffect(() => {
        if (!isAuth) return;
        const load = async () => {
            setLoading(true);
            try {
                if (tab === 'favorites') {
                    const {data} = await userService.getMyFavorites();
                    setFavorites(Array.isArray(data) ? data : (data?.data ?? []));
                }
                if (tab === 'comments') {
                    const {data} = await userService.getMyComments({limit: 50});
                    setComments(data?.data ?? data ?? []);
                }
                if (tab === 'pyachok') {
                    const {data} = await pyachokService.getMyList({limit: 50});
                    setPyachoks(data?.data ?? data ?? []);
                }
            } catch { /* ignore */
            }
            setLoading(false);
        };
        if (tab !== 'info') load();
    }, [tab, isAuth]);

    const handleSignOut = () => {
        dispatch(authActions.logout());
        navigate('/');
    };

    const removeFav = async (id: string) => {
        try {
            const {axiosInstance} = await import('../../services/axiosInstance.service');
            const {urls} = await import('../../constants/urls');
            await axiosInstance.delete(urls.favorites.remove(id));
        } catch { /* ignore */
        }
        setFavorites(prev => prev.filter(f => f.id !== id));
    };

    const TABS: { key: Tab; label: string; icon: string }[] = [
        {key: 'info', label: 'Мій профіль', icon: '👤'},
        {key: 'favorites', label: 'Улюблені', icon: '❤️'},
        {key: 'comments', label: 'Мої відгуки', icon: '💬'},
        {key: 'pyachok', label: 'Мій пиячок', icon: '🍺'},
    ];

    return (
        <div className={css.page}>
            <div className={css.content}>
                <div className={css.layout}>

                    <aside className={css.sidebar}>
                        <div className={css.avatarBox}>
                            {me?.image
                                ? <img src={me.image} alt="" className={css.avatar}/>
                                : <div className={css.avatarPlaceholder}>{me?.name?.[0]?.toUpperCase() ?? '?'}</div>
                            }
                            <h2 className={css.userName}>{me?.name ?? 'Користувач'}</h2>
                            <p className={css.userEmail}>{me?.email ?? ''}</p>
                            {me?.isCritic && <span className={css.criticBadge}>🏅 Критик</span>}
                        </div>

                        <nav className={css.tabs}>
                            {TABS.map(({key, label, icon}) => (
                                <button key={key}
                                        className={`${css.tabBtn} ${tab === key ? css.tabActive : ''}`}
                                        onClick={() => setTab(key)}>
                                    <span>{icon}</span> {label}
                                </button>
                            ))}
                        </nav>

                        {(() => {
                            const userRaw = localStorage.getItem('user');
                            const userObj = userRaw ? JSON.parse(userRaw) : null;
                            const roles = Array.isArray(userObj?.role) ? userObj.role : (userObj?.role ? [userObj.role] : []);
                            const isAdmin = roles.some((r: string) => r === 'superadmin' || r === 'venue_admin');
                            return isAdmin ? (
                                <button className={css.adminBtn} onClick={() => navigate('/admin')}>
                                    ⚙️ Адмін панель
                                </button>
                            ) : null;
                        })()}

                        <button className={css.logoutBtn} onClick={handleSignOut}>🚪 Вийти</button>
                    </aside>

                    <main className={css.main}>

                        {tab === 'info' && (
                            <section className={css.section}>
                                <h2 className={css.sectionTitle}>Мій профіль</h2>
                                {meLoading
                                    ? <div className={css.loadingMsg}>Завантаження...</div>
                                    : (
                                        <div className={css.infoCard}>
                                            {[
                                                {k: "Ім'я", v: me?.name},
                                                {k: 'Email', v: me?.email},
                                                {k: 'Про себе', v: me?.bio},
                                                {k: 'Статус', v: me?.isCritic ? '🏅 Критик' : 'Користувач'},
                                            ].map(({k, v}) => v ? (
                                                <div className={css.infoRow} key={k}>
                                                    <span className={css.infoKey}>{k}</span>
                                                    <span className={css.infoVal}>{v}</span>
                                                </div>
                                            ) : null)}
                                        </div>
                                    )
                                }
                                <div className={css.quickActions}>
                                    <button className={css.actionBtn} onClick={() => navigate('/searchVenue')}>🔍 Знайти
                                        заклад
                                    </button>
                                    <button className={css.actionBtn} onClick={() => navigate('/topVenues')}>🏆 Топ
                                        заклади
                                    </button>
                                    <button className={css.actionBtn} onClick={() => navigate('/news')}>📰 Новини
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
                                        <button className={css.actionBtn}
                                                onClick={() => navigate('/searchVenue')}>Знайти заклади
                                        </button>
                                    </div>
                                )}
                                <div className={css.listGrid}>
                                    {favorites.map(f => (
                                        <div key={f.id} className={css.listCard}>
                                            <div className={css.listCardImg}
                                                 onClick={() => navigate(`/venues/${f.id}`)}>
                                                {f.avatarVenue ? <img src={f.avatarVenue} alt={f.name}/> :
                                                    <span>🏠</span>}
                                            </div>
                                            <div className={css.listCardInfo}>
                                                <h4 onClick={() => navigate(`/venues/${f.id}`)}>{f.name}</h4>
                                                {f.city && <p>📍 {f.city}</p>}
                                            </div>
                                            <button className={css.removeBtn} onClick={() => removeFav(f.id)}
                                                    title="Видалити">✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {tab === 'comments' && (
                            <section className={css.section}>
                                <h2 className={css.sectionTitle}>Мої відгуки</h2>
                                {loading && <div className={css.loadingMsg}>Завантаження...</div>}
                                {!loading && comments.length === 0 && (
                                    <div className={css.emptyState}>
                                        <span>💬</span>
                                        <p>Відгуків ще немає</p>
                                        <button className={css.actionBtn}
                                                onClick={() => navigate('/searchVenue')}>Знайти заклади
                                        </button>
                                    </div>
                                )}
                                <div className={css.listGrid}>
                                    {comments.map(c => (
                                        <div key={c.id} className={css.listCard}>
                                            <div className={css.commentCardLeft}>
                                                <div className={css.commentStars}>
                                                    {Array.from({length: 5}).map((_, i) => (
                                                        <span key={i}
                                                              className={i < c.rating ? css.starOn : css.starOff}>★</span>
                                                    ))}
                                                </div>
                                                <h4 onClick={() => c.venue?.id && navigate(`/venues/${c.venue.id}`)}>
                                                    {c.title}
                                                </h4>
                                                {c.venue && <p>🏠 {c.venue.name}</p>}
                                                <p className={css.commentDate}>
                                                    {new Date(c.created).toLocaleDateString('uk-UA', {
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric'
                                                    })}
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
                                        <button className={css.actionBtn}
                                                onClick={() => navigate('/searchVenue')}>Знайти заклад
                                        </button>
                                    </div>
                                )}
                                <div className={css.pyachokList}>
                                    {pyachoks.map((p: any) => (
                                        <div key={p.id} className={css.pyachokCard}>
                                            <div className={css.pyachokHeader}>
                                                <span className={css.pyachokVenue}>{p.venue?.name ?? 'Заклад'}</span>
                                                <span
                                                    className={`${css.pyachokStatus} ${p.status === 'open' ? css.statusOpen : css.statusClosed}`}>
                                                    {p.status === 'open' ? '🟢 Відкритий' : '🔴 Закритий'}
                                                </span>
                                            </div>
                                            <div className={css.pyachokMeta}>
                                                <span>📅 {p.date ? new Date(p.date).toLocaleDateString('uk-UA') : '—'}</span>
                                                {p.time && <span>🕐 {p.time}</span>}
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
        </div>
    );
};

export {Profile};