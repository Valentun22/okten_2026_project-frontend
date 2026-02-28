import {Outlet} from "react-router-dom";
import {TopVenue} from "../components/TopVenueComponent/topVenue";

const TopVenuePage = () => {
    return (
        <div>
            <TopVenue/>
            <Outlet/>
        </div>
    );
};

export {TopVenuePage};