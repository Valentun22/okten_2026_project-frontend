import React from 'react';
import {StarRating} from 'star-rating-react-ts';
import css from './StarRatingForVenue.module.css';

interface IProps {
    rating: number;
}
const sizeStars= {
    colors: {
        backgroundDefault: 'lightgray',
        backgroundColorActive: '#d82727',
        backgroundColorHover: '#0a3186'
    },
    size: 22
};

const StarRatingForVenue: React.FC<IProps> = ({rating}) => {
    return (
        <div className={css.starRating}>
        <StarRating
            numStars={10}
            initialRating={rating}
            readOnly={true}
            theme={sizeStars}
        />
        </div>
    );
}

export {
    StarRatingForVenue
}