import css from './HomePage.module.css';
import {FC, useEffect, useState} from 'react';
import img2 from '../../img/img2.png';
import img3 from '../../img/img3.png';
import img4 from '../../img/img4.png';
import img5 from '../../img/img5.png';
import img6 from '../../img/img6.png';
import img7 from '../../img/img7.png';
import img8 from '../../img/img8.png';
import img9 from '../../img/img9.png';
import img10 from '../../img/img10.png';
import img11 from '../../img/img11.png';
import {useNavigate} from 'react-router-dom';
import {FooterComponent} from '../FooterComponent/FooterComponent';
import 'animate.css';
import {axiosInstance} from '../../services/axiosInstance.service';
import {urls} from '../../constants/urls';

const HomePage: FC = () => {
    const navigate = useNavigate();
    const [contacts, setContacts] = useState<Record<string, string>>({});

    useEffect(() => {
        axiosInstance.get(urls.admin.settingsPublic)
            .then(({data}) => setContacts(typeof data === 'object' ? data : {}))
            .catch(() => {
            });
    }, []);

    return (
        <>
            <div>
                {/* Article One */}
                <div className={`${css.articleOne} ${css.flex}`}>
                    <div className={css.boxOneArticleOne}>
                        <div className={css.boxOneInfoBackground}>
                            <img src={img4} alt="img"/>
                        </div>
                        <div className={css.boxOneInfo}>
                            <h2 className="animate__animated animate__fadeInLeft">Заклади на будь-який вибір</h2>
                            <img src={img3} alt="img"/>
                            <h4>Швидко й легко знайти всі необхідні контакти закладів</h4>
                        </div>
                        <button onClick={() => navigate('/searchVenue')}>Пошук закладів</button>
                    </div>
                    <div className={css.boxTwoArticleOne}>
                        <img src={img2} alt="img"/>
                    </div>
                </div>

                {/* Article Two */}
                <div id="about-section" className={`${css.articleTwo} ${css.flex}`}>
                    <div className={css.boxOneArticleTwo}>
                        <div className={css.boxOneArticleTwoInfo}>
                            <h2 className="animate__animated animate__fadeInDown animate__delay-1s">Про нас</h2>
                            <img className="animate__animated animate__fadeInDown animate__delay-1s" src={img3}
                                 alt="img"/>
                            <h3 className="animate__animated animate__fadeIn animate__delay-1s">
                                Уявіть собі систему, де вся необхідна інформація знаходиться на відстані витягнутої
                                руки.
                                Вам не доведеться блукати лабіринтами меню чи витрачати час на пошук потрібних
                                контактів.
                            </h3>
                            <button className={css.btn} onClick={() => navigate('/aboutUs')}>Детальніше</button>
                        </div>
                    </div>
                    <div className={css.boxTwoArticleTwo}>
                        <div className={css.boxTwoArticleTwoImgBox}>
                            <img className={css.boxTwoArticleTwoImgOne} src={img5} alt="img"/>
                            <img className={css.boxTwoArticleTwoImgTwo} src={img6} alt="img"/>
                            <div className={css.boxTwoArticleTwoImgBoxBackground}>
                                <img className={css.boxTwoArticleTwoImgThree} src={img4} alt="img"/>
                                <img className={css.boxTwoArticleTwoImgFour} src={img7} alt="img"/>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Article Three */}
                <div className={css.articleThree}>
                    <div className={`${css.boxOneArticleThree} ${css.flex}`}>
                        <div className={css.boxOneArticleThreeInfo}>
                            <h2>Чому обирати саме нас</h2>
                            <div className={css.boxOneArticleThreeInfoImg}>
                                <img src={img8} alt="img"/>
                            </div>
                        </div>
                    </div>
                    <div className={`${css.boxTwoArticleThree} ${css.flex}`}>
                        <div className={css.boxTwoArticleThreeImgDots}>
                            <img src={img4} alt="img"/>
                        </div>
                        <div className={`${css.articleThreeInfoBox} ${css.flex}`}>
                            <div className={css.articleThreeInfoBoxSize}>
                                <div className={css.iconBoxArticleThree}>
                                    <img src={img9} alt="img"/>
                                </div>
                                <h3>Все в одному місці</h3>
                                <h4>Контакти закладів та опис про них – все зібрано в одному місці для вашої
                                    зручності.</h4>
                            </div>
                            <div className={css.articleThreeInfoBoxSize}>
                                <div className={css.iconBoxArticleThree}>
                                    <img src={img10} alt="img"/>
                                </div>
                                <h3>Економія <br/> часу</h3>
                                <h4>Знайдіть потрібну інформацію за лічені секунди та присвятіть час більш важливим
                                    справам.</h4>
                            </div>
                            <div className={css.articleThreeInfoBoxSize}>
                                <div className={css.iconBoxArticleThree}>
                                    <img src={img11} alt="img"/>
                                </div>
                                <h3>Простота та ефективність</h3>
                                <h4>Сайт розроблений таким чином, щоб легко з ним розібратися. Мінімум кліків – максимум
                                    результату.</h4>
                            </div>
                        </div>
                        <div className={css.boxTwoArticleThreeImgDots}>
                            <img src={img4} alt="img4"/>
                        </div>
                    </div>
                </div>

                {/* Article Four */}
                <div className={css.articleFour}>
                    <div className={css.articleFourContent}>
                        <div className={css.articleFourText}>
                            <h2>🍺 Функція «Пиячок»</h2>
                            <img src={img3} alt="img"/>
                            <p>
                                Шукаєш компанію для вечірки, ділової зустрічі чи просто приємного проведення часу?
                                Функція «Пиячок» дозволяє знайти людей, які хочуть провести час у тому самому закладі.
                                Вкажи дату, час, мету зустрічі та бюджет — і знайди свою компанію!
                            </p>
                            <button className={css.articleFourBtn} onClick={() => navigate('/pyachok')}>
                                Знайти компанію
                            </button>
                        </div>
                        <div className={css.articleFourCards}>
                            <div className={css.pyachokCard}>
                                <span className={css.pyachokCardIcon}>📅</span>
                                <h4>Обери дату і час</h4>
                                <p>Вкажи коли плануєш відвідати заклад</p>
                            </div>
                            <div className={css.pyachokCard}>
                                <span className={css.pyachokCardIcon}>🎯</span>
                                <h4>Опиши мету зустрічі</h4>
                                <p>День народження, побачення, ділова зустріч</p>
                            </div>
                            <div className={css.pyachokCard}>
                                <span className={css.pyachokCardIcon}>🤝</span>
                                <h4>Знайди компанію</h4>
                                <p>Приєднуйся до відкритих запитів або створи свій</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Article Five */}
                <div className={css.articleFive}>
                    <div className={css.statsGrid}>
                        <div className={css.statItem}>
                            <span className={css.statNumber}>500+</span>
                            <span className={css.statLabel}>Закладів</span>
                        </div>
                        <div className={css.statItem}>
                            <span className={css.statNumber}>1000+</span>
                            <span className={css.statLabel}>Користувачів</span>
                        </div>
                        <div className={css.statItem}>
                            <span className={css.statNumber}>5000+</span>
                            <span className={css.statLabel}>Відгуків</span>
                        </div>
                        <div className={css.statItem}>
                            <span className={css.statNumber}>50+</span>
                            <span className={css.statLabel}>Міст</span>
                        </div>
                    </div>
                </div>

                {/* Article Six */}
                <div className={css.articleSix}>
                    <div className={css.articleSixContent}>
                        <h2>Зв'яжіться з нами</h2>
                        <img src={img3} alt="img" className={css.articleSixDivider}/>
                        <div className={css.contactsGrid}>
                            {contacts.contact_phone && (
                                <a href={`tel:${contacts.contact_phone}`} className={css.contactCard}>
                                    <span className={css.contactCardIcon}>📞</span>
                                    <span className={css.contactCardLabel}>Телефон</span>
                                    <span className={css.contactCardValue}>{contacts.contact_phone}</span>
                                </a>
                            )}
                            {contacts.contact_email && (
                                <a href={`mailto:${contacts.contact_email}`} className={css.contactCard}>
                                    <span className={css.contactCardIcon}>✉️</span>
                                    <span className={css.contactCardLabel}>Email</span>
                                    <span className={css.contactCardValue}>{contacts.contact_email}</span>
                                </a>
                            )}
                            {contacts.contact_address && (
                                <div className={css.contactCard}>
                                    <span className={css.contactCardIcon}>📍</span>
                                    <span className={css.contactCardLabel}>Адреса</span>
                                    <span className={css.contactCardValue}>{contacts.contact_address}</span>
                                </div>
                            )}
                            {!contacts.contact_phone && !contacts.contact_email && !contacts.contact_address && (
                                <>
                                    <div className={css.contactCard}>
                                        <span className={css.contactCardIcon}>📞</span>
                                        <span className={css.contactCardLabel}>Телефон</span>
                                        <span className={css.contactCardValue}>+38 (000) 000-00-00</span>
                                    </div>
                                    <div className={css.contactCard}>
                                        <span className={css.contactCardIcon}>✉️</span>
                                        <span className={css.contactCardLabel}>Email</span>
                                        <span className={css.contactCardValue}>info@pyachok.ua</span>
                                    </div>
                                    <div className={css.contactCard}>
                                        <span className={css.contactCardIcon}>📍</span>
                                        <span className={css.contactCardLabel}>Адреса</span>
                                        <span className={css.contactCardValue}>Україна, Львів</span>
                                    </div>
                                </>
                            )}
                        </div>
                        <div className={css.socialLinks}>
                            {contacts.social_instagram && (
                                <a href={contacts.social_instagram} target="_blank" rel="noreferrer"
                                   className={css.socialLink}>📸 Instagram</a>
                            )}
                            {contacts.social_facebook && (
                                <a href={contacts.social_facebook} target="_blank" rel="noreferrer"
                                   className={css.socialLink}>👤 Facebook</a>
                            )}
                            {contacts.social_telegram && (
                                <a href={contacts.social_telegram} target="_blank" rel="noreferrer"
                                   className={css.socialLink}>✈️ Telegram</a>
                            )}
                        </div>
                        <button className={css.articleFourBtn} onClick={() => navigate('/aboutUs')}>
                            Дізнатись більше про нас
                        </button>
                    </div>
                </div>
            </div>
            <FooterComponent/>
        </>
    );
};

export {HomePage};