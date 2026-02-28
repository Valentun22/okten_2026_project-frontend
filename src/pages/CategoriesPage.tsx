import {Outlet} from "react-router-dom";
import {Categories} from "../components/CategoriesInfoComponent/Categories/Categories";


const CategoriesPage = () => {
    return (
        <div>
            <Categories/>
            <Outlet/>
        </div>
    );
};

export {CategoriesPage};