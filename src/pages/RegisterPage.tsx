import {Outlet} from "react-router-dom";
import {RegisterUser} from "../components/RegisterComponent/RegisterUser";

const RegisterPage = () => {
    return (
        <div>
            <RegisterUser/>
            <Outlet/>
        </div>
    );
};

export {RegisterPage};