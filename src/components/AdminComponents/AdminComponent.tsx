import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useAppSelector} from '../../hooks/useReduxHooks';
import {adminService} from '../../services/admin.service';
import css from './AdminComponent.module.css';

type AdminTab = 'venues' | 'pending' | 'users' | 'complaints' | 'top';

interface IAdminVenue {
    id: string;
    name: string;
    city?: string;
    avatarVenue?: string;
    isActive: boolean;
    isModerated: boolean;
    ratingAvg?: number;
    user?: { name?: string };
    categories?: { name: string }[];
}

interface IAdminUser {
    id: string;
    name?: string;
    email?: string;
    image?: string;
    isCritic?: boolean;
    role?: string[];
}

interface IComplaint {
    id: string;
    reason: string;
    type: string;
    status: string;
    created: string;
    user?: { id: string; name?: string };
    venue?: { id: string; name: string };
}

const COMPLAINT_STATUSES = ['new', 'in_review', 'resolved', 'rejected'];
const STATUS_LABELS: Record<string, string> = {
    new: '🆕 Нова', in_review: '🔍 На розгляді', resolved: '✅ Вирішено', rejected: '❌ Відхилено'
};
const STATUS_COLORS: Record<string, string> = {
    new: '#3b82f6', in_review: '#f59e0b', resolved: '#16a34a', rejected: '#dc2626'
};

const confirmAction = (message: string): boolean => {
    return window.confirm(message);
};

const VenuesTab = () => {
    const navigate = useNavigate();
    const [items, setItems] = useState<IAdminVenue[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterMod, setFilterMod] = useState<string>('all');
    const [filterActive, setFilterActive] = useState<string>('all');
    const [offset, setOffset] = useState(0);
    const LIMIT = 15;

    const load = async (off = 0) => {
        setLoading(true);
        const params: any = {limit: LIMIT, offset: off};
        if (search) params.search = search;
        if (filterMod !== 'all') params.isModerated = filterMod === 'true';
        if (filterActive !== 'all') params.isActive = filterActive === 'true';
        try {
            const {data} = await adminService.getVenues(params);
            const list = data.data ?? data ?? [];
            if (off === 0) setItems(list);
            else setItems(p => [...p, ...list]);
            setTotal(data.total ?? list.length);
            setOffset(off + list.length);
        } catch { /* ignore */
        }
        setLoading(false);
    };

    useEffect(() => {
        load(0);
    }, [search, filterMod, filterActive]); // eslint-disable-line

    const handleModerate = async (id: string) => {
        await adminService.moderateVenue(id).catch(() => {
        });
        setItems(p => p.map(v => v.id === id ? {...v, isModerated: true} : v));
    };
    const handleToggle = async (id: string, cur: boolean) => {
        await adminService.toggleActive(id).catch(() => {
        });
        setItems(p => p.map(v => v.id === id ? {...v, isActive: !cur} : v));
    };
    const handleDelete = async (id: string) => {
        if (!confirmAction('Видалити заклад?')) return;
        await adminService.deleteVenue(id).catch(() => {
        });
        setItems(p => p.filter(v => v.id !== id));
        setTotal(t => t - 1);
    };

    return (
        <div>
            <div className={css.toolbar}>
                <input className={css.searchInput} placeholder="🔍 Пошук закладів..."
                       value={search} onChange={e => {
                    setSearch(e.target.value);
                    setOffset(0);
                }}/>
                <select className={css.filter} value={filterMod} onChange={e => setFilterMod(e.target.value)}>
                    <option value="all">Всі (модерація)</option>
                    <option value="true">✅ Модеровані</option>
                    <option value="false">⏳ Очікують</option>
                </select>
                <select className={css.filter} value={filterActive} onChange={e => setFilterActive(e.target.value)}>
                    <option value="all">Всі (статус)</option>
                    <option value="true">🟢 Активні</option>
                    <option value="false">🔴 Неактивні</option>
                </select>
                <span className={css.totalCount}>Всього: {total}</span>
            </div>

            {loading && <div className={css.loadingRow}>Завантаження...</div>}

            <div className={css.tableWrap}>
                <table className={css.table}>
                    <thead>
                    <tr>
                        <th>Фото</th>
                        <th>Назва</th>
                        <th>Місто</th>
                        <th>Власник</th>
                        <th>Модерація</th>
                        <th>Статус</th>
                        <th>Рейтинг</th>
                        <th>Дії</th>
                    </tr>
                    </thead>
                    <tbody>
                    {items.map(v => (
                        <tr key={v.id}>
                            <td>
                                {v.avatarVenue
                                    ? <img src={v.avatarVenue} alt="" className={css.thumbImg}/>
                                    : <div className={css.thumbPlaceholder}>🏠</div>
                                }
                            </td>
                            <td>
                                    <span className={css.venueName} onClick={() => navigate(`/venues/${v.id}`)}>
                                        {v.name}
                                    </span>
                            </td>
                            <td className={css.cell}>{v.city ?? '—'}</td>
                            <td className={css.cell}>{v.user?.name ?? '—'}</td>
                            <td>
                                {v.isModerated
                                    ? <span className={css.badgeGreen}>✅ Так</span>
                                    : <button className={css.approveBtn} onClick={() => handleModerate(v.id)}>
                                        Схвалити
                                    </button>
                                }
                            </td>
                            <td>
                                <button
                                    className={v.isActive ? css.badgeGreen : css.badgeRed}
                                    onClick={() => handleToggle(v.id, v.isActive)}
                                    style={{cursor: 'pointer', border: 'none'}}>
                                    {v.isActive ? '🟢 Активний' : '🔴 Вимкнений'}
                                </button>
                            </td>
                            <td className={css.cell}>{v.ratingAvg ? Number(v.ratingAvg).toFixed(1) : '—'}</td>
                            <td>
                                <div className={css.actionBtns}>
                                    <button className={css.editBtn}
                                            onClick={() => navigate(`/venues/${v.id}/edit`)}>✏️
                                    </button>
                                    <button className={css.deleteBtn}
                                            onClick={() => handleDelete(v.id)}>🗑
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {!loading && items.length < total && (
                <div className={css.loadMoreRow}>
                    <button className={css.loadMoreBtn} onClick={() => load(offset)}>
                        Ще заклади ({total - items.length})
                    </button>
                </div>
            )}
        </div>
    );
};

const PendingTab = () => {
    const navigate = useNavigate();
    const [items, setItems] = useState<IAdminVenue[]>([]);
    const [loading, setLoading] = useState(true);

    const load = async () => {
        setLoading(true);
        try {
            const {data} = await adminService.getPending({limit: 50});
            setItems(data.data ?? data ?? []);
        } catch { /* ignore */
        }
        setLoading(false);
    };

    useEffect(() => {
        load();
    }, []);

    const handleModerate = async (id: string) => {
        await adminService.moderateVenue(id).catch(() => {
        });
        setItems(p => p.filter(v => v.id !== id));
    };
    const handleDelete = async (id: string) => {
        if (!confirmAction('Відхилити і видалити?')) return;
        await adminService.deleteVenue(id).catch(() => {
        });
        setItems(p => p.filter(v => v.id !== id));
    };

    if (loading) return <div className={css.loadingRow}>Завантаження...</div>;

    if (items.length === 0) return (
        <div className={css.emptyState}><span>✅</span><p>Нових заявок немає</p></div>
    );

    return (
        <div className={css.pendingList}>
            {items.map(v => (
                <div key={v.id} className={css.pendingCard}>
                    <div className={css.pendingLeft}>
                        {v.avatarVenue
                            ? <img src={v.avatarVenue} alt="" className={css.pendingImg}/>
                            : <div className={css.pendingImgPlaceholder}>🏠</div>
                        }
                        <div>
                            <h3 className={css.pendingName} onClick={() => navigate(`/venues/${v.id}`)}>
                                {v.name}
                            </h3>
                            {v.city && <p className={css.pendingCity}>📍 {v.city}</p>}
                            {v.user?.name && <p className={css.pendingOwner}>👤 {v.user.name}</p>}
                            {v.categories && v.categories.length > 0 && (
                                <p className={css.pendingCats}>{v.categories.map(c => c.name).join(', ')}</p>
                            )}
                        </div>
                    </div>
                    <div className={css.pendingActions}>
                        <button className={css.approveBtn} onClick={() => handleModerate(v.id)}>✅ Схвалити</button>
                        <button className={css.deleteBtn} onClick={() => handleDelete(v.id)}>❌ Відхилити</button>
                    </div>
                </div>
            ))}
        </div>
    );
};

const UsersTab = () => {
    const [items, setItems] = useState<IAdminUser[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [offset, setOffset] = useState(0);
    const LIMIT = 15;

    const load = async (off = 0) => {
        setLoading(true);
        const params: any = {limit: LIMIT, offset: off, search: search || undefined};
        try {
            const {data} = await adminService.getUsers(params);
            const list = data.data ?? data ?? [];
            if (off === 0) setItems(list);
            else setItems(p => [...p, ...list]);
            setTotal(data.total ?? list.length);
            setOffset(off + list.length);
        } catch { /* ignore */
        }
        setLoading(false);
    };

    useEffect(() => {
        load(0);
    }, [search]);

    const handleDelete = async (id: string) => {
        if (!confirmAction('Видалити користувача?')) return;
        await adminService.deleteUser(id).catch(() => {
        });
        setItems(p => p.filter(u => u.id !== id));
        setTotal(t => t - 1);
    };

    return (
        <div>
            <div className={css.toolbar}>
                <input className={css.searchInput} placeholder="🔍 Пошук користувачів..."
                       value={search} onChange={e => {
                    setSearch(e.target.value);
                    setOffset(0);
                }}/>
                <span className={css.totalCount}>Всього: {total}</span>
            </div>

            {loading && <div className={css.loadingRow}>Завантаження...</div>}

            <div className={css.tableWrap}>
                <table className={css.table}>
                    <thead>
                    <tr>
                        <th>Аватар</th>
                        <th>Ім'я</th>
                        <th>Email</th>
                        <th>Ролі</th>
                        <th>Дії</th>
                    </tr>
                    </thead>
                    <tbody>
                    {items.map(u => (
                        <tr key={u.id}>
                            <td>
                                {u.image
                                    ? <img src={u.image} alt="" className={css.thumbImg}/>
                                    : <div className={css.thumbPlaceholder}>{u.name?.[0]?.toUpperCase() ?? '?'}</div>
                                }
                            </td>
                            <td><span className={css.cellBold}>{u.name ?? '—'}</span></td>
                            <td className={css.cell}>{(u as any).email ?? '—'}</td>
                            <td>
                                <div className={css.roleChips}>
                                    {(Array.isArray(u.role) ? u.role : u.role ? [u.role] : [])
                                        .filter((r: string | undefined): r is string => Boolean(r))
                                        .map((r: string) => (
                                            <span key={r} className={css.roleChip}>{r}</span>
                                        ))}
                                    {u.isCritic && <span className={css.roleChipCritic}>🏅 Критик</span>}
                                </div>
                            </td>
                            <td>
                                <button className={css.deleteBtn} onClick={() => handleDelete(u.id)}>🗑</button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {!loading && items.length < total && (
                <div className={css.loadMoreRow}>
                    <button className={css.loadMoreBtn} onClick={() => load(offset)}>
                        Ще ({total - items.length})
                    </button>
                </div>
            )}
        </div>
    );
};

const ComplaintsTab = () => {
    const navigate = useNavigate();
    const [items, setItems] = useState<IComplaint[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [offset, setOffset] = useState(0);
    const LIMIT = 20;

    const load = async (off = 0) => {
        setLoading(true);
        const params: any = {limit: LIMIT, offset: off};
        if (filterStatus !== 'all') params.status = filterStatus;
        try {
            const {data} = await adminService.getComplaints(params);
            const list = data.data ?? data ?? [];
            if (off === 0) setItems(list);
            else setItems(p => [...p, ...list]);
            setTotal(data.total ?? list.length);
            setOffset(off + list.length);
        } catch {}
        setLoading(false);
    };

    useEffect(() => {
        load(0);
    }, [filterStatus]);

    const handleStatus = async (id: string, status: string) => {
        await adminService.updateComplaintStatus(id, status).catch(() => {
        });
        setItems(p => p.map(c => c.id === id ? {...c, status} : c));
    };

    return (
        <div>
            <div className={css.toolbar}>
                <select className={css.filter} value={filterStatus} onChange={e => {
                    setFilterStatus(e.target.value);
                    setOffset(0);
                }}>
                    <option value="all">Всі статуси</option>
                    {COMPLAINT_STATUSES.map(s => (
                        <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                    ))}
                </select>
                <span className={css.totalCount}>Всього: {total}</span>
            </div>

            {loading && <div className={css.loadingRow}>Завантаження...</div>}

            <div className={css.complaintsList}>
                {items.map(c => (
                    <div key={c.id} className={css.complaintCard}>
                        <div className={css.complaintHeader}>
                            <div className={css.complaintMeta}>
                                <span className={css.complaintType}>
                                    {c.type === 'venue' ? '🏠' : c.type === 'comment' ? '💬' : '🔹'} {c.type}
                                </span>
                                {c.venue && (
                                    <span className={css.complaintVenue}
                                          onClick={() => navigate(`/venues/${c.venue!.id}`)}>
                                        {c.venue.name}
                                    </span>
                                )}
                                {c.user && <span className={css.complaintUser}>від: {c.user.name ?? 'Анонім'}</span>}
                                <span className={css.complaintDate}>
                                    {new Date(c.created).toLocaleDateString('uk-UA')}
                                </span>
                            </div>
                            <span className={css.complaintStatusBadge}
                                  style={{background: STATUS_COLORS[c.status] + '22', color: STATUS_COLORS[c.status]}}>
                                {STATUS_LABELS[c.status] ?? c.status}
                            </span>
                        </div>

                        <p className={css.complaintReason}>{c.reason}</p>

                        <div className={css.complaintActions}>
                            <span className={css.statusLabel}>Змінити статус:</span>
                            {COMPLAINT_STATUSES.filter(s => s !== c.status).map(s => (
                                <button key={s} className={css.statusBtn}
                                        style={{borderColor: STATUS_COLORS[s], color: STATUS_COLORS[s]}}
                                        onClick={() => handleStatus(c.id, s)}>
                                    {STATUS_LABELS[s]}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {!loading && items.length === 0 && (
                <div className={css.emptyState}><span>📭</span><p>Скарг немає</p></div>
            )}

            {!loading && items.length < total && (
                <div className={css.loadMoreRow}>
                    <button className={css.loadMoreBtn} onClick={() => load(offset)}>
                        Ще ({total - items.length})
                    </button>
                </div>
            )}
        </div>
    );
};

const TopTab = () => {
    const [cats, setCats] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [newName, setNewName] = useState('');
    const [adding, setAdding] = useState(false);
    const [venueInputs, setVenueInputs] = useState<Record<string, string>>({});

    const load = async () => {
        setLoading(true);
        try {
            const {data} = await adminService.getTopCategories();
            setCats(Array.isArray(data) ? data : []);
        } catch { /* ignore */
        }
        setLoading(false);
    };

    useEffect(() => {
        load();
    }, []);

    const handleCreate = async () => {
        if (!newName.trim()) return;
        setAdding(true);
        try {
            const {data} = await adminService.createTopCategory({
                name: newName.trim(),
                slug: newName.trim().toLowerCase().replace(/\s+/g, '-')
            });
            setCats(p => [...p, data]);
            setNewName('');
        } catch { /* ignore */
        }
        setAdding(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirmAction('Видалити категорію?')) return;
        await adminService.deleteTopCategory(id).catch(() => {
        });
        setCats(p => p.filter(c => c.id !== id));
    };

    const handleAddVenue = async (catId: string) => {
        const venueId = (venueInputs[catId] ?? '').trim();
        if (!venueId) return;
        await adminService.addVenueToTop(catId, {venueId}).catch(() => {
        });
        setVenueInputs(p => ({...p, [catId]: ''}));
        load();
    };

    const handleRemoveVenue = async (catId: string, venueId: string) => {
        await adminService.removeVenueFromTop(catId, venueId).catch(() => {
        });
        setCats(p => p.map(c => c.id === catId
            ? {...c, venues: (c.venues ?? []).filter((v: any) => v.id !== venueId)}
            : c
        ));
    };

    return (
        <div>
            <div className={css.createCatRow}>
                <input className={css.searchInput} placeholder="Назва нової категорії..."
                       value={newName} onChange={e => setNewName(e.target.value)}
                       onKeyDown={e => e.key === 'Enter' && handleCreate()}/>
                <button className={css.approveBtn} onClick={handleCreate} disabled={adding || !newName.trim()}>
                    {adding ? '...' : '+ Створити'}
                </button>
            </div>

            {loading && <div className={css.loadingRow}>Завантаження...</div>}

            <div className={css.topCatList}>
                {cats.map(cat => (
                    <div key={cat.id} className={css.topCatCard}>
                        <div className={css.topCatHeader}>
                            <h3 className={css.topCatName}>{cat.name}</h3>
                            <span className={css.topCatSlug}>/{cat.slug}</span>
                            <button className={css.deleteBtn} onClick={() => handleDelete(cat.id)}>🗑</button>
                        </div>

                        {cat.venues && cat.venues.length > 0 && (
                            <div className={css.topVenueChips}>
                                {cat.venues.map((v: any) => (
                                    <span key={v.id} className={css.topVenueChip}>
                                        {v.name}
                                        <button onClick={() => handleRemoveVenue(cat.id, v.id)}>✕</button>
                                    </span>
                                ))}
                            </div>
                        )}

                        <div className={css.addVenueRow}>
                            <input className={css.addVenueInput}
                                   placeholder="ID закладу..."
                                   value={venueInputs[cat.id] ?? ''}
                                   onChange={e => setVenueInputs(p => ({...p, [cat.id]: e.target.value}))}/>
                            <button className={css.addVenueBtn} onClick={() => handleAddVenue(cat.id)}>
                                + Додати
                            </button>
                        </div>
                    </div>
                ))}

                {!loading && cats.length === 0 && (
                    <div className={css.emptyState}><span>📂</span><p>Категорій немає</p></div>
                )}
            </div>
        </div>
    );
};

const AdminComponent = () => {
    const navigate = useNavigate();
    const {isAuth} = useAppSelector(state => state.auth);
    const [tab, setTab] = useState<AdminTab>('pending');

    useEffect(() => {
        if (!isAuth) navigate('/login');
    }, [isAuth, navigate]);

    const TABS: { key: AdminTab; label: string; icon: string }[] = [
        {key: 'pending', label: 'На модерації', icon: '⏳'},
        {key: 'venues', label: 'Всі заклади', icon: '🏠'},
        {key: 'users', label: 'Користувачі', icon: '👥'},
        {key: 'complaints', label: 'Скарги', icon: '⚠️'},
        {key: 'top', label: 'Топ-категорії', icon: '🏆'},
    ];

    return (
        <div className={css.page}>
            <div className={css.sidebar}>
                <div className={css.sidebarLogo}>
                    <h2>⚙️ Адмін</h2>
                </div>
                <nav className={css.sidebarNav}>
                    {TABS.map(({key, label, icon}) => (
                        <button key={key}
                                className={`${css.sidebarBtn} ${tab === key ? css.sidebarActive : ''}`}
                                onClick={() => setTab(key)}>
                            <span className={css.sidebarIcon}>{icon}</span>
                            <span>{label}</span>
                        </button>
                    ))}
                </nav>
                <button className={css.backBtn} onClick={() => navigate('/')}>
                    ← На сайт
                </button>
            </div>

            <main className={css.main}>
                <div className={css.mainHeader}>
                    <h1 className={css.mainTitle}>
                        {TABS.find(t => t.key === tab)?.icon} {TABS.find(t => t.key === tab)?.label}
                    </h1>
                </div>
                <div className={css.mainContent}>
                    {tab === 'pending' && <PendingTab/>}
                    {tab === 'venues' && <VenuesTab/>}
                    {tab === 'users' && <UsersTab/>}
                    {tab === 'complaints' && <ComplaintsTab/>}
                    {tab === 'top' && <TopTab/>}
                </div>
            </main>
        </div>
    );
};

export {AdminComponent};