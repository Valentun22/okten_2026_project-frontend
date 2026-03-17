import {useEffect, useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useAppSelector} from '../../hooks/useReduxHooks';
import {adminService} from '../../services/admin.service';
import {toast} from '../../services/toast.service';
import {axiosInstance} from '../../services/axiosInstance.service';
import {urls} from '../../constants/urls';
import css from './AdminComponent.module.css';

type AdminTab = 'venues' | 'pending' | 'users' | 'complaints' | 'comments' | 'top' | 'cms';

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

const VenuesTab = () => {
    const navigate = useNavigate();
    const [items, setItems] = useState<IAdminVenue[]>([]);
    const [total, setTotal] = useState(0);
    const adminId = JSON.parse(localStorage.getItem('user') ?? '{}')?.id ?? '';
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterMod, setFilterMod] = useState<string>('all');
    const [filterActive, setFilterActive] = useState<string>('all');
    const [offset, setOffset] = useState(0);
    const LIMIT = 15;

    const [ownerModal, setOwnerModal] = useState<{ id: string; name: string } | null>(null);
    const [ownerLoading, setOwnerLoading] = useState(false);
    const [ownerSearch, setOwnerSearch] = useState('');
    const [ownerSearchResults, setOwnerSearchResults] = useState<IAdminUser[]>([]);
    const [ownerSearchLoading, setOwnerSearchLoading] = useState(false);
    const [ownerSelected, setOwnerSelected] = useState<IAdminUser | null>(null);
    const ownerSearchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [ratingModal, setRatingModal] = useState<{ id: string; name: string } | null>(null);
    const [ratingValue, setRatingValue] = useState(5);
    const [ratingLoading, setRatingLoading] = useState(false);

    const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);

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
        void load(0);
    }, [search, filterMod, filterActive]); // eslint-disable-line

    const handleModerate = async (id: string) => {
        await adminService.moderateVenue(id)
            .then(() => toast.success('Заклад схвалено!'))
            .catch(() => toast.error('Помилка схвалення'));
        setItems(p => p.map(v => v.id === id ? {...v, isModerated: true} : v));
    };
    const handleToggle = async (id: string, cur: boolean) => {
        await adminService.toggleActive(id).catch(() => {
        });
        setItems(p => p.map(v => v.id === id ? {...v, isActive: !cur} : v));
    };
    const handleDeleteConfirmed = async () => {
        if (!deleteConfirm) return;
        await adminService.deleteVenue(deleteConfirm.id).catch(() => {
        });
        setItems(p => p.filter(v => v.id !== deleteConfirm.id));
        setTotal(t => t - 1);
        setDeleteConfirm(null);
    };
    const handleOwnerSearchChange = (val: string) => {
        setOwnerSearch(val);
        setOwnerSelected(null);
        if (ownerSearchTimer.current) clearTimeout(ownerSearchTimer.current);
        if (!val.trim()) {
            setOwnerSearchResults([]);
            return;
        }
        ownerSearchTimer.current = setTimeout(async () => {
            setOwnerSearchLoading(true);
            try {
                const {data} = await adminService.getUsers({limit: 10, search: val});
                setOwnerSearchResults(data.data ?? data ?? []);
            } catch {
            }
            setOwnerSearchLoading(false);
        }, 300);
    };

    const handleChangeOwnerSubmit = async () => {
        if (!ownerModal || !ownerSelected) return;
        setOwnerLoading(true);
        await adminService.changeOwner(ownerModal.id, ownerSelected.id).catch(() => {
        });
        setOwnerLoading(false);
        setOwnerModal(null);
        setOwnerSearch('');
        setOwnerSelected(null);
        setOwnerSearchResults([]);
        void load(0);
    };
    const handleSetRatingSubmit = async () => {
        if (!ratingModal) return;
        setRatingLoading(true);
        await adminService.setVenueRating(ratingModal.id, {
            userId: adminId, rating: ratingValue,
        }).catch(() => {
        });
        setRatingLoading(false);
        setItems(p => p.map(v => v.id === ratingModal.id ? {...v, ratingAvg: ratingValue} : v));
        setRatingModal(null);
        setRatingValue(5);
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
                                    <button className={css.editBtn} title="Змінити власника"
                                            onClick={() => {
                                                setOwnerModal({id: v.id, name: v.name});
                                                setOwnerSearch('');
                                                setOwnerSelected(null);
                                                setOwnerSearchResults([]);
                                            }}>👤
                                    </button>
                                    <button className={css.editBtn} title="Виставити рейтинг"
                                            onClick={() => {
                                                setRatingModal({id: v.id, name: v.name});
                                                setRatingValue(5);
                                            }}>⭐
                                    </button>
                                    <button className={css.deleteBtn}
                                            onClick={() => setDeleteConfirm({id: v.id, name: v.name})}>🗑
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

            {deleteConfirm && (
                <div className={css.modalOverlay}>
                    <div className={css.modalBox}>
                        <h3 className={css.modalTitle}>Видалити заклад?</h3>
                        <p className={css.modalDesc}>«{deleteConfirm.name}» буде видалено назавжди.</p>
                        <div className={css.modalActions}>
                            <button className={css.modalCancelBtn} onClick={() => setDeleteConfirm(null)}>Скасувати
                            </button>
                            <button className={css.modalDangerBtn} onClick={handleDeleteConfirmed}>Видалити</button>
                        </div>
                    </div>
                </div>
            )}

            {ownerModal && (
                <div className={css.modalOverlay}>
                    <div className={css.modalBox}>
                        <h3 className={css.modalTitle}>Змінити власника</h3>
                        <p className={css.modalDesc}>Заклад: «{ownerModal.name}»</p>
                        <label className={css.modalLabel}>Пошук нового власника</label>
                        <div style={{position: 'relative'}}>
                            <input
                                className={css.modalInput}
                                placeholder="Введіть ім'я або email..."
                                value={ownerSelected ? `${ownerSelected.name ?? ''} (${(ownerSelected as any).email ?? ''})` : ownerSearch}
                                onChange={e => {
                                    if (!ownerSelected) handleOwnerSearchChange(e.target.value);
                                }}
                                onClick={() => {
                                    if (ownerSelected) {
                                        setOwnerSelected(null);
                                        setOwnerSearch('');
                                        setOwnerSearchResults([]);
                                    }
                                }}
                                autoFocus
                            />
                            {ownerSearchLoading && (
                                <div style={{
                                    position: 'absolute',
                                    right: 10,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    fontSize: 12,
                                    color: '#aaa'
                                }}>...</div>
                            )}
                            {!ownerSelected && ownerSearchResults.length > 0 && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: 0,
                                    right: 0,
                                    background: 'var(--modalBg,#fff)',
                                    border: '1px solid #e0d6ca',
                                    borderTop: 'none',
                                    borderRadius: '0 0 8px 8px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                    zIndex: 10,
                                    maxHeight: 220,
                                    overflowY: 'auto'
                                }}>
                                    {ownerSearchResults.map(u => (
                                        <div key={u.id}
                                             style={{
                                                 display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
                                                 cursor: 'pointer', borderBottom: '1px solid #f5f0eb'
                                             }}
                                             onMouseDown={() => {
                                                 setOwnerSelected(u);
                                                 setOwnerSearch('');
                                                 setOwnerSearchResults([]);
                                             }}
                                        >
                                            {u.image
                                                ? <img src={u.image} alt="" style={{
                                                    width: 28,
                                                    height: 28,
                                                    borderRadius: '50%',
                                                    objectFit: 'cover'
                                                }}/>
                                                : <div style={{
                                                    width: 28,
                                                    height: 28,
                                                    borderRadius: '50%',
                                                    background: '#c18a66',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: '#fff',
                                                    fontSize: 13,
                                                    fontWeight: 600
                                                }}>
                                                    {u.name?.[0]?.toUpperCase() ?? '?'}
                                                </div>
                                            }
                                            <div>
                                                <div style={{
                                                    fontSize: 13,
                                                    fontWeight: 600,
                                                    color: '#2d2d2d'
                                                }}>{u.name ?? '—'}</div>
                                                <div
                                                    style={{fontSize: 11, color: '#888'}}>{(u as any).email ?? ''}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        {ownerSelected && (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                marginTop: 10,
                                padding: '8px 12px',
                                background: '#f0ebe4',
                                borderRadius: 8
                            }}>
                                {ownerSelected.image
                                    ? <img src={ownerSelected.image} alt=""
                                           style={{width: 32, height: 32, borderRadius: '50%', objectFit: 'cover'}}/>
                                    : <div style={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: '50%',
                                        background: '#c18a66',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#fff',
                                        fontSize: 14,
                                        fontWeight: 600
                                    }}>
                                        {ownerSelected.name?.[0]?.toUpperCase() ?? '?'}
                                    </div>
                                }
                                <div>
                                    <div style={{fontSize: 13, fontWeight: 600}}>✓ {ownerSelected.name}</div>
                                    <div style={{fontSize: 11, color: '#888'}}>{(ownerSelected as any).email}</div>
                                </div>
                            </div>
                        )}
                        <div className={css.modalActions}>
                            <button className={css.modalCancelBtn} onClick={() => {
                                setOwnerModal(null);
                                setOwnerSearch('');
                                setOwnerSelected(null);
                                setOwnerSearchResults([]);
                            }}>Скасувати
                            </button>
                            <button className={css.modalPrimaryBtn} disabled={!ownerSelected || ownerLoading}
                                    onClick={handleChangeOwnerSubmit}>
                                {ownerLoading ? '...' : 'Зберегти'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {ratingModal && (
                <div className={css.modalOverlay}>
                    <div className={css.modalBox}>
                        <h3 className={css.modalTitle}>Встановити рейтинг</h3>
                        <p className={css.modalDesc}>Заклад: «{ratingModal.name}»</p>
                        <label className={css.modalLabel}>Оцінка: <strong>{ratingValue}</strong> / 10</label>
                        <input
                            type="range" min={1} max={10} step={1}
                            value={ratingValue}
                            onChange={e => setRatingValue(Number(e.target.value))}
                            className={css.modalRange}
                        />
                        <div className={css.modalRangeTicks}>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                                <span key={n} style={{color: n <= ratingValue ? '#c18a66' : '#ccc'}}>{n}</span>
                            ))}
                        </div>
                        <div className={css.modalActions}>
                            <button className={css.modalCancelBtn} onClick={() => setRatingModal(null)}>Скасувати
                            </button>
                            <button className={css.modalPrimaryBtn} disabled={ratingLoading}
                                    onClick={handleSetRatingSubmit}>
                                {ratingLoading ? '...' : 'Встановити'}
                            </button>
                        </div>
                    </div>
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
        } catch {
        }
        setLoading(false);
    };

    useEffect(() => {
        void load();
    }, []);

    const handleModerate = async (id: string) => {
        await adminService.moderateVenue(id).catch(() => {
        });
        setItems(p => p.filter(v => v.id !== id));
    };
    const handleDelete = async (id: string) => {
        if (!window.confirm('Відхилити і видалити?')) return;
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
    const navigate = useNavigate();
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
        } catch {
        }
        setLoading(false);
    };

    useEffect(() => {
        void load(0);
    }, [search]);

    const handleDelete = async (id: string) => {
        if (!window.confirm('Видалити користувача?')) return;
        await adminService.deleteUser(id)
            .then(() => toast.success('Користувача видалено'))
            .catch(() => toast.error('Помилка видалення'));
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
                                <div style={{cursor: 'pointer'}} onClick={() => navigate(`/users/${u.id}`)}>
                                    {u.image
                                        ? <img src={u.image} alt="" className={css.thumbImg}/>
                                        :
                                        <div className={css.thumbPlaceholder}>{u.name?.[0]?.toUpperCase() ?? '?'}</div>
                                    }
                                </div>
                            </td>
                            <td>
                                <span className={css.venueName} onClick={() => navigate(`/users/${u.id}`)}>
                                    {u.name ?? '—'}
                                </span>
                            </td>
                            <td className={css.cell}>{(u as any).email ?? '—'}</td>
                            <td>
                                <div className={css.roleChips}>
                                    {([] as string[]).concat(u.role ?? []).filter(Boolean).map((r: string) => (
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
        } catch {
        }
        setLoading(false);
    };

    useEffect(() => {
        void load(0);
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
    const [draggingCatIdx, setDraggingCatIdx] = useState<number | null>(null);
    const [draggingVenue, setDraggingVenue] = useState<{ catId: string; idx: number } | null>(null);

    const dragCatIdx = useRef<number | null>(null);
    const dragOverCatIdx = useRef<number | null>(null);
    const dragVenueInfo = useRef<{ catId: string; idx: number } | null>(null);
    const dragOverVenueInfo = useRef<{ catId: string; idx: number } | null>(null);

    const load = async () => {
        setLoading(true);
        try {
            const {data} = await adminService.getTopCategories();
            setCats(Array.isArray(data) ? data : []);
        } catch {
        }
        setLoading(false);
    };

    useEffect(() => {
        void load();
    }, []);

    const handleCatDragStart = (idx: number) => {
        dragCatIdx.current = idx;
        setDraggingCatIdx(idx);
    };

    const handleCatDragOver = (e: React.DragEvent, idx: number) => {
        e.preventDefault();
        dragOverCatIdx.current = idx;
    };

    const handleCatDrop = async () => {
        const from = dragCatIdx.current;
        const to = dragOverCatIdx.current;

        setDraggingCatIdx(null);

        if (from === null || to === null || from === to) return;

        const newOrder = [...cats];
        const [moved] = newOrder.splice(from, 1);
        newOrder.splice(to, 0, moved);

        setCats(newOrder);
        dragCatIdx.current = null;
        dragOverCatIdx.current = null;

        await axiosInstance.patch(
            urls.admin.topCategoriesOrder,
            {ids: newOrder.map(c => c.id)}
        ).catch(() => {
        });
    };

    const touchCatStart = (idx: number) => {
        dragCatIdx.current = idx;
        setDraggingCatIdx(idx);
    };

    const touchCatOver = (idx: number) => {
        dragOverCatIdx.current = idx;
    };

    const touchCatEnd = () => {
        handleCatDrop();
    };

    const handleVenueDragStart = (catId: string, idx: number) => {
        dragVenueInfo.current = {catId, idx};
        setDraggingVenue({catId, idx});
    };

    const handleVenueDragOver = (e: React.DragEvent, catId: string, idx: number) => {
        e.preventDefault();
        dragOverVenueInfo.current = {catId, idx};
    };

    const handleVenueDrop = async (catId: string) => {
        const from = dragVenueInfo.current;
        const to = dragOverVenueInfo.current;

        setDraggingVenue(null);

        if (!from || !to || from.catId !== catId || from.idx === to.idx) return;

        const cat = cats.find(c => c.id === catId);
        if (!cat) return;

        const venues = [...(cat.venues ?? [])];
        const [moved] = venues.splice(from.idx, 1);
        venues.splice(to.idx, 0, moved);

        setCats(p => p.map(c => c.id === catId ? {...c, venues} : c));

        dragVenueInfo.current = null;
        dragOverVenueInfo.current = null;

        await axiosInstance.patch(
            urls.admin.topCategoryVenueOrder(catId),
            {ids: venues.map((v: any) => v.id)}
        ).catch(() => {
        });
    };

    const handleCreate = async () => {
        if (!newName.trim()) return;
        setAdding(true);
        try {
            const {data} = await adminService.createTopCategory({
                title: newName.trim(),
                slug: newName.trim().toLowerCase().replace(/\s+/g, '-'),
            });
            setCats(p => [...p, data]);
            setNewName('');
        } catch (e) {
            console.error('createTopCategory error:', e);
        }
        setAdding(false);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Видалити категорію?')) return;
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
        void load();
    };

    const handleRemoveVenue = async (catId: string, venueId: string) => {
        await adminService.removeVenueFromTop(catId, venueId).catch(() => {
        });
        setCats(p =>
            p.map(c =>
                c.id === catId
                    ? {...c, venues: (c.venues ?? []).filter((v: any) => v.id !== venueId)}
                    : c
            )
        );
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

            <p className={css.dragHint}>☰ Перетягуйте категорії та заклади щоб змінити порядок</p>

            {loading && <div className={css.loadingRow}>Завантаження...</div>}

            <div className={css.topCatList}>
                {cats.map((cat, catIdx) => (
                    <div key={cat.id}
                         className={`${css.topCatCard} ${draggingCatIdx === catIdx ? css.dragging : ''}`}
                         draggable
                         onDragStart={() => handleCatDragStart(catIdx)}
                         onDragOver={e => handleCatDragOver(e, catIdx)}
                         onDrop={handleCatDrop}
                         onDragEnd={() => {
                             dragCatIdx.current = null;
                             dragOverCatIdx.current = null;
                             setDraggingCatIdx(null);
                         }}
                         onTouchStart={() => touchCatStart(catIdx)}
                         onTouchMove={() => touchCatOver(catIdx)}
                         onTouchEnd={touchCatEnd}>

                        <div className={css.topCatHeader}>
                            <span className={css.dragHandle} title="Перетягнути">☰</span>
                            <h3 className={css.topCatName}>{(cat as any).title ?? (cat as any).name}</h3>
                            <span className={css.topCatSlug}>/{cat.slug}</span>
                            <span className={css.topCatCount}>{(cat.venues ?? []).length} закладів</span>
                            <button className={css.deleteBtn} onClick={() => handleDelete(cat.id)}>🗑</button>
                        </div>

                        {cat.venues && cat.venues.length > 0 && (
                            <div className={css.topVenueList}>
                                {cat.venues.map((v: any, vIdx: number) => (
                                    <div key={v.id}
                                         className={`${css.topVenueItem} ${draggingVenue?.catId === cat.id && draggingVenue?.idx === vIdx ? css.dragging : ''}`}
                                         draggable
                                         onDragStart={e => {
                                             e.stopPropagation();
                                             handleVenueDragStart(cat.id, vIdx);
                                         }}
                                         onDragOver={e => {
                                             e.preventDefault();
                                             e.stopPropagation();
                                             handleVenueDragOver(e, cat.id, vIdx);
                                         }}
                                         onDrop={e => {
                                             e.stopPropagation();
                                             handleVenueDrop(cat.id);
                                         }}
                                         onDragEnd={() => {
                                             dragVenueInfo.current = null;
                                             dragOverVenueInfo.current = null;
                                             setDraggingVenue(null);
                                         }}
                                         onTouchStart={e => {
                                             e.stopPropagation();
                                             handleVenueDragStart(cat.id, vIdx);
                                         }}
                                         onTouchMove={e => {
                                             e.stopPropagation();
                                             dragOverVenueInfo.current = {catId: cat.id, idx: vIdx};
                                         }}
                                         onTouchEnd={e => {
                                             e.stopPropagation();
                                             handleVenueDrop(cat.id);
                                         }}>
                                        <span className={css.venueDragHandle}>⠿</span>
                                        <span className={css.venueOrder}>{vIdx + 1}</span>
                                        {v.avatarVenue && <img src={v.avatarVenue} alt="" className={css.venueThumb}/>}
                                        <span className={css.venueName}>{v.name}</span>
                                        {v.city && <span className={css.venueCity}>{v.city}</span>}
                                        <button className={css.venueRemoveBtn}
                                                onClick={() => handleRemoveVenue(cat.id, v.id)}>✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className={css.addVenueRow}>
                            <input className={css.addVenueInput}
                                   placeholder="ID закладу..."
                                   value={venueInputs[cat.id] ?? ''}
                                   onChange={e => setVenueInputs(p => ({...p, [cat.id]: e.target.value}))}
                                   onKeyDown={e => e.key === 'Enter' && handleAddVenue(cat.id)}/>
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

const CommentsTab = () => {
    const [items, setItems] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [offset, setOffset] = useState(0);
    const [search, setSearch] = useState('');
    const [editId, setEditId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({title: '', body: '', rating: 1});
    const LIMIT = 20;

    const load = async (off = 0, q = search) => {
        setLoading(true);
        try {
            const {data} = await adminService.getComments({limit: LIMIT, offset: off, search: q || undefined});
            const list = (data as any).data ?? data ?? [];
            if (off === 0) setItems(list); else setItems(p => [...p, ...list]);
            setTotal((data as any).total ?? list.length);
            setOffset(off + list.length);
        } catch {
        }
        setLoading(false);
    };

    useEffect(() => {
        load(0, search);
    }, [search]);

    const handleDelete = async (id: string) => {
        if (!window.confirm('Видалити коментар?')) return;
        await adminService.deleteComment(id).catch(() => {
        });
        setItems(p => p.filter(c => c.id !== id));
        setTotal(t => t - 1);
    };

    const openEdit = (c: any) => {
        setEditId(c.id);
        setEditForm({title: c.title ?? '', body: c.body ?? '', rating: c.rating ?? 1});
    };

    const saveEdit = async () => {
        if (!editId) return;
        await adminService.updateComment(editId, editForm).catch(() => {
        });
        setItems(p => p.map(c => c.id === editId ? {...c, ...editForm} : c));
        setEditId(null);
    };

    return (
        <div>
            <div className={css.toolbar}>
                <input className={css.searchInput} placeholder="🔍 Пошук за текстом, автором, закладом..."
                       value={search} onChange={e => {
                    setSearch(e.target.value);
                    setOffset(0);
                }}/>
                <span className={css.totalCount}>Всього: {total}</span>
            </div>
            {loading && <div className={css.loadingRow}>Завантаження...</div>}
            {!loading && items.length === 0 && (
                <div className={css.emptyState}><span>💬</span><p>Коментарів немає</p></div>
            )}
            <div className={css.tableWrap}>
                <table className={css.table}>
                    <thead>
                    <tr>
                        <th>Автор</th>
                        <th>Заклад</th>
                        <th>⭐</th>
                        <th>Заголовок</th>
                        <th>Дії</th>
                    </tr>
                    </thead>
                    <tbody>
                    {items.map((c: any) => editId === c.id ? (
                        <tr key={c.id}>
                            <td colSpan={3}>
                                <input className={css.searchInput} value={editForm.title}
                                       onChange={e => setEditForm(p => ({...p, title: e.target.value}))}
                                       placeholder="Заголовок"/>
                                <textarea style={{width: '100%', marginTop: 4}} rows={2} value={editForm.body}
                                          onChange={e => setEditForm(p => ({...p, body: e.target.value}))}
                                          placeholder="Текст"/>
                                <input type="number" min={1} max={10} style={{width: 60, marginTop: 4}}
                                       value={editForm.rating}
                                       onChange={e => setEditForm(p => ({...p, rating: +e.target.value}))}/>
                            </td>
                            <td colSpan={2}>
                                <div className={css.actionBtns}>
                                    <button className={css.approveBtn} onClick={saveEdit}>✓ Зберегти</button>
                                    <button className={css.deleteBtn} onClick={() => setEditId(null)}>✕</button>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        <tr key={c.id}>
                            <td className={css.cell}>{c.user?.name ?? '—'}</td>
                            <td className={css.cell}>{c.venue?.name ?? '—'}</td>
                            <td className={css.cell}>{c.rating}</td>
                            <td className={css.cell}>{c.title}</td>
                            <td>
                                <div className={css.actionBtns}>
                                    <button className={css.editBtn} onClick={() => openEdit(c)}>✏️</button>
                                    <button className={css.deleteBtn} onClick={() => handleDelete(c.id)}>🗑</button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
            {!loading && items.length < total && (
                <div className={css.loadMoreRow}>
                    <button className={css.loadMoreBtn} onClick={() => load(offset)}>Ще ({total - items.length})
                    </button>
                </div>
            )}
        </div>
    );
};

const CmsTab = () => {
    const GROUPS = [
        {
            title: '📄 Сторінка «Про нас»',
            hint: 'Відображається на сторінці /aboutUs',
            fields: [
                {key: 'about_title', label: 'Заголовок', type: 'text' as const},
                {key: 'about_text', label: 'Основний текст', type: 'textarea' as const},
                {key: 'about_idea', label: 'Блок «Наша ідея»', type: 'textarea' as const},
            ],
        },
        {
            title: '📞 Контактна інформація',
            hint: 'Відображається на сторінках «Про нас» та «Головна»',
            fields: [
                {key: 'contact_phone', label: 'Телефон', type: 'text' as const},
                {key: 'contact_email', label: 'Email', type: 'text' as const},
                {key: 'contact_address', label: 'Адреса', type: 'text' as const},
            ],
        },
        {
            title: '🌐 Соціальні мережі',
            hint: 'Повне посилання, наприклад https://instagram.com/pyachok',
            fields: [
                {key: 'social_instagram', label: 'Instagram', type: 'text' as const},
                {key: 'social_facebook', label: 'Facebook', type: 'text' as const},
                {key: 'social_telegram', label: 'Telegram', type: 'text' as const},
            ],
        },
        {
            title: '⚠️ Попередження при вході',
            hint: 'Показується при першому відвіданні сайту',
            fields: [
                {key: 'warning_age', label: 'Текст попередження 18+', type: 'textarea' as const},
                {key: 'warning_safety', label: 'Текст про безпеку (Пиячок)', type: 'textarea' as const},
            ],
        },
        {
            title: '🔍 SEO',
            hint: 'Метадані для пошукових систем',
            fields: [
                {key: 'seo_title', label: 'Назва сайту (title)', type: 'text' as const},
                {key: 'seo_description', label: 'Опис сайту (description)', type: 'textarea' as const},
            ],
        },
    ];

    const [form, setForm] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        setLoading(true);
        adminService.getCmsSettings()
            .then(({data}) => setForm(typeof data === 'object' && data ? data as Record<string, string> : {}))
            .catch(() => setError('Помилка завантаження'))
            .finally(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setSaved(false);
        setError('');
        try {
            await adminService.updateCmsSettings(form);
            setSaved(true);
            toast.success('Налаштування збережено!');
            setTimeout(() => setSaved(false), 3000);
        } catch {
            setError('Помилка збереження');
            toast.error('Помилка збереження налаштувань');
        }
        setSaving(false);
    };

    const set = (key: string, val: string) => setForm(p => ({...p, [key]: val}));

    if (loading) return <div className={css.loadingRow}>Завантаження...</div>;

    return (
        <div className={css.cmsWrap}>
            <div className={css.cmsHeader}>
                <div>
                    <h3 className={css.cmsTitle}>CMS — Управління контентом</h3>
                    <p className={css.cmsHint}>Зміни відображаються на сайті одразу після збереження</p>
                </div>
                <div className={css.cmsActions}>
                    {saved && <span className={css.cmsSaved}>✓ Збережено!</span>}
                    {error && <span className={css.cmsError}>{error}</span>}
                    <button className={css.approveBtn} onClick={handleSave} disabled={saving}>
                        {saving ? '⏳ Збереження...' : '💾 Зберегти все'}
                    </button>
                </div>
            </div>

            {GROUPS.map(group => (
                <div key={group.title} className={css.cmsGroup}>
                    <div className={css.cmsGroupHeader}>
                        <h4 className={css.cmsGroupTitle}>{group.title}</h4>
                        <span className={css.cmsGroupHint}>{group.hint}</span>
                    </div>
                    <div className={css.cmsForm}>
                        {group.fields.map(({key, label, type}) => (
                            <div key={key} className={css.cmsField}>
                                <label className={css.cmsLabel}>{label}</label>
                                {type === 'textarea' ? (
                                    <textarea
                                        className={css.cmsTextarea}
                                        rows={4}
                                        value={form[key] ?? ''}
                                        onChange={e => set(key, e.target.value)}
                                        placeholder={`Введіть ${label.toLowerCase()}...`}
                                    />
                                ) : (
                                    <input
                                        type="text"
                                        className={css.cmsInput}
                                        value={form[key] ?? ''}
                                        onChange={e => set(key, e.target.value)}
                                        placeholder={`Введіть ${label.toLowerCase()}...`}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            <div className={css.cmsActionsBottom}>
                {saved && <span className={css.cmsSaved}>✓ Збережено!</span>}
                {error && <span className={css.cmsError}>{error}</span>}
                <button className={css.approveBtn} onClick={handleSave} disabled={saving}>
                    {saving ? '⏳ Збереження...' : '💾 Зберегти все'}
                </button>
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
        {key: 'comments', label: 'Коментарі', icon: '💬'},
        {key: 'complaints', label: 'Скарги', icon: '⚠️'},
        {key: 'top', label: 'Топ-категорії', icon: '🏆'},
        {key: 'cms', label: 'CMS / Контент', icon: '📝'},
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
                    {tab === 'comments' && <CommentsTab/>}
                    {tab === 'complaints' && <ComplaintsTab/>}
                    {tab === 'top' && <TopTab/>}
                    {tab === 'cms' && <CmsTab/>}
                </div>
            </main>
        </div>
    );
};

export {AdminComponent};