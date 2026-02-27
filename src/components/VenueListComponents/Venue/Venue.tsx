import {FC,} from 'react';
import css from './Venue.module.css';
import {useNavigate} from "react-router-dom";
import {IVenueInterface} from "../../../interfaces/IVenueInterface";

interface IProps {
    venue: IVenueInterface
}

const Venue: FC<IProps> = ({venue}) => {
    const {id, name, logoVenue, city} = venue;
    const navigate = useNavigate();
    return (
        <div onClick={() => navigate(`/movie/${id}`)} className={css.Venue}>
            <img className={css.poster} src={`${logoVenue}`} alt={'img'}/>
            <div className={css.titleText}>{city}</div>
            <div className={css.titleText}>{name}</div>
        </div>
    );
}

export {Venue};