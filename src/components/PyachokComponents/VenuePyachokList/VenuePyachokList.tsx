import {FC, useEffect, useState} from 'react';
import {pyachokService} from '../../../services/pyachok.service';
import {IPyachokItem, PyachokStatusEnum} from '../../../interfaces/IPyachokInterface';
import {PyachokModal} from '../PyachokModal/PyachokModal';
import css from './VenuePyachokList.module.css';
import {messageService} from "../../../services/massage.service";

interface IProps {
    venueId: string;
    venueName: string;
    isVenueOwner?: boolean;
}

const GENDER_LABELS: Record<string, string> = {any: 'Будь-яка', male: '👨 Чоловіча', female: '👩 Жіноча'};
const PAYER_LABELS: Record<string, string> = {
    any: 'Обговоримо',
    me: '👤 Я пригощаю',
    split: '🤝 Поровну',
    other: '🎁 Мене пригощають',
};

const VenuePyachokList: FC<IProps> = ({venueId, venueName, isVenueOwner = false}) => {
    const [items, setItems] = useState<IPyachokItem[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editItem, setEditItem] = useState<IPyachokItem | null>(null);
    const [joinItem, setJoinItem] = useState<IPyachokItem | null>(null);
    const [msgText, setMsgText] = useState('');
    const [msgSending, setMsgSending] = useState(false);
    const [msgSent, setMsgSent] = useState(false);
    const [msgError, setMsgError] = useState('');

    const currentUserId = (() => {
        try {
            return JSON.parse(localStorage.getItem('user') ?? '{}')?.id ?? '';
        } catch {
            return '';
        }
    })();

    const load = async () => {
        setLoading(true);
        try {
            const {data} = await pyachokService.getVenueList(venueId, {
                status: PyachokStatusEnum.OPEN, limit: 10,
            });
            setItems(data.items ?? data.data ?? []);
            setTotal(data.total ?? 0);
        } catch { /* ignore */
        }
        setLoading(false);
    };

    useEffect(() => {
        load();
    }, [venueId]);

    const handleOpenJoin = (item: IPyachokItem) => {
        setJoinItem(item);
        setMsgText('');
        setMsgSent(false);
        setMsgError('');
    };

    const handleSendMessage = async () => {
        if (!joinItem?.user?.id || !msgText.trim()) return;
        setMsgSending(true);
        setMsgError('');
        try {
            await messageService.send(joinItem.user.id, msgText.trim(), joinItem.id);
            setMsgSent(true);
            setMsgText('');
        } catch {
            setMsgError('Не вдалось відправити. Спробуй ще раз.');
        }
        setMsgSending(false);
    };

    const handleOwnerClose = async (id: string) => {
        await pyachokService.closeAny(id).catch(() => {
        });
        setItems(p => p.filter(i => i.id !== id));
        setTotal(t => t - 1);
    };

    const handleOwnerDelete = async (id: string) => {
        await pyachokService.deleteAny(id).catch(() => {
        });
        setItems(p => p.filter(i => i.id !== id));
        setTotal(t => t - 1);
    };

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
                    {[1, 2, 3].map(i => <div key={i} className={css.skeleton}/>)}
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
                    {items.map(item => {
                        const isOwn = item.user?.id === currentUserId;
                        return (
                            <article key={item.id} className={css.card}>
                                <div className={css.cardHeader}>
                                    <div className={css.userInfo}>
                                        {item.user?.image || item.user?.avatar
                                            ? <img src={item.user.image ?? item.user.avatar} alt=""
                                                   className={css.avatar}/>
                                            : <div
                                                className={css.avatarPlaceholder}>{item.user?.name?.[0]?.toUpperCase() ?? '?'}</div>
                                        }
                                        <div>
                                            <span className={css.userName}>{item.user?.name ?? 'Анонім'}</span>
                                            <span className={css.cardDate}>
                                                📅 {new Date(item.date).toLocaleDateString('uk-UA', {
                                                day: 'numeric',
                                                month: 'long'
                                            })} · 🕐 {item.time}
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                                        <span className={css.statusBadge}>🟢 Відкритий</span>
                                        {!isOwn && (
                                            <button className={css.joinBtn} onClick={() => handleOpenJoin(item)}>
                                                🤝 Приєднатись
                                            </button>
                                        )}
                                        {isOwn && (
                                            <>
                                                <span className={css.ownBadge}>Ваш запит</span>
                                                <button className={css.editOwnBtn} onClick={() => setEditItem(item)}>
                                                    ✏️
                                                </button>
                                            </>
                                        )}
                                        {isVenueOwner && !isOwn && (
                                            <>
                                                <button
                                                    className={css.ownerCloseBtn}
                                                    onClick={() => handleOwnerClose(item.id)}
                                                    title="Закрити запит"
                                                >✕ Закрити
                                                </button>
                                                <button
                                                    className={css.ownerDeleteBtn}
                                                    onClick={() => handleOwnerDelete(item.id)}
                                                    title="Видалити запит"
                                                >🗑
                                                </button>
                                            </>
                                        )}
                                    </div>
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
                        );
                    })}
                </div>
            )}

            {showModal && (
                <PyachokModal
                    venueId={venueId}
                    venueName={venueName}
                    onClose={() => {
                        setShowModal(false);
                        load();
                    }}
                />
            )}

            {editItem && (
                <PyachokModal
                    venueId={venueId}
                    venueName={venueName}
                    editItem={editItem}
                    onClose={() => {
                        setEditItem(null);
                        load();
                    }}
                />
            )}

            {joinItem && (
                <div className={css.modalOverlay} onClick={() => setJoinItem(null)}>
                    <div className={css.modalBox} onClick={e => e.stopPropagation()}>
                        <button className={css.modalClose} onClick={() => setJoinItem(null)}>✕</button>
                        <h3 className={css.modalTitle}>🤝 Приєднатись до компанії</h3>

                        <div className={css.modalUser}>
                            {joinItem.user?.image || joinItem.user?.avatar
                                ? <img src={joinItem.user.image ?? joinItem.user.avatar} alt=""
                                       className={css.modalAvatar}/>
                                : <div
                                    className={css.modalAvatarPlaceholder}>{joinItem.user?.name?.[0]?.toUpperCase() ?? '?'}</div>
                            }
                            <div>
                                <div className={css.modalUserName}>{joinItem.user?.name ?? 'Анонім'}</div>
                                <div className={css.modalUserSub}>організатор зустрічі</div>
                            </div>
                        </div>

                        <div className={css.modalDetails}>
                            <div className={css.modalRow}>
                                <span>📅 Дата</span>
                                <strong>{new Date(joinItem.date).toLocaleDateString('uk-UA', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                })}</strong>
                            </div>
                            <div className={css.modalRow}>
                                <span>🕐 Час</span>
                                <strong>{joinItem.time}</strong>
                            </div>
                            {joinItem.purpose && (
                                <div className={css.modalRow}>
                                    <span>🎯 Мета</span>
                                    <strong>{joinItem.purpose}</strong>
                                </div>
                            )}
                            {joinItem.peopleCount && (
                                <div className={css.modalRow}>
                                    <span>👥 Компанія</span>
                                    <strong>{joinItem.peopleCount} осіб</strong>
                                </div>
                            )}
                            {joinItem.expectedBudget && (
                                <div className={css.modalRow}>
                                    <span>💰 Бюджет</span>
                                    <strong>≈{joinItem.expectedBudget} ₴</strong>
                                </div>
                            )}
                        </div>

                        <div className={css.modalContactBlock}>
                            {!msgSent ? (
                                <>
                                    <label className={css.modalContactHint}>Напишіть організатору:</label>
                                    <textarea
                                        className={css.msgTextarea}
                                        placeholder="Привіт! Хочу приєднатись до твоєї компанії 🍺"
                                        value={msgText}
                                        onChange={e => setMsgText(e.target.value)}
                                        rows={3}
                                        maxLength={500}
                                    />
                                    <div className={css.msgMeta}>
                                        <span className={css.msgCounter}>{msgText.length}/500</span>
                                        {msgError && <span className={css.msgError}>{msgError}</span>}
                                    </div>
                                    <div className={css.msgActions}>
                                        <a href={`/users/${joinItem.user?.id}`} className={css.profileBtn}>
                                            👤 Профіль
                                        </a>
                                        <button
                                            className={css.emailBtn}
                                            onClick={handleSendMessage}
                                            disabled={!msgText.trim() || msgSending}
                                        >
                                            {msgSending ? '...' : '✉️ Надіслати'}
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className={css.msgSuccess}>
                                    <span>✅</span>
                                    <p>Повідомлення надіслано! Організатор побачить його у своїх вхідних.</p>
                                    <a href={`/users/${joinItem.user?.id}`} className={css.profileBtn}>
                                        👤 Переглянути профіль
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export {VenuePyachokList};