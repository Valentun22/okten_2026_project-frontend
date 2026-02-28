import { useEffect } from "react";
import css from './Venues.module.css';
import { useAppDispatch, useAppSelector } from "../../../hooks/useReduxHooks";
import { venuesActions } from "../../../redux/slices/venuesSlice";
import { Venue } from "../Venue/Venue";

const Venues = () => {
    const { venues, page } = useAppSelector(state => state.venues);
    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(venuesActions.getAll(page));
    }, [dispatch, page]);

    return (
        <div className={css.MoviesModule}>
            <div className={css.venueList}>
                {venues.map(venue => <Venue key={venue.id} venue={venue} />)}
            </div>
            <div>
                <h1>Venues</h1>
            </div>
        </div>
    );
};

export { Venues };