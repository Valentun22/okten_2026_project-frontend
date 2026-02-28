import {FC, useState,} from 'react';
import {IVenueInterface} from "../../../interfaces/IVenueInterface";
import {VenueInfo} from "../../VenueInfoComponent/VenueInfo";

interface IProps {
    venueCard: IVenueInterface
}

class IVenueCategoryInterface {
}

const VenueCard: FC<IProps> = ({venueCard}) => {
    const [, setSelectedCategory] = useState<IVenueCategoryInterface | null>(null);

    const handleCategoryClick = (categories: IVenueCategoryInterface) => {
        setSelectedCategory(categories);
    }
    return (
        <div>
            <div>
                <h1>VenueCard</h1>
            </div>
            <VenueInfo
                name={venueCard.name}
                categories={(venueCard.categories ?? []) /* якщо enum — то VenueInfo має приймати enum */}
                city={venueCard.city ?? ""}
                menu={venueCard.menu ?? ""}
                averageCheck={venueCard.averageCheck ?? 0}
                rating={venueCard.rating ?? 0}
                onVenueCategoryClick={handleCategoryClick}
            />
        </div>
    );
};

export {VenueCard};