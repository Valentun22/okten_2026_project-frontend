import {useEffect, useState} from 'react';
import {useSearchParams, useNavigate, Link} from 'react-router-dom';
import css from './VerifyEmailComponent.module.css';
import {axiosInstance} from "../../services/axiosInstance.service";
import {urls} from "../../constants/urls";

const VerifyEmailPage = () => {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

    useEffect(() => {
        const token = params.get('token');
        if (!token) {
            setStatus('error');
            return;
        }
        axiosInstance.get(urls.auth.verifyEmail(token))
            .then(() => {
                setStatus('success');
                setTimeout(() => navigate('/login'), 3000);
            })
            .catch(() => setStatus('error'));
    }, []);

    return (
        <div className={css.page}>
            <div className={css.card}>
                <div className={css.logo}>🍺</div>
                {status === 'loading' && (
                    <>
                        <div className={css.spinner}/>
                        <p className={css.text}>Перевірка посилання...</p>
                    </>
                )}
                {status === 'success' && (
                    <>
                        <div className={css.icon}>✅</div>
                        <h2 className={css.title}>Email підтверджено!</h2>
                        <p className={css.text}>Ваш акаунт активовано. Перенаправлення на сторінку входу...</p>
                        <Link to="/login" className={css.btn}>Увійти зараз</Link>
                    </>
                )}
                {status === 'error' && (
                    <>
                        <div className={css.icon}>❌</div>
                        <h2 className={css.title}>Невалідне посилання</h2>
                        <p className={css.text}>Токен недійсний або прострочений. Спробуйте зареєструватись ще раз.</p>
                        <Link to="/register" className={css.btn}>Зареєструватись</Link>
                    </>
                )}
            </div>
        </div>
    );
};

export default VerifyEmailPage;