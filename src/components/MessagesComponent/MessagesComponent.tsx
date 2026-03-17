import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useAppSelector} from '../../hooks/useReduxHooks';
import {messageService} from '../../services/massage.service';
import {IMessage} from '../../interfaces/IMessageInterface';
import css from './MessagesComponent.module.css';

type Tab = 'inbox' | 'sent';

const MessagesComponent = () => {
    const navigate = useNavigate();
    const {isAuth} = useAppSelector(s => s.auth);
    const [tab, setTab] = useState<Tab>('inbox');
    const [items, setItems] = useState<IMessage[]>([]);
    const [total, setTotal] = useState(0);
    const [unread, setUnread] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuth) navigate('/login');
    }, [isAuth, navigate]);

    const load = async (t: Tab) => {
        setLoading(true);
        try {
            const {data} = t === 'inbox'
                ? await messageService.getInbox(50)
                : await messageService.getSent(50);
            setItems(data.data ?? []);
            setTotal(data.total ?? 0);
            setUnread(data.unread ?? 0);
        } catch {
        }
        setLoading(false);
    };

    useEffect(() => {
        load(tab);
    }, [tab]);

    const handleMarkRead = async (msg: IMessage) => {
        if (tab !== 'inbox' || msg.isRead) return;
        await messageService.markRead(msg.id).catch(() => {
        });
        setItems(p => p.map(m => m.id === msg.id ? {...m, isRead: true} : m));
        setUnread(u => Math.max(0, u - 1));
    };

    const handleMarkAllRead = async () => {
        await messageService.markAllRead().catch(() => {
        });
        setItems(p => p.map(m => ({...m, isRead: true})));
        setUnread(0);
    };

    const handleDelete = async (id: string) => {
        await messageService.delete(id).catch(() => {
        });
        setItems(p => p.filter(m => m.id !== id));
        setTotal(t => t - 1);
    };

    const formatDate = (d: string) =>
        new Date(d).toLocaleString('uk-UA', {day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'});

    return (
        <div className={css.wrap}>
            <div className={css.header}>
                <h1 className={css.title}>
                    ✉️ Повідомлення
                    {unread > 0 && <span className={css.unreadBadge}>{unread}</span>}
                </h1>
                <button className={css.backBtn} onClick={() => navigate(-1)}>← Назад</button>
            </div>

            <div className={css.tabs}>
                {(['inbox', 'sent'] as Tab[]).map(t => (
                    <button
                        key={t}
                        className={`${css.tab} ${tab === t ? css.tabActive : ''}`}
                        onClick={() => setTab(t)}
                    >
                        {t === 'inbox' ? `📥 Вхідні${unread > 0 ? ` (${unread})` : ''}` : '📤 Надіслані'}
                    </button>
                ))}
                {tab === 'inbox' && unread > 0 && (
                    <button className={css.markAllBtn} onClick={handleMarkAllRead}>
                        ✓ Всі прочитані
                    </button>
                )}
            </div>

            {loading && <div className={css.loading}>Завантаження...</div>}

            {!loading && items.length === 0 && (
                <div className={css.empty}>
                    <div className={css.emptyIcon}>{tab === 'inbox' ? '📭' : '📤'}</div>
                    <p>{tab === 'inbox' ? 'Вхідних повідомлень немає' : 'Надісланих повідомлень немає'}</p>
                </div>
            )}

            <div className={css.list}>
                {items.map(msg => {
                    const other = tab === 'inbox' ? msg.sender : msg.recipient;
                    const isUnread = tab === 'inbox' && !msg.isRead;
                    return (
                        <div
                            key={msg.id}
                            className={`${css.card} ${isUnread ? css.cardUnread : ''}`}
                            onClick={() => handleMarkRead(msg)}
                        >
                            {/* Avatar */}
                            <div onClick={e => {
                                e.stopPropagation();
                                if (other?.id) navigate(`/users/${other.id}`);
                            }}>
                                {other?.image
                                    ? <img src={other.image} alt="" className={css.avatar}/>
                                    : <div className={css.avatarPlaceholder}>
                                        {other?.name?.[0]?.toUpperCase() ?? '?'}
                                    </div>
                                }
                            </div>

                            <div className={css.cardBody}>
                                <div className={css.cardTop}>
                                    <span
                                        className={css.userName}
                                        onClick={e => {
                                            e.stopPropagation();
                                            if (other?.id) navigate(`/users/${other.id}`);
                                        }}
                                    >
                                        {other?.name ?? 'Користувач'}
                                        {isUnread && <span className={css.unreadDot}/>}
                                    </span>
                                    <span className={css.date}>{formatDate(msg.created)}</span>
                                </div>

                                {msg.pyachok && (
                                    <div className={css.pyachokRef}>
                                        🍺 {msg.pyachok.venue?.name ?? 'Заклад'}
                                        {` · ${new Date(msg.pyachok.date).toLocaleDateString('uk-UA', {
                                            day: 'numeric',
                                            month: 'short'
                                        })} ${msg.pyachok.time}`}
                                        {msg.pyachok.purpose && ` · ${msg.pyachok.purpose}`}
                                    </div>
                                )}

                                <p className={css.text}>{msg.text}</p>
                            </div>

                            <button
                                className={css.deleteBtn}
                                onClick={e => {
                                    e.stopPropagation();
                                    handleDelete(msg.id);
                                }}
                                title="Видалити"
                            >✕
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export {MessagesComponent};