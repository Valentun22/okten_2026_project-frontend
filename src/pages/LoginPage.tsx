import {Outlet} from "react-router-dom";
import {Login} from "../components/LoginComponents/Login";

const LoginPage = () => {
    return (
        <div>
            <Login/>
            <Outlet/>
        </div>
    );
};

export {LoginPage};