import {NavLink} from "react-router-dom";
import css from './FooterComponent.module.css';
import telegram_logo from '../../img/footer_img/telegram_logo.png';
import instagram_logo from '../../img/footer_img/instagram_logo.png';
import facebook_logo from '../../img/footer_img/facebook_logo.png';
import not18 from '../../img/footer_img/not18.png';

const FooterComponent = () => {
    return (
        <div className={css.footerBox}>
            <div className={css.footerLogo}>
                <h2>Пиячок</h2>
                <NavLink to="https://privatehospital.com.ua/ua/pidlitkovyy-alkoholizm">
                    <img src={not18}
                         alt={"18"}
                    />
                </NavLink>
            </div>

            <div className={css.footerStyle}>
                <div className={css.footerImg}>
                    <NavLink to="https://owu.com.ua">
                        <img
                            src={instagram_logo}
                            alt={"Inst"}
                            className={css.footerImage}
                        />
                    </NavLink>
                </div>
                <div className={css.footerImg}>
                    <NavLink to="https://owu.com.ua">
                        <img
                            src={facebook_logo}
                            alt={"Face"}
                            className={css.footerImage}
                        />
                    </NavLink>
                </div>
                <div className={css.footerImg}>
                    <NavLink to="https://owu.com.ua">
                        <img
                            src={telegram_logo}
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