import { FC, useEffect, useState } from 'react';
import { pyachokService } from '../../../services/pyachok.service';
import { IPyachokItem, PyachokStatusEnum } from '../../../interfaces/IPyachokInterface';
import { PyachokModal } from '../PyachokModal/PyachokModal';
import css from './VenuePyachokList.module.css';

interface IProps { venueId: string; venueName: string; }

const GENDER_LABELS: Record<string, string> = { any: 'Будь-яка', male: '👨 Чоловіча', female: '👩 Жіноча' };
const PAYER_LABELS:  Record<string, string> = { any: 'Обговоримо', me: '👤 Я пригощаю', split: '🤝 Поровну', other: '🎁 Мене пригощають' };

const VenuePyachokList: FC<IProps> = ({ venueId, venueName }) => {
    const [items,      setItems]      = useState<IPyachokItem[]>([]);
    const [total,      setTotal]      = useState(0);
    const [loading,    setLoading]    = useState(true);
    const [showModal,  setShowModal]  = useState(false);

    const load = async () => {
        setLoading(true);
        try {
            const { data } = await pyachokService.getVenueList(venueId, {
                status: PyachokStatusEnum.OPEN, limit: 10,
            });
            setItems(data.data ?? []);
            setTotal(data.total ?? 0);
        } catch { /* ignore */ }
        setLoading(false);
    };

    useEffect(() => { load(); }, [venueId]);

    return (
        <section className={css.section}>
            <div className={css.header}>
                <div className={css.titleRow}>
                    <h2 className={css.title}>🍺 Пиячок <span className={css.badge}>{total}</span></h2>
                    <p className={css.sub}>Відкриті запити на компанію в цьому закладі</p>
                </div>
                <button className={css.createBtn} onClick={() => setShowModal(true)}>
                    + Свій запит
                </button>
            </div>

            {loading && (
                <div className={css.skeletons}>
                    {[1,2,3].map(i => <div key={i} className={css.skeleton} />)}
                </div>
            )}

            {!loading && items.length === 0 && (
                <div className={css.empty}>
                    <span>🍻</span>
                    <p>Відкритих запитів поки немає. Будьте першим!</p>
                    <button className={css.createBtnEmpty} onClick={() => setShowModal(true)}>
                        Створити запит
                    </button>
                </div>
            )}

            {!loading && items.length > 0 && (
                <div className={css.list}>
                    {items.map(item => (
                        <article key={item.id} className={css.card}>
                            <div className={css.cardHeader}>
                                <div className={css.userInfo}>
                                    {item.user?.avatar
                                        ? <img src={item.user.avatar} alt="" className={css.avatar} />
                                        : <div className={css.avatarPlaceholder}>{item.user?.name?.[0]?.toUpperCase() ?? '?'}</div>
                                    }
                                    <div>
                                        <span className={css.userName}>{item.user?.name ?? 'Анонім'}</span>
                                        <span className={css.cardDate}>
                                            📅 {new Date(item.date).toLocaleDateString('uk-UA', { day:'numeric', month:'long' })} · 🕐 {item.time}
                                        </span>
                                    </div>
                                </div>
                                <span className={css.statusBadge}>🟢 Відкритий</span>
                            </div>

                            {item.purpose && <p className={css.purpose}>🎯 {item.purpose}</p>}

                            <div className={css.meta}>
                                {item.peopleCount && (
                                    <span className={css.metaTag}>👥 {item.peopleCount} осіб</span>
                                )}
                                {item.genderPreference && item.genderPreference !== 'any' && (
                                    <span className={css.metaTag}>{GENDER_LABELS[item.genderPreference]}</span>
                                )}
                                {item.payer && item.payer !== 'any' && (
                                    <span className={css.metaTag}>{PAYER_LABELS[item.payer]}</span>
                                )}
                                {item.expectedBudget && (
                                    <span className={css.metaTag}>💰 ≈{item.expectedBudget} ₴</span>
                                )}
                            </div>
                            {item.message && <p className={css.message}>"{item.message}"</p>}
                        </article>
                    ))}
                </div>
            )}

            {showModal && (
                <PyachokModal
                    venueId={venueId}
                    venueName={venueName}
                    onClose={() => { setShowModal(false); load(); }}
                />
            )}
        </section>
    );
};

export { VenuePyachokList };