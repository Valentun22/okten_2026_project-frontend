import {NavLink} from "react-router-dom";
import css from './FooterComponent.module.css';

const FooterComponent = () => {
    return (
        <div className={css.footerBox}>
            <div className={css.footerLogo}>
                <h2>Пиячок</h2>
                <NavLink to="https://privatehospital.com.ua/ua/pidlitkovyy-alkoholizm">
                    <img src={"https://upload.wikimedia.org/wikipedia/commons/7/78/RARS_18%2B.svg"}
                         alt={"18"}
                    />
                </NavLink>
            </div>

            <div className={css.footerStyle}>
                <div className={css.footerImg}>
                    <NavLink to="https://owu.com.ua">
                        <img
                            src={"https://www.omnicoreagency.com/wp-content/uploads/2018/09/Instagram-Logo-PNG-2018.png"}
                            alt={"Inst"}
                            className={css.footerImage}
                        />
                    </NavLink>
                </div>
                <div className={css.footerImg}>
                    <NavLink to="https://owu.com.ua">
                        <img
                            src={"https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Facebook_logo_%28square%29.png/640px-Facebook_logo_%28square%29.png"}
                            alt={"Face"}
                            className={css.footerImage}
                        />
                    </NavLink>
                </div>
                <div className={css.footerImg}>
                    <NavLink to="https://owu.com.ua">
                        <img
                            src={"https://cdn.pixabay.com/photo/2021/12/27/10/50/telegram-6896827_1280.png"}
                            alt={"Teleg"}
                            className={css.footerImage}
                        />
                    </NavLink>
                </div>
            </div>
        </div>
    );
};

export {FooterComponent};