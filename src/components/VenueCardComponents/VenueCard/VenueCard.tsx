import {FC, useState} from 'react';
import {IVenueInterface} from '../../../interfaces/IVenueInterface';
import {venueService} from '../../../services/venue.service';
import {axiosInstance} from '../../../services/axiosInstance.service';
import {urls} from '../../../constants/urls';
import {PyachokModal} from '../../PyachokComponents/PyachokModal/PyachokModal';
import {VenuePyachokList} from '../../PyachokComponents/VenuePyachokList/VenuePyachokList';
import {ComplaintModal} from '../../PyachokComponents/ComplaintModal/ComplaintModal';
import {VenueNews} from '../VenueNews/VenueNews';
import {VenueAnalytics} from '../VenueAnalytics/VenueAnalytics';
import css from './VenueCard.module.css';
import {VenueComments} from "../../VenueCommentsComponent/VenueComments";
import {useNavigate} from "react-router-dom";

interface IProps {
    venueCard: IVenueInterface;
}

const DAYS_UK: Record<string, string> = {
    mon: 'Пн', tue: 'Вт', wed: 'Ср',
    thu: 'Чт', fri: 'Пт', sat: 'Сб', sun: 'Нд',
};

const FEATURES: { key: keyof IVenueInterface; label: string; icon: string }[] = [
    {key: 'hasWiFi', label: 'Wi-Fi', icon: '📶'},
    {key: 'hasParking', label: 'Паркінг', icon: '🅿️'},
    {key: 'liveMusic', label: 'Live-музика', icon: '🎵'},
    {key: 'petFriendly', label: 'Pet-friendly', icon: '🐾'},
    {key: 'hasTerrace', label: 'Тераса', icon: '☀️'},
    {key: 'smokingAllowed', label: 'Куріння', icon: '🚬'},
    {key: 'cardPayment', label: 'Картка', icon: '💳'},
];

const VenueCard: FC<IProps> = ({venueCard: vc}) => {
    const [showPyachok, setShowPyachok] = useState(false);
    const [showComplaint, setShowComplaint] = useState(false);

    const [isFav, setIsFav] = useState(!!(vc as any).isFavorite);
    const [favLoading, setFavLoading] = useState(false);
    const [isLiked, setIsLiked] = useState(!!(vc as any).isLiked);
    const [likeLoading, setLikeLoading] = useState(false);
    const [likeCount, setLikeCount] = useState<number>((vc as any).likesCount ?? 0);

    const [userRating, setUserRating] = useState<number | null>(null);
    const [ratingHover, setRatingHover] = useState<number | null>(null);
    const [ratingLoading, setRatingLoading] = useState(false);
    const [ratingDone, setRatingDone] = useState(false);

    const [contactMsg, setContactMsg] = useState('');
    const [contactSent, setContactSent] = useState(false);
    const [contactLoading, setContactLoading] = useState(false);

    const ratingAvg: number | undefined = (vc as any).ratingAvg;

    const userRaw = localStorage.getItem('user');
    const userId = userRaw ? JSON.parse(userRaw)?.id : null;
    const roles = (() => {
        try {
            const u = JSON.parse(userRaw ?? '{}');
            return ([] as string[]).concat(u.role ?? []).filter(Boolean);
        } catch {
            return [] as string[];
        }
    })();
    const isOwner = !!(userId && vc.user && (vc.user as any).id === userId)
        || roles.some((r: string) => r === 'superadmin');

    const handleFav = async () => {
        setFavLoading(true);
        try {
            if (isFav) {
                await axiosInstance.delete(urls.favorites.remove(vc.id));
                setIsFav(false);
            } else {
                await axiosInstance.post(urls.favorites.add(vc.id));
                setIsFav(true);
            }
        } catch {
        }
        setFavLoading(false);
    };

    const handleLike = async () => {
        setLikeLoading(true);
        try {
            if (isLiked) {
                await axiosInstance.delete(urls.likes.remove(vc.id));
                setIsLiked(false);
                setLikeCount(c => Math.max(0, c - 1));
            } else {
                await axiosInstance.post(urls.likes.add(vc.id));
                setIsLiked(true);
                setLikeCount(c => c + 1);
            }
        } catch {
        }
        setLikeLoading(false);
    };

    const handleRating = async (val: number) => {
        if (ratingLoading || ratingDone) return;
        setRatingLoading(true);
        setUserRating(val);
        try {
            await venueService.setRating(vc.id, val);
            setRatingDone(true);
        } catch {
            setUserRating(null);
        }
        setRatingLoading(false);
    };

    const handleContact = async () => {
        if (!contactMsg.trim()) return;
        setContactLoading(true);
        try {
            await venueService.contactManager(vc.id, contactMsg);
        } catch {
        }
        setContactSent(true);
        setContactLoading(false);
    };

    const photos = [vc.avatarVenue, ...(vc.image ?? [])].filter(Boolean) as string[];
    const navigate = useNavigate();

    return (
        <div className={css.page}>

            <div className={css.hero}>
                {photos.length > 0
                    ? <img src={photos[0]} alt={vc.name} className={css.heroImg}/>
                    : <div className={css.heroPlaceholder}>🏠</div>
                }
                <div className={css.heroOverlay}>
                    <div className={css.heroContent}>
                        <h1 className={css.heroTitle}>{vc.name}</h1>
                        <div className={css.heroMeta}>
                            {vc.city &&
                                <span className={css.heroCity}>📍 {vc.city}{vc.address ? `, ${vc.address}` : ''}</span>}
                            {ratingAvg && <span className={css.heroRating}>⭐ {Number(ratingAvg).toFixed(1)}</span>}
                            {vc.averageCheck && <span className={css.heroCheck}>≈ {vc.averageCheck} ₴</span>}
                            {isOwner && <span className={css.ownerBadge}>👑 Ви власник</span>}
                        </div>
                    </div>
                </div>
                <div className={css.heroActions}>
                    <button className={`${css.likeBtn} ${isLiked ? css.likeBtnActive : ''}`}
                            onClick={handleLike} disabled={likeLoading}
                            title={isLiked ? 'Прибрати лайк' : 'Подобається'}>
                        👍 {likeCount > 0 ? likeCount : ''}
                    </button>
                    <button className={`${css.favBtn} ${isFav ? css.favActive : ''}`}
                            onClick={handleFav} disabled={favLoading}
                            title={isFav ? 'Видалити з улюблених' : 'Додати в улюблені'}>
                        {isFav ? '♥' : '♡'}
                    </button>
                    <button className={css.pyachokBtn} onClick={() => setShowPyachok(true)}>
                        🍺 Пиячок
                    </button>
                    {isOwner && (
                        <a href={`/venues/${vc.id}/edit`} className={css.editBtn}>
                            ✏️ Редагувати
                        </a>
                    )}
                    <button className={css.complaintBtn} onClick={() => setShowComplaint(true)} title="Поскаржитися">
                        ⚠️
                    </button>
                </div>
            </div>

            <div className={css.body}>

                <div className={css.left}>
                    {vc.description && (
                        <section className={css.section}>
                            <h2 className={css.sectionTitle}>Про заклад</h2>
                            <p className={css.desc}>{vc.description}</p>
                        </section>
                    )}

                    {vc.categories && vc.categories.length > 0 && (
                        <section className={css.section}>
                            <h2 className={css.sectionTitle}>Категорії</h2>
                            <div className={css.chips}>
                                {vc.categories.map((c: any) => (
                                    <span key={c?.id ?? c} className={css.chip}>{c?.name ?? c}</span>
                                ))}
                            </div>
                        </section>
                    )}

                    {vc.tags && vc.tags.length > 0 && (
                        <section className={css.section}>
                            <h2 className={css.sectionTitle}>Теги</h2>
                            <div className={css.chips}>
                                {vc.tags.map((t: any) => (
                                    <span key={t?.id ?? t}
                                          className={`${css.chip} ${css.tagChip} ${css.tagClickable}`}
                                          title="Знайти заклади з цим тегом"
                                          onClick={() => navigate(`/searchVenue?tag=${encodeURIComponent(t?.name ?? t)}`)}>
                                        #{t?.name ?? t}
                                    </span>
                                ))}
                            </div>
                        </section>
                    )}

                    <section className={css.section}>
                        <h2 className={css.sectionTitle}>Особливості</h2>
                        <div className={css.features}>
                            {FEATURES.map(({key, label, icon}) => (
                                <div key={key} className={`${css.feature} ${vc[key] ? css.featureOn : css.featureOff}`}>
                                    <span className={css.featureIcon}>{icon}</span>
                                    <span>{label}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className={css.section}>
                        <h2 className={css.sectionTitle}>Рейтинг закладу</h2>
                        {ratingAvg && (
                            <div className={css.stars}>
                                {Array.from({length: 5}).map((_, i) => (
                                    <span key={i}
                                          className={i < Math.round(ratingAvg / 2) ? css.starOn : css.starOff}>★</span>
                                ))}
                                <span className={css.ratingVal}>{Number(ratingAvg).toFixed(1)} / 10</span>
                                {(vc as any).ratingCount && (
                                    <span className={css.ratingCount}>({(vc as any).ratingCount} оцінок)</span>
                                )}
                            </div>
                        )}
                        <div className={css.ratingForm}>
                            <p className={css.ratingFormLabel}>
                                {ratingDone ? '✅ Дякуємо за оцінку!' : 'Поставте свою оцінку (1–10):'}
                            </p>
                            {!ratingDone && (
                                <div className={css.ratingStars}>
                                    {Array.from({length: 10}).map((_, i) => {
                                        const val = i + 1;
                                        const active = (ratingHover ?? userRating ?? 0) >= val;
                                        return (
                                            <span key={val}
                                                  className={active ? css.rStarOn : css.rStarOff}
                                                  onMouseEnter={() => setRatingHover(val)}
                                                  onMouseLeave={() => setRatingHover(null)}
                                                  onClick={() => handleRating(val)}>★</span>
                                        );
                                    })}
                                    {ratingHover && <span className={css.ratingNum}>{ratingHover}</span>}
                                </div>
                            )}
                        </div>
                    </section>

                    <VenueNews venueId={vc.id} isOwner={isOwner}/>

                    {isOwner && <VenueAnalytics venueId={vc.id}/>}

                    <VenuePyachokList venueId={vc.id} venueName={vc.name}/>

                    <VenueComments venueId={vc.id}/>
                </div>

                <div className={css.right}>
                    {vc.workingHours && Object.keys(vc.workingHours).length > 0 && (
                        <section className={css.card}>
                            <h3 className={css.cardTitle}>🕐 Графік роботи</h3>
                            <table className={css.hoursTable}>
                                <tbody>
                                {(Object.entries(vc.workingHours) as [string, string][]).map(([day, hours]) => (
                                    <tr key={day}>
                                        <td className={css.dayCell}>{DAYS_UK[day] ?? day}</td>
                                        <td className={css.hoursCell}>{hours ?? '—'}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </section>
                    )}

                    <section className={css.card}>
                        <h3 className={css.cardTitle}>📞 Контакти</h3>
                        <div className={css.contacts}>
                            {vc.phone && <a href={`tel:${vc.phone}`} className={css.contactLink}>📱 {vc.phone}</a>}
                            {vc.email && <a href={`mailto:${vc.email}`} className={css.contactLink}>✉️ {vc.email}</a>}
                            {vc.website &&
                                <a href={vc.website} target="_blank" rel="noreferrer" className={css.contactLink}>🌐
                                    Сайт</a>}
                            {vc.socials?.instagram && <a href={vc.socials.instagram} target="_blank" rel="noreferrer"
                                                         className={css.contactLink}>📸 Instagram</a>}
                            {vc.socials?.facebook && <a href={vc.socials.facebook} target="_blank" rel="noreferrer"
                                                        className={css.contactLink}>👥 Facebook</a>}
                            {vc.socials?.telegram && <a href={vc.socials.telegram} target="_blank" rel="noreferrer"
                                                        className={css.contactLink}>✈️ Telegram</a>}
                            {vc.city && vc.address && (
                                <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${vc.name} ${vc.city} ${vc.address}`)}`}
                                   target="_blank" rel="noreferrer"
                                   className={`${css.contactLink} ${css.mapLink}`}>
                                    🗺 Маршрут до закладу
                                </a>
                            )}
                        </div>
                    </section>

                    <section className={css.card}>
                        <h3 className={css.cardTitle}>💬 Написати менеджеру</h3>
                        {contactSent ? (
                            <p className={css.contactSuccess}>✅ Повідомлення надіслано!</p>
                        ) : (
                            <>
                                <textarea className={css.contactTextarea} rows={4}
                                          placeholder="Ваше запитання або пропозиція..."
                                          value={contactMsg} onChange={e => setContactMsg(e.target.value)}/>
                                <button className={css.contactSubmit}
                                        onClick={handleContact}
                                        disabled={contactLoading || !contactMsg.trim()}>
                                    {contactLoading ? '...' : 'Надіслати'}
                                </button>
                            </>
                        )}
                    </section>

                    {vc.averageCheck && (
                        <section className={css.card}>
                            <h3 className={css.cardTitle}>💰 Середній чек</h3>
                            <p className={css.checkVal}>≈ {vc.averageCheck} ₴</p>
                        </section>
                    )}

                    {vc.menu && (
                        <section className={css.card}>
                            <h3 className={css.cardTitle}>📋 Меню</h3>
                            <a href={vc.menu} target="_blank" rel="noreferrer" className={css.menuLink}>
                                Переглянути меню →
                            </a>
                        </section>
                    )}

                    {vc.user && (
                        <section className={css.card}>
                            <h3 className={css.cardTitle}>👤 Власник</h3>
                            <a href={`/users/${(vc.user as any).id}`} className={css.ownerLink}>
                                {(vc.user as any).avatar
                                    ? <img src={(vc.user as any).avatar} alt="" className={css.ownerAvatar}/>
                                    : <div
                                        className={css.ownerAvatarPlaceholder}>{vc.user.name?.[0]?.toUpperCase() ?? '?'}</div>
                                }
                                <span className={css.ownerName}>{vc.user.name ?? 'Власник'}</span>
                            </a>
                        </section>
                    )}
                </div>
            </div>

            {showPyachok && (
                <PyachokModal venueId={vc.id} venueName={vc.name} onClose={() => setShowPyachok(false)}/>
            )}
            {showComplaint && (
                <ComplaintModal venueId={vc.id} venueName={vc.name} onClose={() => setShowComplaint(false)}/>
            )}
        </div>
    );
};

export {VenueCard};