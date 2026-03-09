import {FC} from 'react';
import {IVenueCategoryInterface} from "../../interfaces/IVenueCategoryInterface";
import {StarRatingForVenue} from "../StarRatingComponent/StarRatingForVenue";

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
    return (
        <div>
            <div>VenueInfo</div>
            <div>{name}</div>
            <div>
                <div>
                    <h2>Categories this venue:</h2>
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