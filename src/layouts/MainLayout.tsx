import {Header} from "../components/HeaderComponent/Header";
import WarningModal from "../components/WarningComponent/WarningComponent";
import {HomePage} from "../components/HomeComponent/HomePage";
import {Outlet} from "react-router-dom";

const MainLayout = () => {
    return (
        <div>
            <Header/>
            <WarningModal/>
            <HomePage/>
            <Outlet/>
        </div>
    );
};

export {MainLayout};