import {useEffect, useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useAppDispatch, useAppSelector} from '../../hooks/useReduxHooks';
import {authActions} from '../../redux/slices/authSlice';
import {userService} from '../../services/user.service';
import {pyachokService} from '../../services/pyachok.service';
import {axiosInstance} from '../../services/axiosInstance.service';
import {urls} from '../../constants/urls';
import css from './Profile.module.css';

interface IRoleToggleProps {
    active: boolean;
    label: string;
    desc: string;
    onAdd: () => void;
    onRemove: () => void;
}

const RoleToggle = ({active, label, desc, onAdd, onRemove}: IRoleToggleProps) => {
    const [loading, setLoading] = useState(false);
    const handle = async () => {
        setLoading(true);
        try {
            active ? await onRemove() : await onAdd();
        } catch {
        }
        setLoading(false);
    };
    return (
        <div className={css.roleCard}>
            <div className={css.roleCardInfo}>
                <span className={css.roleLabel}>{label}</span>
                <span className={css.roleDesc}>{desc}</span>
            </div>
            <button className={`${css.roleBtn} ${active ? css.roleBtnActive : ''}`} onClick={handle} disabled={loading}>
                {loading ? '...' : active ? 'Активний · Прибрати' : 'Отримати'}
            </button>
        </div>
    );
};

type Tab = 'info' | 'favorites' | 'comments' | 'ratings' | 'pyachok';

interface IFavoriteVenue {
    id: string;
    name: string;
    avatarVenue?: string;
    city?: string;
}

interface IMyComment {
    id: string;
    title: string;
    body?: string;
    rating: number;
    created: string;
    venue?: { id: string; name: string };
}

interface IMyRating {
    id: string;
    rating: number;
    created: string;
    venue?: { id: string; name: string; avatarVenue?: string };
}

interface IPyachokRow {
    id: string;
    date: string;
    time: string;
    purpose?: string;
    status: string;
    venue?: { id: string; name: string };
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
    const [ratings, setRatings] = useState<IMyRating[]>([]);
    const [pyachoks, setPyachoks] = useState<IPyachokRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [meLoading, setMeLoading] = useState(true);

    const [editMode, setEditMode] = useState(false);
    const [editName, setEditName] = useState('');
    const [editBio, setEditBio] = useState('');
    const [editAvatar, setEditAvatar] = useState('');
    const [editLoading, setEditLoading] = useState(false);
    const [editError, setEditError] = useState('');
    const [editSuccess, setEditSuccess] = useState(false);

    const [avatarUploading, setAvatarUploading] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const avatarInputRef = useRef<HTMLInputElement>(null);

    const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setAvatarPreview(URL.createObjectURL(file));
        setAvatarUploading(true);
        try {
            const fd = new FormData();
            fd.append('avatar', file);
            await axiosInstance.post(urls.users.uploadAvatar, fd, {
                headers: {'Content-Type': 'multipart/form-data'},
            });
            const {data} = await userService.getMe();
            setMe(data);
            setAvatarPreview(null);
        } catch {
            setAvatarPreview(null);
        }
        setAvatarUploading(false);
    };

    const handleDeleteAvatar = async () => {
        if (!window.confirm('Видалити аватар?')) return;
        await axiosInstance.delete(urls.users.deleteAvatar).catch(() => {
        });
        setMe(p => p ? {...p, image: undefined} : p);
    };

    useEffect(() => {
        if (!isAuth) navigate('/login');
    }, [isAuth, navigate]);

    useEffect(() => {
        if (!isAuth) return;
        setMeLoading(true);
        userService.getMe()
            .then(({data}) => {
                setMe(data);
            })
            .catch(() => {
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
                if (tab === 'ratings') {
                    const {data} = await userService.getMyRatings({limit: 50});
                    setRatings(data?.data ?? data ?? []);
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
        await axiosInstance.delete(urls.favorites.remove(id)).catch(() => {
        });
        setFavorites(prev => prev.filter(f => f.id !== id));
    };

    const startEdit = () => {
        setEditName(me?.name ?? '');
        setEditBio(me?.bio ?? '');
        setEditAvatar(me?.image ?? '');
        setEditError('');
        setEditSuccess(false);
        setEditMode(true);
    };

    const handleSaveProfile = async () => {
        if (!editName.trim()) {
            setEditError("Ім'я не може бути порожнім");
            return;
        }
        setEditLoading(true);
        setEditError('');
        setEditSuccess(false);
        try {
            const {data} = await userService.updateMe({name: editName.trim(), bio: editBio.trim() || undefined});
            setMe(data);
            setEditSuccess(true);
            setEditMode(false);
        } catch (e: any) {
            setEditError(e?.response?.data?.message ?? 'Помилка збереження');
        }
        setEditLoading(false);
    };

    const handleClosePyachok = async (id: string) => {
        await pyachokService.close(id).catch(() => {
        });
        setPyachoks(p => p.map(x => x.id === id ? {...x, status: 'closed'} : x));
    };
    const handleDeletePyachok = async (id: string) => {
        if (!window.confirm('Видалити запит?')) return;
        await pyachokService.delete(id).catch(() => {
        });
        setPyachoks(p => p.filter(x => x.id !== id));
    };

    const userRaw = localStorage.getItem('user');
    const userObj = userRaw ? JSON.parse(userRaw) : null;
    const roles = Array.isArray(userObj?.role) ? userObj.role : (userObj?.role ? [userObj.role] : []);
    const isAdmin = roles.some((r: string) => r === 'superadmin' || r === 'venue_admin');

    const TABS: { key: Tab; label: string; icon: string }[] = [
        {key: 'info', label: 'Мій профіль', icon: '👤'},
        {key: 'favorites', label: 'Улюблені', icon: '❤️'},
        {key: 'comments', label: 'Відгуки', icon: '💬'},
        {key: 'ratings', label: 'Оцінки', icon: '⭐'},
        {key: 'pyachok', label: 'Пиячок', icon: '🍺'},
    ];

    return (
        <div className={css.page}>
            <div className={css.content}>
                <aside className={css.sidebar}>
                    <div className={css.avatarBox}>
                        <div className={css.avatarWrap}>
                            {avatarPreview || me?.image
                                ? <img src={avatarPreview ?? me!.image!} alt="" className={css.avatar}/>
                                : <div className={css.avatarPlaceholder}>{me?.name?.[0]?.toUpperCase() ?? '?'}</div>
                            }
                            {/* Upload overlay */}
                            <label
                                className={`${css.avatarOverlay} ${avatarUploading ? css.avatarOverlayLoading : ''}`}>
                                {avatarUploading ? '⏳' : '📷'}
                                <input ref={avatarInputRef} type="file" accept="image/*"
                                       className={css.avatarFileInput} onChange={handleAvatarFile}
                                       disabled={avatarUploading}/>
                            </label>
                        </div>
                        {me?.image && !avatarUploading && (
                            <button className={css.avatarDeleteBtn} onClick={handleDeleteAvatar}
                                    title="Видалити аватар">
                                🗑
                            </button>
                        )}
                        <div className={css.sidebarInfo}>
                            <h2 className={css.sidebarName}>{me?.name ?? '...'}</h2>
                            <p className={css.sidebarEmail}>{me?.email ?? ''}</p>
                            {me?.isCritic && <span className={css.criticBadge}>🏅 Критик</span>}
                        </div>
                    </div>

                    <nav className={css.tabNav}>
                        {TABS.map(({key, label, icon}) => (
                            <button key={key}
                                    className={`${css.tabBtn} ${tab === key ? css.tabActive : ''}`}
                                    onClick={() => setTab(key)}>
                                <span>{icon}</span> {label}
                            </button>
                        ))}
                    </nav>

                    {isAdmin && (
                        <button className={css.adminBtn} onClick={() => navigate('/admin')}>
                            ⚙️ Адмін панель
                        </button>
                    )}
                    <button className={css.logoutBtn} onClick={handleSignOut}>🚪 Вийти</button>
                </aside>

                {/* ── Main ── */}
                <main className={css.main}>

                    {/* ── INFO TAB ── */}
                    {tab === 'info' && (
                        <section className={css.section}>
                            <div className={css.sectionHeader}>
                                <h2 className={css.sectionTitle}>Мій профіль</h2>
                                {!editMode && (
                                    <button className={css.editProfileBtn} onClick={startEdit}>✏️ Редагувати</button>
                                )}
                            </div>

                            {meLoading ? <div className={css.loadingMsg}>Завантаження...</div> : editMode ? (
                                /* ── Edit form ── */
                                <div className={css.editForm}>
                                    <div className={css.editField}>
                                        <label className={css.editLabel}>Ім'я *</label>
                                        <input className={css.editInput} value={editName}
                                               onChange={e => setEditName(e.target.value)}/>
                                    </div>
                                    <div className={css.editField}>
                                        <label className={css.editLabel}>Про себе</label>
                                        <textarea className={css.editTextarea} rows={4}
                                                  placeholder="Розкажіть про себе..."
                                                  value={editBio} onChange={e => setEditBio(e.target.value)}/>
                                    </div>
                                    {editError && <p className={css.editError}>{editError}</p>}
                                    {editSuccess && <p className={css.editSuccess}>✅ Збережено!</p>}
                                    <div className={css.editActions}>
                                        <button className={css.editCancelBtn}
                                                onClick={() => setEditMode(false)}>Скасувати
                                        </button>
                                        <button className={css.editSaveBtn} onClick={handleSaveProfile}
                                                disabled={editLoading}>
                                            {editLoading ? '...' : 'Зберегти'}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                /* ── Info view ── */
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
                            )}

                            {/* Ролі */}
                            {!meLoading && me && (
                                <div className={css.rolesSection}>
                                    <h3 className={css.rolesSectionTitle}>Ролі та статуси</h3>
                                    <div className={css.rolesRow}>
                                        <RoleToggle
                                            active={!!me.isCritic}
                                            label="🏅 Критик"
                                            desc="Ваші відгуки будуть позначені як критичні"
                                            onAdd={() => axiosInstance.post(urls.users.criticAdd).then(({data}) => setMe((p: any) => ({
                                                ...p,
                                                isCritic: true, ...data
                                            })))}
                                            onRemove={() => axiosInstance.delete(urls.users.criticRemove).then(() => setMe((p: any) => ({
                                                ...p,
                                                isCritic: false
                                            })))}
                                        />
                                        <RoleToggle
                                            active={roles.includes('venue_admin')}
                                            label="🏠 Власник закладу"
                                            desc="Дозволяє створювати та керувати закладами"
                                            onAdd={() => axiosInstance.post(urls.users.venueAdminAdd).then(() => {
                                            })}
                                            onRemove={() => axiosInstance.delete(urls.users.venueAdminRemove).then(() => {
                                            })}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className={css.quickActions}>
                                <button className={css.actionBtn} onClick={() => navigate('/searchVenue')}>🔍 Знайти
                                    заклад
                                </button>
                                <button className={css.actionBtn} onClick={() => navigate('/venues/create')}>＋ Додати
                                    заклад
                                </button>
                                <button className={css.actionBtn} onClick={() => navigate('/news')}>📰 Новини</button>
                            </div>
                        </section>
                    )}

                    {/* ── FAVORITES TAB ── */}
                    {tab === 'favorites' && (
                        <section className={css.section}>
                            <h2 className={css.sectionTitle}>Улюблені заклади</h2>
                            {loading && <div className={css.loadingMsg}>Завантаження...</div>}
                            {!loading && favorites.length === 0 && (
                                <div className={css.emptyState}><span>❤️</span><p>Список улюблених порожній</p></div>
                            )}
                            <div className={css.favGrid}>
                                {favorites.map(f => (
                                    <div key={f.id} className={css.favCard} onClick={() => navigate(`/venues/${f.id}`)}>
                                        <div className={css.favImg}>
                                            {f.avatarVenue ? <img src={f.avatarVenue} alt={f.name}/> : <span>🏠</span>}
                                        </div>
                                        <div className={css.favInfo}>
                                            <h3 className={css.favName}>{f.name}</h3>
                                            {f.city && <p className={css.favCity}>📍 {f.city}</p>}
                                        </div>
                                        <button className={css.favRemove} onClick={e => {
                                            e.stopPropagation();
                                            removeFav(f.id);
                                        }}>✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* ── COMMENTS TAB ── */}
                    {tab === 'comments' && (
                        <section className={css.section}>
                            <h2 className={css.sectionTitle}>Мої відгуки</h2>
                            {loading && <div className={css.loadingMsg}>Завантаження...</div>}
                            {!loading && comments.length === 0 && (
                                <div className={css.emptyState}><span>💬</span><p>Відгуків ще немає</p></div>
                            )}
                            <div className={css.commentList}>
                                {comments.map(c => (
                                    <div key={c.id} className={css.commentCard}>
                                        <div className={css.commentHeader}>
                                            <span className={css.commentRating}>
                                                {'★'.repeat(c.rating)}{'☆'.repeat(5 - c.rating)}
                                            </span>
                                            <span className={css.commentDate}>
                                                {new Date(c.created).toLocaleDateString('uk-UA')}
                                            </span>
                                        </div>
                                        {c.venue && (
                                            <p className={css.commentVenue}
                                               onClick={() => navigate(`/venues/${c.venue!.id}`)}>
                                                🏠 {c.venue.name}
                                            </p>
                                        )}
                                        <h3 className={css.commentTitle}>{c.title}</h3>
                                        {c.body && <p className={css.commentBody}>{c.body}</p>}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* ── RATINGS TAB ── */}
                    {tab === 'ratings' && (
                        <section className={css.section}>
                            <h2 className={css.sectionTitle}>Мої оцінки</h2>
                            {loading && <div className={css.loadingMsg}>Завантаження...</div>}
                            {!loading && ratings.length === 0 && (
                                <div className={css.emptyState}><span>⭐</span><p>Оцінок ще немає</p></div>
                            )}
                            <div className={css.ratingsList}>
                                {ratings.map((r: any) => (
                                    <div key={r.id} className={css.ratingCard}
                                         onClick={() => r.venue?.id && navigate(`/venues/${r.venue.id}`)}>
                                        {r.venue?.avatarVenue && (
                                            <img src={r.venue.avatarVenue} alt="" className={css.ratingImg}/>
                                        )}
                                        <div className={css.ratingInfo}>
                                            <h3 className={css.ratingVenue}>{r.venue?.name ?? 'Заклад'}</h3>
                                            <div className={css.ratingStars}>
                                                {Array.from({length: 10}).map((_, i) => (
                                                    <span key={i} style={{
                                                        color: i < r.rating ? '#f59e0b' : '#e5e7eb',
                                                        fontSize: '16px'
                                                    }}>★</span>
                                                ))}
                                                <span className={css.ratingNum}>{r.rating}/10</span>
                                            </div>
                                            <p className={css.ratingDate}>{new Date(r.created ?? r.createdAt).toLocaleDateString('uk-UA')}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* ── PYACHOK TAB ── */}
                    {tab === 'pyachok' && (
                        <section className={css.section}>
                            <h2 className={css.sectionTitle}>Мій Пиячок</h2>
                            {loading && <div className={css.loadingMsg}>Завантаження...</div>}
                            {!loading && pyachoks.length === 0 && (
                                <div className={css.emptyState}><span>🍺</span><p>Запитів ще немає</p></div>
                            )}
                            <div className={css.pyachokList}>
                                {pyachoks.map(p => (
                                    <div key={p.id} className={css.pyachokCard}>
                                        <div className={css.pyachokHeader}>
                                            <span className={css.pyachokVenue}
                                                  onClick={() => p.venue?.id && navigate(`/venues/${p.venue.id}`)}>
                                                🏠 {p.venue?.name ?? 'Заклад'}
                                            </span>
                                            <span
                                                className={`${css.pyachokStatus} ${p.status === 'open' ? css.statusOpen : css.statusClosed}`}>
                                                {p.status === 'open' ? '🟢 Відкритий' : '🔴 Закритий'}
                                            </span>
                                        </div>
                                        <div className={css.pyachokMeta}>
                                            <span>📅 {new Date(p.date).toLocaleDateString('uk-UA', {
                                                day: 'numeric',
                                                month: 'long'
                                            })}</span>
                                            <span>🕐 {p.time}</span>
                                            {p.purpose && <span>🎯 {p.purpose}</span>}
                                        </div>
                                        {p.status === 'open' && (
                                            <div className={css.pyachokActions}>
                                                <button className={css.closeBtn}
                                                        onClick={() => handleClosePyachok(p.id)}>
                                                    ✓ Закрити
                                                </button>
                                                <button className={css.deleteBtn}
                                                        onClick={() => handleDeletePyachok(p.id)}>
                                                    🗑 Видалити
                                                </button>
                                            </div>
                                        )}
                                        {p.status === 'closed' && (
                                            <div className={css.pyachokActions}>
                                                <button className={css.deleteBtn}
                                                        onClick={() => handleDeletePyachok(p.id)}>
                                                    🗑 Видалити
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </main>
            </div>
        </div>
    );
};

export {Profile};