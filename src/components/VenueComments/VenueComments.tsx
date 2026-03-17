import {FC, useEffect, useState} from 'react';
import css from './VenueComments.module.css';
import {CommentRecommendationEnum, IComment, ICreateCommentDto} from "../../interfaces/ICommentInterface";
import {commentService} from '../../services/comment.service';
import {useAppSelector} from "../../hooks/useReduxHooks";
import {axiosInstance} from "../../services/axiosInstance.service";
import {urls} from "../../constants/urls";

interface IProps {
    venueId: string
}

const LIMIT = 10;

const StarPicker: FC<{ value: number; onChange: (v: number) => void; disabled?: boolean }> = ({
                                                                                                  value,
                                                                                                  onChange,
                                                                                                  disabled
                                                                                              }) => {
    const [hover, setHover] = useState(0);
    return (
        <div className={css.starPicker}>
            {Array.from({length: 5}).map((_, i) => {
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

const CommentCard: FC<{
    comment: IComment;
    onDelete: (id: string) => void;
    onUpdate: (updated: IComment) => void;
    onImgClick: (src: string) => void;
}> = ({comment, onDelete, onUpdate, onImgClick}) => {
    const [deleting, setDeleting] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editTitle, setEditTitle] = useState(comment.title);
    const [editBody, setEditBody] = useState(comment.body);
    const [editRating, setEditRating] = useState(comment.rating);
    const [saving, setSaving] = useState(false);

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await commentService.delete(comment.id);
            onDelete(comment.id);
        } catch {
            setDeleting(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const {data} = await commentService.update(comment.id, {
                title: editTitle, body: editBody, rating: editRating,
            });
            onUpdate(data);
            setEditMode(false);
        } catch { /* ignore */
        }
        setSaving(false);
    };

    const rec = comment.recommendation;

    if (editMode) return (
        <article className={`${css.commentCard} ${css.commentCardEditing}`}>
            <div className={css.editCommentForm}>
                <StarPicker value={editRating} onChange={setEditRating}/>
                <input className={css.editCommentInput} value={editTitle}
                       onChange={e => setEditTitle(e.target.value)} placeholder="Заголовок"/>
                <textarea className={css.editCommentTextarea} rows={3} value={editBody}
                          onChange={e => setEditBody(e.target.value)} placeholder="Текст відгуку"/>
                <div className={css.editCommentActions}>
                    <button className={css.editCommentCancel} onClick={() => setEditMode(false)}>Скасувати</button>
                    <button className={css.editCommentSave} onClick={handleSave} disabled={saving}>
                        {saving ? '...' : 'Зберегти'}
                    </button>
                </div>
            </div>
        </article>
    );

    return (
        <article className={css.commentCard}>
            <div className={css.commentHeader}>
                <div className={css.commentUser}>
                    {comment.user?.image
                        ? <img src={comment.user.image} alt="" className={css.userAvatar}/>
                        :
                        <div className={css.userAvatarPlaceholder}>{comment.user?.name?.[0]?.toUpperCase() ?? '?'}</div>
                    }
                    <div>
                        <span className={css.userName}>
                            {comment.user?.name ?? 'Анонім'}
                            {comment.isCritic && <span className={css.criticBadge}>🏅 Критик</span>}
                        </span>
                        <span className={css.commentDate}>
                            {new Date(comment.created).toLocaleDateString('uk-UA', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                            })}
                        </span>
                    </div>
                </div>
                <div className={css.commentRating}>
                    {Array.from({length: 5}).map((_, i) => (
                        <span key={i} className={i < comment.rating ? css.starOn : css.starOff}>★</span>
                    ))}
                </div>
            </div>

            <h4 className={css.commentTitle}>{comment.title}</h4>
            <p className={css.commentBody}>{comment.body}</p>

            {rec && (
                <span
                    className={`${css.recBadge} ${rec === CommentRecommendationEnum.RECOMMEND ? css.recYes : css.recNo}`}>
                    {rec === CommentRecommendationEnum.RECOMMEND ? '👍 Рекомендую' : '👎 Не рекомендую'}
                </span>
            )}

            {comment.image_check && (
                <div className={css.checkImg}>
                    <span className={css.checkLabel}>📸 Фото чеку:</span>
                    <img
                        src={comment.image_check}
                        alt="чек"
                        className={css.checkPhoto}
                        onClick={() => onImgClick(comment.image_check!)}
                        style={{cursor: 'zoom-in'}}
                    />
                </div>
            )}

            {comment.isOwner && (
                <div className={css.ownerActions}>
                    <button className={css.editCommentBtn} onClick={() => setEditMode(true)}>✏️ Редагувати</button>
                    <button className={css.deleteBtn} onClick={handleDelete} disabled={deleting}>
                        {deleting ? '...' : '🗑 Видалити'}
                    </button>
                </div>
            )}
        </article>
    );
};

const VenueComments: FC<IProps> = ({venueId}) => {
    const {isAuth, user} = useAppSelector(state => state.auth);
    const isCritic = user?.isCritic ?? false;

    const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
    const [comments, setComments] = useState<IComment[]>([]);
    const [total, setTotal] = useState(0);
    const [offset, setOffset] = useState(0);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState('');

    const [form, setForm] = useState<ICreateCommentDto>({title: '', body: '', rating: 0});
    const setF = (k: keyof ICreateCommentDto, v: any) => setForm(p => ({...p, [k]: v}));

    const [checkFile, setCheckFile] = useState<File | null>(null);
    const [checkPreview, setCheckPreview] = useState('');
    const [checkUploading, setCheckUploading] = useState(false);

    const handleCheckFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setCheckFile(file);
        setCheckPreview(URL.createObjectURL(file));
        setF('image_check', ''); // буде замінено після upload
    };

    const uploadCheckFile = async (): Promise<string | undefined> => {
        if (!checkFile) return undefined;
        setCheckUploading(true);
        try {
            const fd = new FormData();
            fd.append('file', checkFile);
            const {data} = await axiosInstance.post(urls.comments.uploadCheck, fd, {
                headers: {'Content-Type': 'multipart/form-data'},
            });
            return data?.url ?? data?.key ?? data;
        } catch {
            return undefined;
        } finally {
            setCheckUploading(false);
        }
    };

    const fetchComments = async (reset = false) => {
        const off = reset ? 0 : offset;
        reset ? setLoading(true) : setLoadingMore(true);
        try {
            const {data} = await commentService.getList(venueId, {limit: LIMIT, offset: off});
            const list = data.data ?? [];
            setComments(reset ? list : prev => [...prev, ...list]);
            setTotal(data.total ?? 0);
            setOffset(off + list.length);
        } catch {
        }
        reset ? setLoading(false) : setLoadingMore(false);
    };

    useEffect(() => {
        fetchComments(true);
    }, [venueId]);

    const handleSubmit = async () => {
        if (!form.title.trim()) {
            setFormError("Вкажіть заголовок");
            return;
        }
        if (!form.body.trim()) {
            setFormError("Напишіть текст відгуку");
            return;
        }
        if (!form.rating) {
            setFormError("Поставте оцінку");
            return;
        }
        setFormError('');
        setSubmitting(true);
        try {
            let checkUrl = form.image_check;
            if (checkFile) {
                const uploaded = await uploadCheckFile();
                if (uploaded) checkUrl = uploaded;
            }
            const payload: ICreateCommentDto = {
                title: form.title,
                body: form.body,
                rating: form.rating,
                image_check: checkUrl || undefined
            };
            if (form.recommendation) payload.recommendation = form.recommendation;
            const {data} = await commentService.create(venueId, payload);
            setComments(prev => [data, ...prev]);
            setTotal(t => t + 1);
            setForm({title: '', body: '', rating: 0});
            setCheckFile(null);
            setCheckPreview('');
            setShowForm(false);
        } catch (e: any) {
            const msg = e?.response?.data?.message;
            setFormError(Array.isArray(msg) ? msg.join(', ') : (msg ?? `Помилка при збереженні (${e?.response?.status})`));
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
                        <StarPicker value={form.rating} onChange={v => setF('rating', v)}/>
                    </div>

                    <div className={css.formField}>
                        <label className={css.formLabel}>Заголовок *</label>
                        <input className={css.formInput} placeholder="Коротко про ваше враження"
                               value={form.title} onChange={e => setF('title', e.target.value)}/>
                    </div>

                    <div className={css.formField}>
                        <label className={css.formLabel}>Відгук *</label>
                        <textarea className={css.formTextarea} rows={4}
                                  placeholder="Розкажіть детальніше про заклад..."
                                  value={form.body} onChange={e => setF('body', e.target.value)}/>
                    </div>

                    {isCritic && (
                        <div className={css.formField}>
                            <label className={css.formLabel}>Рекомендація</label>
                            <div className={css.recRow}>
                                {[
                                    {v: CommentRecommendationEnum.RECOMMEND, l: '👍 Рекомендую'},
                                    {v: CommentRecommendationEnum.NOT_RECOMMEND, l: '👎 Не рекомендую'},
                                ].map(({v, l}) => (
                                    <button key={v}
                                            className={`${css.recBtn} ${form.recommendation === v ? css.recBtnActive : ''}`}
                                            onClick={() => setF('recommendation', form.recommendation === v ? undefined : v)}>
                                        {l}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {formError && <p className={css.formError}>{formError}</p>}

                    <div className={css.formField}>
                        <label className={css.formLabel}>Фото чека (необов'язково)</label>
                        <div className={css.checkUploadArea}>
                            {checkPreview ? (
                                <div className={css.checkPreviewWrap}>
                                    <img src={checkPreview} alt="чек" className={css.checkPreviewImg}/>
                                    <button className={css.checkRemoveBtn}
                                            onClick={() => {
                                                setCheckFile(null);
                                                setCheckPreview('');
                                                setF('image_check', undefined);
                                            }}>
                                        ✕ Видалити
                                    </button>
                                </div>
                            ) : (
                                <label className={css.checkUploadLabel}>
                                    <input type="file" accept="image/*" className={css.checkFileInput}
                                           onChange={handleCheckFile}/>
                                    <span className={css.checkUploadIcon}>📸</span>
                                    <span>Завантажити фото чека</span>
                                    <span className={css.checkUploadHint}>JPG, PNG до 5 МБ</span>
                                </label>
                            )}
                        </div>
                        {!checkPreview && (
                            <input className={css.formInput} style={{marginTop: '8px'}}
                                   placeholder="Або вставте URL фото..."
                                   value={form.image_check ?? ''}
                                   onChange={e => setF('image_check', e.target.value || undefined)}/>
                        )}
                    </div>

                    <div className={css.formActions}>
                        <button className={css.cancelBtn} onClick={() => {
                            setShowForm(false);
                            setFormError('');
                        }}>
                            Скасувати
                        </button>
                        <button className={css.submitBtn} onClick={handleSubmit}
                                disabled={submitting || checkUploading}>
                            {checkUploading ? '📤 Завантаження...' : submitting ?
                                <span className={css.spinner}/> : 'Опублікувати'}
                        </button>
                    </div>
                </div>
            )}

            {loading && (
                <div className={css.skeletons}>
                    {Array.from({length: 3}).map((_, i) => <div key={i} className={css.skeleton}/>)}
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
                        <CommentCard key={c.id} comment={c} onDelete={handleDelete}
                                     onUpdate={updated => setComments(p => p.map(x => x.id === updated.id ? updated : x))}
                                     onImgClick={setLightboxSrc}/>
                    ))}
                </div>
            )}

            {hasMore && !loading && (
                <div className={css.loadMoreWrap}>
                    <button className={css.loadMoreBtn} onClick={() => fetchComments(false)} disabled={loadingMore}>
                        {loadingMore ? <span className={css.spinner}/> : `Ще відгуки (${total - offset})`}
                    </button>
                </div>
            )}

            {!isAuth && !showForm && (
                <p className={css.loginHint}>
                    <a href="/login">Увійдіть</a>, щоб залишити відгук
                </p>
            )}

            {lightboxSrc && (
                <div
                    onClick={() => setLightboxSrc(null)}
                    style={{
                        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        zIndex: 9999, cursor: 'zoom-out',
                    }}
                >
                    <img
                        src={lightboxSrc}
                        alt="фото чеку"
                        style={{
                            maxWidth: '90vw', maxHeight: '90vh',
                            borderRadius: 12, boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
                            objectFit: 'contain',
                        }}
                        onClick={e => e.stopPropagation()}
                    />
                    <button
                        onClick={() => setLightboxSrc(null)}
                        style={{
                            position: 'absolute', top: 20, right: 24,
                            background: 'rgba(255,255,255,0.15)', border: 'none',
                            color: '#fff', fontSize: 28, cursor: 'pointer',
                            width: 44, height: 44, borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            lineHeight: 1,
                        }}
                    >✕
                    </button>
                </div>
            )}
        </section>
    );
};

export {VenueComments};