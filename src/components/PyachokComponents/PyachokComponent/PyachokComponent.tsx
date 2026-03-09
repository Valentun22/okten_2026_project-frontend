import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import css from './PyachokComponent.module.css';
import {IPyachokItem, PyachokStatusEnum} from "../../../interfaces/IPyachokInterface";
import {pyachokService} from "../../../services/pyachok.service";
import img1 from '../../../img/img1.png';

const GENDER_LABELS: Record<string, string> = { any: 'Будь-яка', male: '👨 Чоловіча', female: '👩 Жіноча' };
const PAYER_LABELS:  Record<string, string> = { any: 'Обговоримо', me: '👤 Я пригощаю', split: '🤝 Поровну', other: '🎁 Мене пригощають' };

const PyachokComponent = () => {
    const navigate = useNavigate();
    const [items,    setItems]    = useState<IPyachokItem[]>([]);
    const [total,    setTotal]    = useState(0);
    const [loading,  setLoading]  = useState(true);
    const [page,     setPage]     = useState(1);
    const LIMIT = 12;

    const load = async (p = 1) => {
        setLoading(true);
        try {
            const { data } = await pyachokService.getMyList({
                status: PyachokStatusEnum.OPEN,
                limit:  LIMIT,
                page:   p,
            });
            if (p === 1) setItems(data.data ?? []);
            else setItems(prev => [...prev, ...(data.data ?? [])]);
            setTotal(data.total ?? 0);
        } catch { /* ignore */ }
        setLoading(false);
    };

    useEffect(() => { load(1); }, []);

    return (
        <div className={css.page}>
            <div className={css.hero}>
                <img src={img1} alt="Logo" />
                <p className={css.heroSub}>Шукаєш компанію? Знайди людей, які хочуть провести час у барі чи ресторані</p>
                <div className={css.heroBtns}>
                    <button className={css.heroBtn} onClick={() => navigate('/searchVenue')}>
                        Знайти заклад
                    </button>
                </div>
            </div>

            <div className={css.container}>
                <div className={css.topRow}>
                    <h2 className={css.sectionTitle}>Мої запити <span className={css.totalBadge}>{total}</span></h2>
                </div>

                {loading && (
                    <div className={css.grid}>
                        {Array.from({ length: 6 }).map((_, i) => <div key={i} className={css.skeleton} />)}
                    </div>
                )}

                {!loading && items.length === 0 && (
                    <div className={css.empty}>
                        <span>🍻</span>
                        <p>Запитів поки немає. Знайди заклад і натисни «Пиячок»!</p>
                        <button className={css.emptyBtn} onClick={() => navigate('/searchVenue')}>
                            Шукати заклади
                        </button>
                    </div>
                )}

                {items.length > 0 && (
                    <>
                        <div className={css.grid}>
                            {items.map(item => (
                                <article key={item.id} className={css.card}>
                                    <div className={css.cardHeader}>
                                        <div className={css.userRow}>
                                            {item.user?.avatar
                                                ? <img src={item.user.avatar} alt="" className={css.avatar} />
                                                : <div className={css.avatarPlaceholder}>{item.user?.name?.[0]?.toUpperCase() ?? '?'}</div>
                                            }
                                            <span className={css.userName}>{item.user?.name ?? 'Анонім'}</span>
                                        </div>
                                        <span className={`${css.statusBadge} ${item.status === PyachokStatusEnum.OPEN ? css.open : css.closed}`}>
                                            {item.status === PyachokStatusEnum.OPEN ? '🟢 Відкритий' : '🔴 Закритий'}
                                        </span>
                                    </div>

                                    {item.venue && (
                                        <div className={css.venueRow} onClick={() => navigate(`/venues/${item.venue!.id}`)}>
                                            🏠 <span className={css.venueName}>{item.venue.name}</span>
                                            {item.venue.city && <span className={css.venueCity}>{item.venue.city}</span>}
                                        </div>
                                    )}

                                    <div className={css.dateRow}>
                                        <span>📅 {new Date(item.date).toLocaleDateString('uk-UA', { day:'numeric', month:'long' })}</span>
                                        <span>🕐 {item.time}</span>
                                    </div>

                                    {item.purpose && <p className={css.purpose}>🎯 {item.purpose}</p>}

                                    <div className={css.tags}>
                                        {item.peopleCount && <span className={css.tag}>👥 {item.peopleCount} осіб</span>}
                                        {item.genderPreference && item.genderPreference !== 'any' && (
                                            <span className={css.tag}>{GENDER_LABELS[item.genderPreference]}</span>
                                        )}
                                        {item.payer && item.payer !== 'any' && (
                                            <span className={css.tag}>{PAYER_LABELS[item.payer]}</span>
                                        )}
                                        {item.expectedBudget && (
                                            <span className={css.tag}>💰 ≈{item.expectedBudget} ₴</span>
                                        )}
                                    </div>

                                    {item.message && <p className={css.message}>"{item.message}"</p>}
                                </article>
                            ))}
                        </div>

                        {items.length < total && !loading && (
                            <div className={css.loadMoreWrap}>
                                <button className={css.loadMoreBtn} onClick={() => { const next = page + 1; setPage(next); load(next); }}>
                                    Завантажити ще
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export { PyachokComponent };