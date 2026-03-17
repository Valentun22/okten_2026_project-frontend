import {Outlet} from "react-router-dom";
import {NotFoundComponent} from "../components/NotFoundComponent/NotFoundComponent";

const NotFoundPage = () => {
    return (
        <div>
            <NotFoundComponent/>
            <Outlet/>
        </div>
    );
};

export {NotFoundPage};