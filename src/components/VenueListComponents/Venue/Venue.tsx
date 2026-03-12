import {FC} from 'react';
import {useNavigate} from 'react-router-dom';
import {IVenueInterface} from '../../../interfaces/IVenueInterface';
import css from './Venue.module.css';

interface IProps {
    venue: IVenueInterface
}

const CATEGORY_LABELS: Record<string, string> = {
    restaurant: 'Ресторан', bar: 'Бар', cafe: 'Кафе', pub: 'Паб',
    club: 'Клуб', fast_food: 'Фастфуд', pizzeria: 'Піцерія', sushi: 'Суші',
    brewery: 'Пивоварня', lounge: 'Лаунж', steakhouse: 'Стейкхаус',
    bakery: 'Пекарня', coffee_shop: "Кав'ярня", wine_bar: 'Вайн-бар',
    food_court: 'Фудкорт', street_food: 'Стріт-фуд', karaoke: 'Караоке', hookah: 'Кальян',
};

const Venue: FC<IProps> = ({venue}) => {
    const {id, name, avatarVenue, city, averageCheck, description} = venue;
    const navigate = useNavigate();
    const rating = (venue as any).ratingAvg;
    const cats = (venue as any).categories as string[] | undefined;

    return (
        <article className={css.card} onClick={() => navigate(`/venues/${id}`)}>
            <div className={css.imgWrap}>
                {avatarVenue
                    ? <img src={avatarVenue} alt={name} className={css.img}/>
                    : <div className={css.imgPlaceholder}>🏠</div>
                }
                {rating && (
                    <span className={css.ratingBadge}>⭐ {Number(rating).toFixed(1)}</span>
                )}
            </div>

            <div className={css.body}>
                {cats && cats.length > 0 && (
                    <div className={css.cats}>
                        {cats.slice(0, 2).map((c: any) => (
                            <span key={c?.id ?? c} className={css.cat}>
                                {CATEGORY_LABELS[c?.name ?? c] ?? (c?.name ?? c)}
                            </span>
                        ))}
                    </div>
                )}

                <h3 className={css.name}>{name}</h3>
                {description && <p className={css.desc}>{description}</p>}

                <div className={css.footer}>
                    {city && <span className={css.city}>📍 {city}</span>}
                    {averageCheck && <span className={css.check}>≈ {averageCheck} ₴</span>}
                </div>
            </div>
        </article>
    );
};

export {Venue};