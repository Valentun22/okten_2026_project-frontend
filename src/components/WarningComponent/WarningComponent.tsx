import { useEffect, useState } from "react";
import css from "./WarningComponent.module.css";

const STORAGE_KEY = "userAcceptedWarnings";

const WarningModal = () => {
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const hasAccepted = localStorage.getItem(STORAGE_KEY);
        if (hasAccepted !== "true") setShowModal(true);
    }, []);

    // блокуємо скрол, поки модалка відкрита
    useEffect(() => {
        if (!showModal) return;

        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = prev;
        };
    }, [showModal]);

    const handleAccept = () => {
        localStorage.setItem(STORAGE_KEY, "true");
        setShowModal(false);
    };

    const handleExit = () => {
        localStorage.setItem(STORAGE_KEY, "false");
        // якщо хочеш - можна ще закрити модалку перед виходом:
        // setShowModal(false);
    };

    if (!showModal) return null;

    return (
        <div className={css.boxSize} role="dialog" aria-modal="true">
            <div className={css.boxWarning}>
                <div className={css.boxWarningText}>
                    <h2>Увага!</h2>
                    <p>
                        Запускаючи цей сайт, ви погоджуєтесь, що вам є 18 років.
                        <hr />
                        <br />
                        Адміністрація застерігає вас бути обережними і не зустрічатися з
                        незнайомими людьми в небезпечних чи невідомих вам місцях.
                    </p>
                </div>

                <div className={css.buttonBox}>
                    <div className={`${css.buttonBoxOne} ${css.buttonBoxSize}`}>
                        <button type="button" className={css.btn5} onClick={handleAccept}>
                            Погоджуюсь
                        </button>
                    </div>

                    <div className={`${css.buttonBoxTwo} ${css.buttonBoxSize}`}>
                        <a
                            href="https://www.google.com.ua/?hl=uk"
                            className={css.buttonTwoLink}
                            onClick={handleExit}
                        >
                            <button type="button" className={css.btn5}>
                                Вихід
                            </button>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WarningModal;