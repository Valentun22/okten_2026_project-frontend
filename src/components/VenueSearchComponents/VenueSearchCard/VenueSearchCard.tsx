import {useNavigate} from 'react-router-dom';
import {IVenueListItem, VenueCategoryEnum} from '../../../interfaces/IVenueSearchInterface';
import css from './VenueSearchCard.module.css';

type Props = { venue: IVenueListItem };

const CATEGORY_LABELS: Partial<Record<VenueCategoryEnum, string>> = {
    restaurant: 'Ресторан', bar: 'Бар', cafe: 'Кафе', pub: 'Паб',
    club: 'Клуб', fast_food: 'Фастфуд', pizzeria: 'Піцерія',
    sushi: 'Суші', brewery: 'Пивоварня', lounge: 'Лаунж',
    steakhouse: 'Стейкхаус', bakery: 'Пекарня', coffee_shop: "Кав'ярня",
    wine_bar: 'Вайн-бар', food_court: 'Фудкорт', street_food: 'Стріт-фуд',
    karaoke: 'Караоке', hookah: 'Кальян',
};

const StarRating = ({value}: { value?: number }) => {
    if (!value) return null;
    const stars = Math.round(value / 2);
    return (
        <div className={css.stars}>
            {Array.from({length: 5}).map((_, i) => (
                <span key={i} className={i < stars ? css.starFilled : css.starEmpty}>★</span>
            ))}
            <span className={css.ratingVal}>{value.toFixed(1)}</span>
        </div>
    );
};

const VenueSearchCard = ({venue}: Props) => {
    const navigate = useNavigate();

    return (
        <article className={css.card} onClick={() => navigate(`/venues/${venue.id}`)}>
            <div className={css.imgWrap}>
                {venue.avatarVenue
                    ? <img src={venue.avatarVenue} alt={venue.name} className={css.img}/>
                    : <div className={css.imgPlaceholder}>🏠</div>
                }
                {venue.isLiked && <span className={css.likedBadge}>♥</span>}
            </div>

            <div className={css.body}>
                <div className={css.cats}>
                    {venue.categories?.slice(0, 2).map(c => (
                        <span key={c} className={css.cat}>{CATEGORY_LABELS[c] ?? c}</span>
                    ))}
                </div>

                <h3 className={css.name}>{venue.name}</h3>

                {venue.description && (
                    <p className={css.desc}>{venue.description}</p>
                )}

                <div className={css.footer}>
                    <div className={css.left}>
                        <StarRating value={venue.ratingAvg}/>
                        {venue.city && <span className={css.city}>📍 {venue.city}</span>}
                    </div>
                    {venue.averageCheck && (
                        <span className={css.check}>≈ {venue.averageCheck} ₴</span>
                    )}
                </div>

                {venue.tags && venue.tags.length > 0 && (
                    <div className={css.tags}>
                        {venue.tags.slice(0, 4).map(t => (
                            <span key={t} className={css.tag}>#{t}</span>
                        ))}
                    </div>
                )}
            </div>
        </article>
    );
};

export {VenueSearchCard};
