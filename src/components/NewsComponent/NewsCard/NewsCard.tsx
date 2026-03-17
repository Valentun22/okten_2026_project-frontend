import {useNavigate} from 'react-router-dom';
import {INewsItem, NewsTypeEnum} from '../../../interfaces/INewsInterface';
import css from './NewsCard.module.css';

type Props = { news: INewsItem };

const TYPE_LABELS: Record<NewsTypeEnum, string> = {
    [NewsTypeEnum.GENERAL]: 'Загальне',
    [NewsTypeEnum.PROMOTION]: 'Акція',
    [NewsTypeEnum.EVENT]: 'Подія',
};

const formatDate = (iso: string): string =>
    new Date(iso).toLocaleDateString('uk-UA', {day: 'numeric', month: 'long', year: 'numeric'});

const NewsCard = ({news}: Props) => {
    const imgSrc = news.avatarNews ?? news.images?.[0] ?? null;
    const navigate = useNavigate();

    return (
        <article className={css.card} onClick={() => navigate(`/venues/${news.venue.id}`)}
                 style={{cursor: 'pointer'}}>
            <div className={css.imgWrap}>
                {imgSrc ? (
                    <img src={imgSrc} alt={news.title} className={css.img}/>
                ) : (
                    <div className={css.imgPlaceholder}>
                        <span>📰</span>
                    </div>
                )}
                <span className={`${css.badge} ${css[news.type]}`}>
                    {TYPE_LABELS[news.type]}
                </span>
            </div>

            <div className={css.content}>
                <div className={css.venue}
                     onClick={e => {
                         e.stopPropagation();
                         navigate(`/venues/${news.venue.id}`);
                     }}
                     style={{cursor: 'pointer'}}>
                    {news.venue.avatarVenue && (
                        <img src={news.venue.avatarVenue} alt="" className={css.venueAvatar}/>
                    )}
                    <span className={css.venueName}>{news.venue.name}</span>
                </div>

                <h3 className={css.title}>{news.title}</h3>
                <p className={css.body}>{news.body}</p>

                <time className={css.date}>{formatDate(news.created)}</time>
            </div>
        </article>
    );
};

export {NewsCard};