import {useNavigate} from 'react-router-dom';
import {IVenueListItem} from '../../../interfaces/IVenueSearchInterface';
import css from './TopVenueCard.module.css';

type Props = { venue: IVenueListItem; rank: number };

const TopVenueCard = ({venue, rank}: Props) => {
    const navigate = useNavigate();

    return (
        <article className={css.card} onClick={() => navigate(`/venues/${venue.id}`)}>
            <div className={css.rank}>
                <span className={rank <= 3 ? css.rankTopNum : css.rankNum}>{rank}</span>
            </div>

            <div className={css.imgWrap}>
                {venue.avatarVenue
                    ? <img src={venue.avatarVenue} alt={venue.name} className={css.img}/>
                    : <div className={css.imgPlaceholder}>🏆</div>
                }
            </div>

            <div className={css.info}>
                <h3 className={css.name}>{venue.name}</h3>
                {venue.city && <p className={css.city}>📍 {venue.city}</p>}
                {venue.description && <p className={css.desc}>{venue.description}</p>}

                <div className={css.meta}>
                    {venue.ratingAvg && (
                        <span className={css.rating}>⭐ {venue.ratingAvg.toFixed(1)}</span>
                    )}
                    {venue.averageCheck && (
                        <span className={css.check}>≈ {venue.averageCheck} ₴</span>
                    )}
                </div>
            </div>
        </article>
    );
};

export {TopVenueCard};
