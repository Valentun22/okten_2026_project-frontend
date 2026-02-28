import {Header} from "../components/HeaderComponent/Header";
import WarningModal from "../components/WarningComponent/WarningComponent";
import {Outlet} from "react-router-dom";

const MainLayout = () => {
    return (
        <div>
            <Header/>
            <WarningModal/>
            <Outlet/>
        </div>
    );
};

export {MainLayout};