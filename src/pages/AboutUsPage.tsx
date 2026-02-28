import {Outlet} from "react-router-dom";
import {AboutUs} from "../components/AboutUsComponent/aboutUs";

const AboutUsPage = () => {
    return (
        <div>
            <AboutUs/>
            <Outlet/>
        </div>
    );
};

export {AboutUsPage};