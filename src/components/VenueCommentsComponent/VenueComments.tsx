import { FC, useEffect, useState } from 'react';
import css from './VenueComments.module.css';
import {CommentRecommendationEnum, IComment, ICreateCommentDto} from "../../interfaces/ICommentInterface";
import { commentService } from '../../services/comment.service';
import {useAppSelector} from "../../hooks/useReduxHooks";

interface IProps { venueId: string }

const LIMIT = 10;

const StarPicker: FC<{ value: number; onChange: (v: number) => void; disabled?: boolean }> = ({ value, onChange, disabled }) => {
    const [hover, setHover] = useState(0);
    return (
        <div className={css.starPicker}>
            {Array.from({ length: 5 }).map((_, i) => {
                const v = i + 1;
                return (
                    <span
                        key={v}
                        className={(hover || value) >= v ? css.starOn : css.starOff}
                        onMouseEnter={() => !disabled && setHover(v)}
                        onMouseLeave={() => setHover(0)}
                        onClick={() => !disabled && onChange(v)}
                    >★</span>
                );
            })}
        </div>
    );
};

const CommentCard: FC<{ comment: IComment; onDelete: (id: string) => void }> = ({ comment, onDelete }) => {
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        setDeleting(true);
        try { await commentService.delete(comment.id); onDelete(comment.id); }
        catch { setDeleting(false); }
    };

    const rec = comment.recommendation;

    return (
        <article className={css.commentCard}>
            <div className={css.commentHeader}>
                <div className={css.commentUser}>
                    {comment.user?.image
                        ? <img src={comment.user.image} alt="" className={css.userAvatar} />
                        : <div className={css.userAvatarPlaceholder}>{comment.user?.name?.[0]?.toUpperCase() ?? '?'}</div>
                    }
                    <div>
                        <span className={css.userName}>
                            {comment.user?.name ?? 'Анонім'}
                            {comment.isCritic && <span className={css.criticBadge}>🏅 Критик</span>}
                        </span>
                        <span className={css.commentDate}>
                            {new Date(comment.created).toLocaleDateString('uk-UA', { day:'numeric', month:'long', year:'numeric' })}
                        </span>
                    </div>
                </div>
                <div className={css.commentRating}>
                    {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className={i < comment.rating ? css.starOn : css.starOff}>★</span>
                    ))}
                </div>
            </div>

            <h4 className={css.commentTitle}>{comment.title}</h4>
            <p className={css.commentBody}>{comment.body}</p>

            {rec && (
                <span className={`${css.recBadge} ${rec === CommentRecommendationEnum.RECOMMEND ? css.recYes : css.recNo}`}>
                    {rec === CommentRecommendationEnum.RECOMMEND ? '👍 Рекомендую' : '👎 Не рекомендую'}
                </span>
            )}

            {comment.image_check && (
                <div className={css.checkImg}>
                    <span className={css.checkLabel}>📸 Фото чеку:</span>
                    <img src={comment.image_check} alt="чек" className={css.checkPhoto} />
                </div>
            )}

            {comment.isOwner && (
                <button className={css.deleteBtn} onClick={handleDelete} disabled={deleting}>
                    {deleting ? '...' : '🗑 Видалити'}
                </button>
            )}
        </article>
    );
};

const VenueComments: FC<IProps> = ({ venueId }) => {
    const { isAuth } = useAppSelector(state => state.auth);

    const [comments,    setComments]    = useState<IComment[]>([]);
    const [total,       setTotal]       = useState(0);
    const [offset,      setOffset]      = useState(0);
    const [loading,     setLoading]     = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [showForm,    setShowForm]    = useState(false);
    const [submitting,  setSubmitting]  = useState(false);
    const [formError,   setFormError]   = useState('');

    const [form, setForm] = useState<ICreateCommentDto>({ title: '', body: '', rating: 0 });
    const setF = (k: keyof ICreateCommentDto, v: any) => setForm(p => ({ ...p, [k]: v }));

    const fetchComments = async (reset = false) => {
        const off = reset ? 0 : offset;
        reset ? setLoading(true) : setLoadingMore(true);
        try {
            const { data } = await commentService.getList(venueId, { limit: LIMIT, offset: off });
            const list = data.data ?? [];
            setComments(reset ? list : prev => [...prev, ...list]);
            setTotal(data.total ?? 0);
            setOffset(off + list.length);
        } catch { /* ignore */ }
        reset ? setLoading(false) : setLoadingMore(false);
    };

    useEffect(() => { fetchComments(true); }, [venueId]);

    const handleSubmit = async () => {
        if (!form.title.trim()) { setFormError("Вкажіть заголовок"); return; }
        if (!form.body.trim())  { setFormError("Напишіть текст відгуку"); return; }
        if (!form.rating)       { setFormError("Поставте оцінку"); return; }
        setFormError('');
        setSubmitting(true);
        try {
            const { data } = await commentService.create(venueId, form);
            setComments(prev => [data, ...prev]);
            setTotal(t => t + 1);
            setForm({ title: '', body: '', rating: 0 });
            setShowForm(false);
        } catch (e: any) {
            setFormError(e?.response?.data?.message ?? 'Помилка при збереженні');
        }
        setSubmitting(false);
    };

    const handleDelete = (id: string) => {
        setComments(prev => prev.filter(c => c.id !== id));
        setTotal(t => t - 1);
    };

    const hasMore = offset < total;

    return (
        <section className={css.section}>
            <div className={css.sectionHeader}>
                <h2 className={css.sectionTitle}>Відгуки <span className={css.totalBadge}>{total}</span></h2>
                {isAuth && !showForm && (
                    <button className={css.writeBtn} onClick={() => setShowForm(true)}>
                        ✏️ Написати відгук
                    </button>
                )}
            </div>

            {showForm && (
                <div className={css.form}>
                    <h3 className={css.formTitle}>Ваш відгук</h3>

                    <div className={css.formField}>
                        <label className={css.formLabel}>Оцінка *</label>
                        <StarPicker value={form.rating} onChange={v => setF('rating', v)} />
                    </div>

                    <div className={css.formField}>
                        <label className={css.formLabel}>Заголовок *</label>
                        <input className={css.formInput} placeholder="Коротко про ваше враження"
                               value={form.title} onChange={e => setF('title', e.target.value)} />
                    </div>

                    <div className={css.formField}>
                        <label className={css.formLabel}>Відгук *</label>
                        <textarea className={css.formTextarea} rows={4}
                                  placeholder="Розкажіть детальніше про заклад..."
                                  value={form.body} onChange={e => setF('body', e.target.value)} />
                    </div>

                    <div className={css.formField}>
                        <label className={css.formLabel}>Рекомендація</label>
                        <div className={css.recRow}>
                            {[
                                { v: CommentRecommendationEnum.RECOMMEND,     l: '👍 Рекомендую' },
                                { v: CommentRecommendationEnum.NOT_RECOMMEND, l: '👎 Не рекомендую' },
                            ].map(({ v, l }) => (
                                <button key={v}
                                        className={`${css.recBtn} ${form.recommendation === v ? css.recBtnActive : ''}`}
                                        onClick={() => setF('recommendation', form.recommendation === v ? undefined : v)}>
                                    {l}
                                </button>
                            ))}
                        </div>
                    </div>

                    {formError && <p className={css.formError}>{formError}</p>}

                    <div className={css.formActions}>
                        <button className={css.cancelBtn} onClick={() => { setShowForm(false); setFormError(''); }}>
                            Скасувати
                        </button>
                        <button className={css.submitBtn} onClick={handleSubmit} disabled={submitting}>
                            {submitting ? <span className={css.spinner} /> : 'Опублікувати'}
                        </button>
                    </div>
                </div>
            )}

            {loading && (
                <div className={css.skeletons}>
                    {Array.from({ length: 3 }).map((_, i) => <div key={i} className={css.skeleton} />)}
                </div>
            )}

            {!loading && comments.length === 0 && (
                <div className={css.empty}>
                    <span>💬</span>
                    <p>Відгуків поки немає. Будьте першим!</p>
                </div>
            )}

            {!loading && comments.length > 0 && (
                <div className={css.list}>
                    {comments.map(c => (
                        <CommentCard key={c.id} comment={c} onDelete={handleDelete} />
                    ))}
                </div>
            )}

            {hasMore && !loading && (
                <div className={css.loadMoreWrap}>
                    <button className={css.loadMoreBtn} onClick={() => fetchComments(false)} disabled={loadingMore}>
                        {loadingMore ? <span className={css.spinner} /> : `Ще відгуки (${total - offset})`}
                    </button>
                </div>
            )}

            {!isAuth && !showForm && (
                <p className={css.loginHint}>
                    <a href="/login">Увійдіть</a>, щоб залишити відгук
                </p>
            )}
        </section>
    );
};

export { VenueComments };