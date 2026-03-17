import {FC, useEffect, useState} from 'react';
import {axiosInstance} from '../../../services/axiosInstance.service';
import {INewsItem, NewsTypeEnum} from '../../../interfaces/INewsInterface';
import css from './VenueNews.module.css';
import {urls} from "../../../constants/urls";

interface IProps {
    venueId: string;
    isOwner: boolean;
}

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
    general: {label: 'Новина', color: '#3b82f6'},
    promotion: {label: 'Акція', color: '#16a34a'},
    event: {label: 'Подія', color: '#9333ea'},
};

const CreateNewsForm: FC<{ venueId: string; onCreated: (item: INewsItem) => void }> = ({venueId, onCreated}) => {
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [type, setType] = useState<NewsTypeEnum>(NewsTypeEnum.GENERAL);
    const [avatar, setAvatar] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const reset = () => {
        setTitle('');
        setBody('');
        setType(NewsTypeEnum.GENERAL);
        setAvatar('');
        setError('');
    };

    const handleSubmit = async () => {
        if (!title.trim() || !body.trim()) {
            setError('Заповніть заголовок і текст');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const {data} = await axiosInstance.post(urls.newsVenue.base(venueId), {
                title: title.trim(), body: body.trim(), type,
                avatarNews: avatar.trim() || undefined,
            });
            onCreated(data);
            reset();
            setOpen(false);
        } catch (e: any) {
            setError(e?.response?.data?.message ?? 'Помилка');
        }
        setLoading(false);
    };

    if (!open) return (
        <button className={css.addBtn} onClick={() => setOpen(true)}>+ Додати новину</button>
    );

    return (
        <div className={css.form}>
            <h3 className={css.formTitle}>Нова публікація</h3>
            <div className={css.formField}>
                <label className={css.formLabel}>Тип</label>
                <div className={css.typeRow}>
                    {Object.entries(TYPE_LABELS).map(([val, {label, color}]) => (
                        <button key={val} className={`${css.typeBtn} ${type === val ? css.typeBtnActive : ''}`}
                                style={type === val ? {background: color, borderColor: color} : {}}
                                onClick={() => setType(val as NewsTypeEnum)}>
                            {label}
                        </button>
                    ))}
                </div>
            </div>
            <div className={css.formField}>
                <label className={css.formLabel}>Заголовок *</label>
                <input className={css.formInput} value={title} onChange={e => setTitle(e.target.value)}
                       placeholder="Заголовок новини..."/>
            </div>
            <div className={css.formField}>
                <label className={css.formLabel}>Текст *</label>
                <textarea className={css.formTextarea} rows={4} value={body} onChange={e => setBody(e.target.value)}
                          placeholder="Опис акції, події або новини..."/>
            </div>
            <div className={css.formField}>
                <label className={css.formLabel}>Фото (URL)</label>
                <input className={css.formInput} value={avatar} onChange={e => setAvatar(e.target.value)}
                       placeholder="https://..."/>
            </div>
            {error && <p className={css.formError}>{error}</p>}
            <div className={css.formActions}>
                <button className={css.cancelBtn} onClick={() => {
                    setOpen(false);
                    reset();
                }}>Скасувати
                </button>
                <button className={css.submitBtn} onClick={handleSubmit} disabled={loading}>
                    {loading ? '...' : 'Опублікувати'}
                </button>
            </div>
        </div>
    );
};

const VenueNews: FC<IProps> = ({venueId, isOwner}) => {
    const [items, setItems] = useState<INewsItem[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [offset, setOffset] = useState(0);
    const LIMIT = 5;

    const load = async (off = 0) => {
        setLoading(true);
        try {
            const endpoint = isOwner
                ? `${urls.newsVenue.base(venueId)}/manage`
                : urls.newsVenue.base(venueId);
            const {data} = await axiosInstance.get(endpoint, {params: {limit: LIMIT, offset: off}});
            const list = data?.data ?? data ?? [];
            if (off === 0) setItems(list);
            else setItems(p => [...p, ...list]);
            setTotal(data?.total ?? list.length);
            setOffset(off + list.length);
        } catch {
        }
        setLoading(false);
    };

    useEffect(() => {
        load(0);
    }, [venueId, isOwner]);

    const handleDelete = async (id: string) => {
        if (!window.confirm('Видалити новину?')) return;
        await axiosInstance.delete(urls.newsVenue.update(id)).catch(() => {
        });
        setItems(p => p.filter(n => n.id !== id));
        setTotal(t => t - 1);
    };

    const handleToggleActive = async (item: INewsItem) => {
        await axiosInstance.patch(`${urls.newsVenue.update(item.id)}/active`, {isActive: !item.isActive}).catch(() => {
        });
        setItems(p => p.map(n => n.id === item.id ? {...n, isActive: !n.isActive} : n));
    };

    const handleTogglePaid = async (item: INewsItem) => {
        await axiosInstance.patch(urls.newsVenue.setPaid(item.id), {isActive: !item.isPaid}).catch(() => {
        });
        setItems(p => p.map(n => n.id === item.id ? {...n, isPaid: !n.isPaid} : n));
    };

    if (!loading && items.length === 0 && !isOwner) return null;

    return (
        <section className={css.section}>
            <div className={css.header}>
                <h2 className={css.title}>📰 Новини & Акції {total > 0 &&
                    <span className={css.badge}>{total}</span>}</h2>
                {isOwner && <CreateNewsForm venueId={venueId} onCreated={item => {
                    setItems(p => [item, ...p]);
                    setTotal(t => t + 1);
                }}/>}
            </div>

            {loading && (
                <div className={css.skeletons}>{[1, 2].map(i => <div key={i} className={css.skeleton}/>)}</div>
            )}

            {!loading && items.length === 0 && isOwner && (
                <div className={css.empty}><p>Новин ще немає. Створіть першу!</p></div>
            )}

            <div className={css.list}>
                {items.map(item => {
                    const typeInfo = TYPE_LABELS[item.type] ?? TYPE_LABELS.general;
                    return (
                        <article key={item.id} className={`${css.card} ${!item.isActive ? css.cardInactive : ''}`}>
                            {item.avatarNews && (
                                <img src={item.avatarNews} alt={item.title} className={css.cardImg}/>
                            )}
                            <div className={css.cardBody}>
                                <div className={css.cardMeta}>
                                <span className={css.typeBadge}
                                      style={{background: typeInfo.color + '22', color: typeInfo.color}}>
                                {typeInfo.label}
                                </span>
                                    <span className={css.cardDate}>
                                    {new Date(item.created).toLocaleDateString('uk-UA', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric'
                                    })}
                                    </span>
                                    {!item.isActive && <span className={css.inactiveBadge}>Приховано</span>}
                                    {item.isPaid && (item.type === 'promotion' || item.type === 'event') &&
                                        <span className={css.paidBadge}>💳 Опубліковано</span>}
                                    {!item.isPaid && (item.type === 'promotion' || item.type === 'event') && isOwner &&
                                        <span className={css.unpaidBadge}>⏳ Не опубліковано в стрічці</span>}
                                </div>
                                <h3 className={css.cardTitle}>{item.title}</h3>
                                <p className={css.cardText}>{item.body.length > 200 ? item.body.slice(0, 200) + '...' : item.body}</p>
                                {isOwner && (
                                    <div className={css.ownerActions}>
                                        <button className={css.toggleBtn} onClick={() => handleToggleActive(item)}>
                                            {item.isActive ? '👁 Приховати' : '👁 Показати'}
                                        </button>
                                        {(item.type === 'promotion' || item.type === 'event') && (
                                            <button
                                                className={item.isPaid ? css.toggleBtn : css.paidBtn}
                                                onClick={() => handleTogglePaid(item)}
                                                title={item.isPaid ? 'Прибрати зі стрічки новин' : 'Опублікувати в загальній стрічці (платно)'}
                                            >
                                                {item.isPaid ? '📤 Зі стрічки' : '💳 Опублікувати'}
                                            </button>
                                        )}
                                        <button className={css.deleteBtn} onClick={() => handleDelete(item.id)}>🗑
                                            Видалити
                                        </button>
                                    </div>
                                )}
                            </div>
                        </article>
                    );
                })}
            </div>

            {items.length < total && !loading && (
                <button className={css.loadMore} onClick={() => load(offset)}>
                    Показати ще ({total - items.length})
                </button>
            )}
        </section>
    );
};

export {VenueNews};