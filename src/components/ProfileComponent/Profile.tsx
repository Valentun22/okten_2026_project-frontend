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

type Tab = 'info' | 'venues' | 'favorites' | 'comments' | 'ratings' | 'pyachok';

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

interface IMyVenue {
    id: string;
    name: string;
    avatarVenue?: string;
    city?: string;
    isActive?: boolean;
    isModerated?: boolean;
}

interface IFullUser {
    id: string;
    name?: string;
    email?: string;
    image?: string;
    bio?: string;
    isCritic?: boolean;
    role?: string[];
    birthdate?: string;
    city?: string;
    gender?: string;
    instagram?: string;
    interests?: string;
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
    const [myVenues, setMyVenues] = useState<IMyVenue[]>([]);
    const [loading, setLoading] = useState(false);
    const [meLoading, setMeLoading] = useState(true);

    const [editMode, setEditMode] = useState(false);
    const [editName, setEditName] = useState('');
    const [editBio, setEditBio] = useState('');
    const [editAvatar, setEditAvatar] = useState('');
    const [editBirthdate, setEditBirthdate] = useState('');
    const [editCity, setEditCity] = useState('');
    const [editGender, setEditGender] = useState('');
    const [editInstagram, setEditInstagram] = useState('');
    const [editInterests, setEditInterests] = useState('');
    const [editLoading, setEditLoading] = useState(false);
    const [editError, setEditError] = useState('');
    const [editSuccess, setEditSuccess] = useState(false);

    const [avatarUploading, setAvatarUploading] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const avatarInputRef = useRef<HTMLInputElement>(null);

    const [avatarError, setAvatarError] = useState('');

    const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setAvatarError('');
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
        } catch (err: any) {
            console.error('Avatar upload error:', err?.response?.data ?? err);
            setAvatarError('Помилка завантаження фото');
            setAvatarPreview(null);
        }
        setAvatarUploading(false);
        if (avatarInputRef.current) avatarInputRef.current.value = '';
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
                if (tab === 'venues') {
                    const meResp = await userService.getMe().catch(() => null);
                    const ownId = meResp?.data?.id;
                    if (!ownId) {
                        setMyVenues([]);
                    } else {
                        const {data} = await axiosInstance.get(
                            `${urls.venue.base}?limit=50&sortBy=created&sortOrder=DESC&ownerId=${ownId}`
                        ).catch(() => ({data: []}));
                        setMyVenues(data?.data ?? data ?? []);
                    }
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
        setEditBirthdate(me?.birthdate ?? '');
        setEditCity(me?.city ?? '');
        setEditGender(me?.gender ?? '');
        setEditInstagram(me?.instagram ?? '');
        setEditInterests(me?.interests ?? '');
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
            const payload: Record<string, string> = {
                name: editName.trim(),
            };
            if (editBio.trim()) payload.bio = editBio.trim();
            if (editBirthdate) payload.birthdate = editBirthdate;
            if (editCity.trim()) payload.city = editCity.trim();
            if (editGender) payload.gender = editGender;
            if (editInstagram.trim()) payload.instagram = editInstagram.trim().replace(/^@/, '');
            if (editInterests.trim()) payload.interests = editInterests.trim();

            const {data} = await userService.updateMe(payload);
            setMe(prev => ({...prev!, ...data}));
            setEditSuccess(true);
            setEditMode(false);
        } catch (e: any) {
            console.error('updateMe error:', e?.response?.data);
            const resp = e?.response?.data;
            if (Array.isArray(resp?.message)) {
                setEditError(resp.message.join(' | '));
            } else if (typeof resp?.message === 'string') {
                setEditError(resp.message);
            } else if (resp?.error) {
                setEditError(`${resp.error} (${resp.statusCode ?? '?'})`);
            } else {
                setEditError('Помилка збереження. Відкрийте консоль (F12) для деталей.');
            }
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
    const getRolesArray = (src: any): string[] => {
        if (!src) return [];
        if (Array.isArray(src.role)) return src.role;
        if (typeof src.role === 'string') return [src.role];
        return [];
    };
    const roles: string[] = me ? getRolesArray(me) : getRolesArray(userObj);
    const isVenueAdmin = roles.includes('venue_admin');
    const isSuperAdmin = roles.includes('superadmin');
    const isAdmin = isVenueAdmin || isSuperAdmin;

    const TABS: { key: Tab; label: string; icon: string }[] = [
        {key: 'info', label: 'Мій профіль', icon: '👤'},
        {key: 'venues', label: 'Мої заклади', icon: '🏠'},
        {key: 'favorites', label: 'Улюблені', icon: '❤️'},
        {key: 'comments', label: 'Відгуки', icon: '💬'},
        {key: 'ratings', label: 'Оцінки', icon: '⭐'},
        {key: 'pyachok', label: 'Пиячок', icon: '🍺'},
    ];

    return (
        <div className={css.page}>
            <div className={css.layout}>
                <aside className={css.sidebar}>
                    <div className={css.avatarBox}>
                        <div className={css.avatarWrap}>
                            {avatarPreview || me?.image
                                ? <img src={avatarPreview ?? me!.image!} alt="" className={css.avatar}/>
                                : <div className={css.avatarPlaceholder}>{me?.name?.[0]?.toUpperCase() ?? '?'}</div>
                            }
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
                        {avatarError && <p style={{
                            fontSize: 11,
                            color: '#dc2626',
                            margin: '4px 0 0',
                            textAlign: 'center'
                        }}>{avatarError}</p>}
                        <div className={css.sidebarInfo}>
                            <h2 className={css.sidebarName}>{me?.name ?? (meLoading ? '...' : '—')}</h2>
                            <p className={css.sidebarEmail}>{me?.email ?? ''}</p>
                            {me?.isCritic && <span className={css.criticBadge}>🏅 Критик</span>}
                            {roles.includes('venue_admin') &&
                                <span className={css.criticBadge} style={{background: '#e0f2fe', color: '#0369a1'}}>🏠 Власник</span>}
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

                <main className={css.main}>

                    {tab === 'info' && (
                        <section className={css.section}>
                            <div className={css.sectionHeader}>
                                <h2 className={css.sectionTitle}>Мій профіль</h2>
                                {!editMode && (
                                    <button className={css.editProfileBtn} onClick={startEdit}>✏️ Редагувати</button>
                                )}
                            </div>

                            {meLoading ? <div className={css.loadingMsg}>Завантаження...</div> : editMode ? (
                                <div className={css.editForm}>
                                    <div className={css.editField}>
                                        <label className={css.editLabel}>Ім'я *</label>
                                        <input className={css.editInput} value={editName}
                                               placeholder="Іван Петренко"
                                               onChange={e => setEditName(e.target.value)}/>
                                    </div>
                                    <div className={css.editRow}>
                                        <div className={css.editField}>
                                            <label className={css.editLabel}>Дата народження</label>
                                            <input className={css.editInput} type="date"
                                                   value={editBirthdate}
                                                   max={new Date().toISOString().split('T')[0]}
                                                   onChange={e => setEditBirthdate(e.target.value)}/>
                                        </div>
                                        <div className={css.editField}>
                                            <label className={css.editLabel}>Стать</label>
                                            <select className={css.editSelect} value={editGender}
                                                    onChange={e => setEditGender(e.target.value)}>
                                                <option value="">— не вказано —</option>
                                                <option value="male">Чоловіча</option>
                                                <option value="female">Жіноча</option>
                                                <option value="other">Інша</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className={css.editField}>
                                        <label className={css.editLabel}>Місто</label>
                                        <input className={css.editInput} value={editCity}
                                               placeholder="Київ"
                                               onChange={e => setEditCity(e.target.value)}/>
                                    </div>
                                    <div className={css.editField}>
                                        <label className={css.editLabel}>Instagram</label>
                                        <div className={css.editInputPrefix}>
                                            <span className={css.editPrefix}>@</span>
                                            <input className={css.editInputWithPrefix}
                                                   value={editInstagram.replace(/^@/, '')}
                                                   placeholder="username"
                                                   onChange={e => setEditInstagram(e.target.value)}/>
                                        </div>
                                    </div>
                                    <div className={css.editField}>
                                        <label className={css.editLabel}>Про себе</label>
                                        <textarea className={css.editTextarea} rows={4}
                                                  placeholder="Розкажіть про себе — місто, захоплення..."
                                                  value={editBio} onChange={e => setEditBio(e.target.value)}/>
                                        <span className={css.editHint}>{editBio.length} / 300 символів</span>
                                    </div>
                                    <div className={css.editField}>
                                        <label className={css.editLabel}>Мої інтереси</label>
                                        <textarea className={css.editTextarea} rows={3}
                                                  placeholder="крафтове пиво, суші, живі концерти, тераси..."
                                                  value={editInterests}
                                                  onChange={e => setEditInterests(e.target.value)}/>
                                        <span
                                            className={css.editHint}>Через кому — що любиш, що шукаєш у закладах</span>
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
                                <div className={css.infoCard}>
                                    {(() => {
                                        const calcAge = (bd: string) => {
                                            const today = new Date();
                                            const birth = new Date(bd);
                                            let age = today.getFullYear() - birth.getFullYear();
                                            const m = today.getMonth() - birth.getMonth();
                                            if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
                                            return age;
                                        };
                                        const genderLabel: Record<string, string> = {
                                            male: 'Чоловіча', female: 'Жіноча', other: 'Інша'
                                        };
                                        const rows = [
                                            {k: "Ім'я", v: me?.name},
                                            {k: 'Email', v: me?.email},
                                            {k: 'Місто', v: me?.city},
                                            {
                                                k: 'Вік', v: me?.birthdate
                                                    ? `${calcAge(me.birthdate)} років (${new Date(me.birthdate).toLocaleDateString('uk-UA')})`
                                                    : undefined
                                            },
                                            {
                                                k: 'Стать',
                                                v: me?.gender ? genderLabel[me.gender] ?? me.gender : undefined
                                            },
                                            {k: 'Instagram', v: me?.instagram ? `@${me.instagram}` : undefined},
                                            {k: 'Про себе', v: me?.bio},
                                            {k: 'Інтереси', v: me?.interests},
                                            {
                                                k: 'Статус', v: (() => {
                                                    const parts = [];
                                                    if (me?.isCritic) parts.push('🏅 Критик');
                                                    if (roles.includes('venue_admin')) parts.push('🏠 Власник закладів');
                                                    if (roles.includes('superadmin')) parts.push('⚙️ Адмін');
                                                    return parts.length ? parts.join(' · ') : '👤 Користувач';
                                                })()
                                            },
                                        ];
                                        return rows.map(({k, v}) => v ? (
                                            <div className={css.infoRow} key={k}>
                                                <span className={css.infoKey}>{k}</span>
                                                <span className={css.infoVal}>{v}</span>
                                            </div>
                                        ) : null);
                                    })()}
                                </div>
                            )}

                            {!meLoading && me && (
                                <div className={css.rolesSection}>
                                    <h3 className={css.rolesSectionTitle}>Ролі та статуси</h3>
                                    <div className={css.rolesRow}>

                                        <div className={css.roleCard}>
                                            <div className={css.roleCardInfo}>
                                                <span className={css.roleLabel}>🏅 Критик</span>
                                                <span
                                                    className={css.roleDesc}>Ваші відгуки будуть позначені як критичні</span>
                                            </div>
                                            <RoleToggle active={!!me.isCritic} label="" desc=""
                                                        onAdd={() => axiosInstance.post(urls.users.criticAdd)
                                                            .then(({data}) => {
                                                                console.log('critic+', data);
                                                                setMe((p: any) => {
                                                                    const updated = {
                                                                        ...p,
                                                                        isCritic: true,
                                                                        role: data?.role ?? [...(p?.role ?? []), 'critic']
                                                                    };
                                                                    localStorage.setItem('user', JSON.stringify(updated));
                                                                    return updated;
                                                                });
                                                            })
                                                            .catch(e => console.error('critic+ error', e?.response?.data))}
                                                        onRemove={() => axiosInstance.delete(urls.users.criticRemove)
                                                            .then(({data}) => setMe((p: any) => {
                                                                const updated = {
                                                                    ...p,
                                                                    isCritic: false,
                                                                    role: data?.role ?? (p?.role ?? []).filter((r: string) => r !== 'critic')
                                                                };
                                                                localStorage.setItem('user', JSON.stringify(updated));
                                                                return updated;
                                                            }))
                                                            .catch(e => console.error('critic- error', e?.response?.data))}
                                            />
                                        </div>

                                        <div className={css.roleCard}>
                                            <div className={css.roleCardInfo}>
                                                <span className={css.roleLabel}>🏠 Власник закладу</span>
                                                <span className={css.roleDesc}>
                                                    {isVenueAdmin ? 'Активна — можете додавати заклади' : 'Отримайте щоб додавати заклади на платформу'}
                                                </span>
                                            </div>
                                            <RoleToggle active={isVenueAdmin} label="" desc=""
                                                        onAdd={() => axiosInstance.post(urls.users.venueAdminAdd)
                                                            .then(({data}) => {
                                                                console.log('venue_admin+', data);
                                                                setMe((p: any) => {
                                                                    const updated = {
                                                                        ...p,
                                                                        role: data?.role ?? [...(p?.role ?? []), 'venue_admin']
                                                                    };
                                                                    localStorage.setItem('user', JSON.stringify(updated));
                                                                    return updated;
                                                                });
                                                            })
                                                            .catch(e => console.error('venue_admin+ error', e?.response?.data))}
                                                        onRemove={() => axiosInstance.delete(urls.users.venueAdminRemove)
                                                            .then(({data}) => setMe((p: any) => {
                                                                const updated = {
                                                                    ...p,
                                                                    role: data?.role ?? (p?.role ?? []).filter((r: string) => r !== 'venue_admin')
                                                                };
                                                                localStorage.setItem('user', JSON.stringify(updated));
                                                                return updated;
                                                            }))
                                                            .catch(e => console.error('venue_admin- error', e?.response?.data))}
                                            />
                                        </div>

                                    </div>
                                </div>
                            )}

                            <div className={css.quickActions}>
                                <button className={css.actionBtn} onClick={() => navigate('/searchVenue')}>🔍 Знайти
                                    заклад
                                </button>
                                {isVenueAdmin && (
                                    <button className={css.actionBtn} onClick={() => navigate('/venues/create')}>＋
                                        Додати заклад</button>
                                )}
                                <button className={css.actionBtn} onClick={() => navigate('/news')}>📰 Новини</button>
                            </div>
                        </section>
                    )}


                    {tab === 'venues' && (
                        <section className={css.section}>
                            <div className={css.sectionHeader}>
                                <h2 className={css.sectionTitle}>Мої заклади</h2>
                                <button className={css.editProfileBtn} onClick={() => navigate('/venues/create')}>
                                    ＋ Додати заклад
                                </button>
                            </div>
                            {loading && <div className={css.loadingMsg}>Завантаження...</div>}
                            {!loading && myVenues.length === 0 && (
                                <div className={css.emptyState}>
                                    <span>🏠</span>
                                    <p>Ви ще не додали жодного закладу</p>
                                    <button className={css.actionBtn} onClick={() => navigate('/venues/create')}>
                                        ＋ Додати перший заклад
                                    </button>
                                </div>
                            )}
                            <div className={css.favGrid}>
                                {myVenues.map(v => (
                                    <div key={v.id} className={css.favCard} onClick={() => navigate(`/venues/${v.id}`)}>
                                        <div className={css.favImg}>
                                            {v.avatarVenue
                                                ? <img src={v.avatarVenue} alt={v.name}/>
                                                : <span>🏠</span>
                                            }
                                        </div>
                                        <div className={css.favInfo}>
                                            <h3 className={css.favName}>{v.name}</h3>
                                            {v.city && <p className={css.favCity}>📍 {v.city}</p>}
                                            <div className={css.venueStatusRow}>
                                                {v.isModerated
                                                    ? <span className={css.statusBadgeActive}>✓ Активний</span>
                                                    : <span className={css.statusBadgePending}>⏳ На модерації</span>
                                                }
                                            </div>
                                        </div>
                                        <button
                                            className={css.favRemove}
                                            title="Редагувати"
                                            onClick={e => {
                                                e.stopPropagation();
                                                navigate(`/venues/${v.id}/edit`);
                                            }}
                                        >✏️
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

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