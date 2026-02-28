import {useAppSelector} from "../../../hooks/useReduxHooks";
import {Venue} from "../../VenueListComponents/Venue/Venue";

const SearchVenues = () => {
    const {venues} = useAppSelector(state => state.search);

    return (
        <div>
            <div>
                <h1>Search Venues</h1>
            </div>
            <div>
                {venues && venues.map((venue) => (
                    <Venue key={venue.id} venue={venue}/>
                ))}
            </div>
        </div>
    );
};

export {SearchVenues};