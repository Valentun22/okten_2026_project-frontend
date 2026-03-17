import {useEffect, useState} from 'react';
import {axiosInstance} from '../../services/axiosInstance.service';
import {urls} from '../../constants/urls';
import css from './AboutUs.module.css';

const AboutUs = () => {
    const [settings, setSettings] = useState<Record<string, string>>({});

    useEffect(() => {
        axiosInstance.get(urls.admin.settingsPublic)
            .then(({data}) => setSettings(typeof data === 'object' ? data : {}))
            .catch(() => {
            });
    }, []);

    const s = (key: string) => settings[key] || '';

    return (
        <div className={css.aboutPage}>
            <div className={css.hero}>
                <div className={css.overlay}></div>
                <div className={css.heroContent}>
                    <h1>{s('about_title') || 'Про нас'}</h1>
                    <p>
                        {s('about_text') || (
                            <><strong>Пиячок</strong> – це сучасний сервіс для пошуку закладів, перегляду
                                відгуків, створення власних добірок улюблених місць та планування зустрічей.
                                Ми поєднуємо зручний пошук, реальні оцінки користувачів, новини закладів
                                та функціонал, який допомагає знайти місце саме під ваш настрій, бюджет і мету.</>
                        )}
                    </p>
                </div>
            </div>

            <div className={css.container}>
                <section className={css.section}>
                    <div className={css.sectionHeader}>
                        <h2>Наша ідея</h2>
                        <div className={css.line}></div>
                    </div>
                    {s('about_idea') ? (
                        <p>{s('about_idea')}</p>
                    ) : (
                        <>
                            <p>
                                Ми створили <strong>Пиячок</strong> як платформу, яка допомагає людям
                                швидко та зручно знаходити заклади для відпочинку, зустрічей, святкувань
                                або просто приємного вечора. Нашою метою є створення простору, де кожен
                                користувач може не лише знайти потрібне місце, а й поділитися власним
                                досвідом, оцінити сервіс, атмосферу та загальне враження від закладу.
                            </p>
                            <p>
                                Для нас важливо, щоб пошук був не просто списком закладів, а повноцінним
                                інструментом вибору. Саме тому платформа поєднує в собі каталог,
                                фільтрацію, сортування, рейтинги, новини, обрані заклади та додатковий
                                функціонал для взаємодії між користувачами й закладами.
                            </p>
                        </>
                    )}
                </section>

                <section className={css.section}>
                    <div className={css.sectionHeader}>
                        <h2>Що дає наш сервіс користувачу</h2>
                        <div className={css.line}></div>
                    </div>

                    <div className={css.cardGrid}>
                        <div className={css.infoCard}>
                            <h3>Пошук і фільтрація</h3>
                            <p>
                                Користувач може переглядати список закладів, шукати їх за назвою,
                                фільтрувати за рейтингом, типом, середнім чеком, тегами та
                                особливостями, а також сортувати за різними параметрами.
                            </p>
                        </div>

                        <div className={css.infoCard}>
                            <h3>Оцінки та відгуки</h3>
                            <p>
                                На платформі можна залишати оцінки, писати текстові відгуки та
                                вказувати середній чек. Це допомагає іншим користувачам робити
                                більш обґрунтований вибір.
                            </p>
                        </div>

                        <div className={css.infoCard}>
                            <h3>Обрані заклади</h3>
                            <p>
                                Улюблені місця можна додавати до окремого списку, щоб швидко
                                повертатися до них у майбутньому та не втрачати цікаві варіанти.
                            </p>
                        </div>

                        <div className={css.infoCard}>
                            <h3>Маршрут та контакти</h3>
                            <p>
                                Для кожного закладу доступна ключова інформація: розташування,
                                графік роботи, контакти, новини, теги та додаткові параметри,
                                необхідні для вибору.
                            </p>
                        </div>
                    </div>
                </section>

                <section className={css.section}>
                    <div className={css.sectionHeader}>
                        <h2>Функціонал платформи</h2>
                        <div className={css.line}></div>
                    </div>

                    <div className={css.features}>
                        <div className={css.featureItem}>
                            <span>01</span>
                            <div>
                                <h3>Особистий кабінет</h3>
                                <p>
                                    Кожен користувач отримує особистий кабінет із можливістю
                                    редагувати профіль, переглядати свої оцінки, коментарі,
                                    улюблені заклади та керувати власною активністю на платформі.
                                </p>
                            </div>
                        </div>

                        <div className={css.featureItem}>
                            <span>02</span>
                            <div>
                                <h3>Додавання закладів</h3>
                                <p>
                                    Користувачі можуть додавати нові заклади, які після модерації
                                    адміністрацією потрапляють до загального списку. Також доступне
                                    редагування та видалення власних закладів.
                                </p>
                            </div>
                        </div>

                        <div className={css.featureItem}>
                            <span>03</span>
                            <div>
                                <h3>Новини, акції та події</h3>
                                <p>
                                    Окремий розділ новин дозволяє стежити за загальними
                                    оновленнями, акціями та подіями закладів. Це робить платформу
                                    не лише каталогом, а й джерелом актуальної інформації.
                                </p>
                            </div>
                        </div>

                        <div className={css.featureItem}>
                            <span>04</span>
                            <div>
                                <h3>Топ-категорії</h3>
                                <p>
                                    На платформі передбачені добірки найкращих місць за різними
                                    сценаріями: для святкування дня народження, корпоративу,
                                    весілля чи інших подій.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className={css.section}>
                    <div className={css.sectionHeader}>
                        <h2>Функція "Пиячок"</h2>
                        <div className={css.line}></div>
                    </div>
                    <p>
                        Окремою особливістю сервісу є функція <strong>"Пиячок"</strong>. Вона
                        дозволяє обрати заклад, дату, час, описати мету зустрічі та додаткові
                        критерії, наприклад бажаний бюджет, кількість людей у компанії, хто
                        оплачує рахунок та інші деталі. Такий інструмент робить платформу
                        більш живою, інтерактивною та корисною для реального планування відпочинку.
                    </p>
                    <p>
                        Ми прагнемо створити не просто довідник закладів, а сервіс, який допомагає
                        людям знаходити місця, компанії та приводи для зустрічей.
                    </p>
                </section>

                <section className={css.section}>
                    <div className={css.sectionHeader}>
                        <h2>Модерація та безпека</h2>
                        <div className={css.line}></div>
                    </div>
                    <p>
                        Для підтримки якості контенту на платформі передбачена модерація нових
                        закладів та окремих змін. Це дозволяє зберігати точність інформації та
                        зменшувати кількість неправдивих або неактуальних даних.
                    </p>
                    <p>
                        Під час першого запуску користувачі отримують важливі попередження,
                        зокрема щодо вікових обмежень та обережності під час зустрічей у
                        незнайомих місцях. Ми наголошуємо на відповідальному користуванні сервісом
                        і безпечній взаємодії в реальному житті.
                    </p>
                </section>

                <section className={css.section}>
                    <div className={css.sectionHeader}>
                        <h2>Для кого створено платформу</h2>
                        <div className={css.line}></div>
                    </div>

                    <div className={css.audienceGrid}>
                        <div className={css.audienceCard}>
                            <h3>Для відвідувачів</h3>
                            <p>
                                Для тих, хто хоче швидко знайти хороший заклад, подивитися
                                відгуки, порівняти варіанти та обрати місце для відпочинку.
                            </p>
                        </div>

                        <div className={css.audienceCard}>
                            <h3>Для власників закладів</h3>
                            <p>
                                Для тих, хто хоче презентувати свій заклад, оновлювати інформацію,
                                додавати новини, керувати сторінкою та взаємодіяти з аудиторією.
                            </p>
                        </div>

                        <div className={css.audienceCard}>
                            <h3>Для адміністраторів і критиків</h3>
                            <p>
                                Для тих, хто відповідає за якість контенту, модерування інформації,
                                аналітику, а також формування довіри до рейтингової системи.
                            </p>
                        </div>
                    </div>
                </section>

                ] {(s('contact_phone') || s('contact_email') || s('contact_address')) && (
                <section className={css.section}>
                    <div className={css.sectionHeader}>
                        <h2>Контакти</h2>
                        <div className={css.line}></div>
                    </div>
                    <div className={css.contactGrid}>
                        {s('contact_phone') && (
                            <div className={css.contactItem}>
                                <span className={css.contactIcon}>📞</span>
                                <div>
                                    <p className={css.contactLabel}>Телефон</p>
                                    <a href={`tel:${s('contact_phone')}`}
                                       className={css.contactValue}>{s('contact_phone')}</a>
                                </div>
                            </div>
                        )}
                        {s('contact_email') && (
                            <div className={css.contactItem}>
                                <span className={css.contactIcon}>✉️</span>
                                <div>
                                    <p className={css.contactLabel}>Email</p>
                                    <a href={`mailto:${s('contact_email')}`}
                                       className={css.contactValue}>{s('contact_email')}</a>
                                </div>
                            </div>
                        )}
                        {s('contact_address') && (
                            <div className={css.contactItem}>
                                <span className={css.contactIcon}>📍</span>
                                <div>
                                    <p className={css.contactLabel}>Адреса</p>
                                    <p className={css.contactValue}>{s('contact_address')}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            )}

                {(s('social_instagram') || s('social_facebook') || s('social_telegram')) && (
                    <section className={css.section}>
                        <div className={css.sectionHeader}>
                            <h2>Ми в соцмережах</h2>
                            <div className={css.line}></div>
                        </div>
                        <div className={css.socialRow}>
                            {s('social_instagram') && (
                                <a href={s('social_instagram')} target="_blank" rel="noreferrer"
                                   className={css.socialBtn}>
                                    📸 Instagram
                                </a>
                            )}
                            {s('social_facebook') && (
                                <a href={s('social_facebook')} target="_blank" rel="noreferrer"
                                   className={css.socialBtn}>
                                    👤 Facebook
                                </a>
                            )}
                            {s('social_telegram') && (
                                <a href={s('social_telegram')} target="_blank" rel="noreferrer"
                                   className={css.socialBtn}>
                                    ✈️ Telegram
                                </a>
                            )}
                        </div>
                    </section>
                )}

                <section className={css.finalBlock}>
                    <h2>Пиячок – більше, ніж просто каталог закладів</h2>
                    <p>
                        Це простір для пошуку, вибору, оцінювання та відкриття нових місць.
                        Ми хочемо, щоб кожен користувач міг легко знайти заклад під свій настрій,
                        подію або компанію, а також отримати максимум корисної інформації в одному місці.
                    </p>
                </section>
            </div>
        </div>
    );
};

export default AboutUs;