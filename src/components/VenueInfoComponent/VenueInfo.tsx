import {FC} from 'react';
import {IVenueCategoryInterface} from '../../interfaces/IVenueCategoryInterface';
import {StarRatingForVenue} from '../StarRatingComponent/StarRatingForVenue';
import css from './VenueInfo.module.css';

interface IProps {
    name: string;
    menu?: string;
    city?: string;
    averageCheck?: number;
    categories: IVenueCategoryInterface[];
    onVenueCategoryClick: (category: IVenueCategoryInterface) => void;
    rating?: number;
    hasWiFi?: boolean;
    hasParking?: boolean;
    liveMusic?: boolean;
    petFriendly?: boolean;
    hasTerrace?: boolean;
    smokingAllowed?: boolean;
    cardPayment?: boolean;
}

const FEATURE_LABELS: { key: keyof IProps; icon: string; label: string }[] = [
    {key: 'hasWiFi', icon: '📶', label: 'Wi-Fi'},
    {key: 'hasParking', icon: '🅿️', label: 'Паркінг'},
    {key: 'liveMusic', icon: '🎵', label: 'Жива музика'},
    {key: 'petFriendly', icon: '🐾', label: 'Тварини'},
    {key: 'hasTerrace', icon: '☀️', label: 'Тераса'},
    {key: 'smokingAllowed', icon: '🚬', label: 'Куріння'},
    {key: 'cardPayment', icon: '💳', label: 'Карткою'},
];

const VenueInfo: FC<IProps> = ({
                                   name, menu, city, averageCheck, rating,
                                   categories, onVenueCategoryClick,
                                   ...features
                               }) => {
    const activeFeatures = FEATURE_LABELS.filter(f => !!(features as any)[f.key]);

    return (
        <div className={css.wrap}>
            <h1 className={css.name}>{name}</h1>

            {rating !== undefined && (
                <div className={css.ratingRow}>
                    <StarRatingForVenue rating={rating}/>
                    <span className={css.ratingVal}>{rating > 0 ? rating.toFixed(1) : 'Немає оцінок'}</span>
                </div>
            )}

            <div className={css.metaRow}>
                {city && (
                    <span className={css.metaChip}>📍 {city}</span>
                )}
                {averageCheck !== undefined && averageCheck > 0 && (
                    <span className={css.metaChip}>💰 Середній чек: {averageCheck} грн</span>
                )}
                {menu && (
                    <span className={css.metaChip}>🍽 {menu}</span>
                )}
            </div>

            {categories.length > 0 && (
                <div className={css.section}>
                    <span className={css.sectionLabel}>Категорії</span>
                    <div className={css.chips}>
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                className={css.catChip}
                                onClick={() => onVenueCategoryClick(cat)}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {activeFeatures.length > 0 && (
                <div className={css.section}>
                    <span className={css.sectionLabel}>Зручності</span>
                    <div className={css.features}>
                        {activeFeatures.map(f => (
                            <span key={f.key} className={css.featureChip}>
                                {f.icon} {f.label}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export {VenueInfo};
