import {useNavigate} from "react-router-dom";
import {useAppSelector} from "../../../hooks/useReduxHooks";
import {Venue} from "../../VenueListComponents/Venue/Venue";

const SearchVenues = () => {
    const {venues} = useAppSelector(state => state.search);
    const navigate = useNavigate();
    const goBack = () => {
        navigate('/venues');
    };
    return (
        <div>
            <div>
                <h1>SearchVenues</h1>
            </div>
            <div>
                <button onClick={goBack}>Back</button>
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