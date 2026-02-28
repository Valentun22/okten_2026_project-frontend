import {FC} from 'react';
import {useAppSelector} from "../../hooks/useReduxHooks";
import {IVenueCategoryInterface} from "../../interfaces/IVenueCategoryInterface";
import {StarRatingForVenue} from "../StarRatingComponent/StarRatingForVenue";
import {Category} from "../CategoriesInfoComponent/Category/Category";

interface IProps{
    name: string,
    menu: string,
    city: string,
    averageCheck: number,
    categories: IVenueCategoryInterface[];
    onVenueCategoryClick: (category: IVenueCategoryInterface) => void;
    rating: number,
}

const VenueInfo: FC<IProps> = ({ name, menu, averageCheck, city, rating, onVenueCategoryClick, categories  }) => {
    const {categoryVenuesCount, total_pages, activeCategoryId} = useAppSelector(state => state.categories);
    return (
        <div>
            <div>VenueInfo</div>
            <div>{name}</div>
            <div>
                <div>
                    <h2>Categories this venue:</h2>
                    <div>
                        {categories.map((category, index) => (
                            <Category
                                key={index}
                                category={category}
                                onGenreClick={onVenueCategoryClick}
                                isActive={category.id === activeCategoryId}
                                count={(categoryVenuesCount?.[category.id] ?? 0) * (total_pages ?? 1)}
                            />
                        ))}
                    </div>
                    <h2>Місто: {city}</h2>
                    <h2>Меню: {menu}</h2>
                    <h2>Середній чек: "{averageCheck}"</h2>
                </div>
            </div>
            <div>
                <StarRatingForVenue rating={rating}/>
            </div>
        </div>
    );
};

export {VenueInfo};