import {Outlet} from "react-router-dom";
import {AllNews} from "../components/NewsComponent/AllNews/AllNews";

const NewsPage = () => {
    return (
        <div>
            <AllNews/>
            <Outlet/>
        </div>
    );
};

export {NewsPage};