import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../hooks/useReduxHooks";
import { VenueCard } from "../VenueCard/VenueCard";
import { venuesActions } from "../../../redux/slices/venuesSlice";

const VenuesCard = () => {
    const { venueCard } = useAppSelector((state) => state.venues);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    useEffect(() => {
        if (!id) return;
        dispatch(venuesActions.getByVenueId(id));
    }, [dispatch, id]);

    return (
        <div>
            <div>
                <h1>VenuesCard</h1>
            </div>

            <div>
                <button onClick={() => navigate(-1)}>Go back</button>
            </div>

            {venueCard && <VenueCard venueCard={venueCard} />}
        </div>
    );
};

export { VenuesCard };