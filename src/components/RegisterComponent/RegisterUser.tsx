import {useEffect, useState} from 'react';
import {useNavigate, Link} from 'react-router-dom';
import {useAppDispatch, useAppSelector} from '../../hooks/useReduxHooks';
import {authActions} from '../../redux/slices/authSlice';
import css from './RegisterUser.module.css';

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID ?? '';
const FACEBOOK_APP_ID = process.env.REACT_APP_FACEBOOK_APP_ID ?? '';

function loadScript(src: string, id: string): Promise<void> {
    return new Promise((resolve) => {
        if (document.getElementById(id)) {
            resolve();
            return;
        }
        const s = document.createElement('script');
        s.src = src;
        s.id = id;
        s.async = true;
        s.defer = true;
        s.onload = () => resolve();
        document.head.appendChild(s);
    });
}

const RegisterUser = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const {loading, error} = useAppSelector(state => state.auth);

    const [form, setForm] = useState({name: '', email: '', password: '', confirm: ''});
    const set = (k: string, v: string) => setForm(p => ({...p, [k]: v}));
    const [localError, setLocalError] = useState('');
    const [oauthLoading, setOauthLoading] = useState<string | null>(null);

    const finishOAuth = async (provider: string, token: string) => {
        setOauthLoading(provider);
        const res = await dispatch(authActions.oauthLogin({provider, token}));
        setOauthLoading(null);
        if (authActions.oauthLogin.fulfilled.match(res)) navigate('/');
    };

    useEffect(() => {
        if (!GOOGLE_CLIENT_ID) return;
        loadScript('https://accounts.google.com/gsi/client', 'gsi-script').then(() => {
            window.google?.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: (resp: any) => {
                    if (resp.credential) finishOAuth('google', resp.credential);
                },
            });
            window.google?.accounts.id.renderButton(
                document.getElementById('google-reg-btn'),
                {theme: 'outline', size: 'large', width: 340, text: 'signup_with', locale: 'uk'},
            );
        });
    }, []);

    useEffect(() => {
        if (!FACEBOOK_APP_ID) return;
        loadScript('https://connect.facebook.net/uk_UA/sdk.js', 'fb-sdk').then(() => {
            window.FB?.init({appId: FACEBOOK_APP_ID, cookie: true, xfbml: false, version: 'v19.0'});
        });
    }, []);

    const handleFacebook = () => {
        if (!window.FB) return;
        window.FB.login((response: any) => {
            if (response.authResponse?.accessToken) {
                finishOAuth('facebook', response.authResponse.accessToken);
            }
        }, {scope: 'email,public_profile'});
    };

    const handleSubmit = async () => {
        if (form.password !== form.confirm) {
            setLocalError('Паролі не збігаються');
            return;
        }
        const pwdRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%_*#?&])[A-Za-z\d@$_!%*#?&]{8,}$/;
        if (!pwdRegex.test(form.password)) {
            setLocalError('Пароль: мін. 8 символів, літера + цифра + спецсимвол (@$!%_*#?&)');
            return;
        }
        setLocalError('');
        const {name, email, password} = form;
        const deviceId = `web-${Math.random().toString(36).slice(2)}`;
        const res = await dispatch(authActions.register({name, email, password, deviceId}));
        if (authActions.register.fulfilled.match(res)) navigate('/');
    };

    return (
        <div className={css.page}>
            <div className={css.card}>
                <h1 className={css.title}>Реєстрація</h1>
                <p className={css.sub}>Приєднуйся до спільноти!</p>

                {[
                    {key: 'name', label: "Ім'я", type: 'text', ph: 'Тарас Шевченко'},
                    {key: 'email', label: 'Email', type: 'email', ph: 'your@email.com'},
                    {key: 'password', label: 'Пароль', type: 'password', ph: '••••••••'},
                    {key: 'confirm', label: 'Підтвердіть пароль', type: 'password', ph: '••••••••'},
                ].map(({key, label, type, ph}) => (
                    <div className={css.field} key={key}>
                        <label className={css.label}>{label}</label>
                        <input className={css.input} type={type} placeholder={ph}
                               value={(form as any)[key]}
                               onChange={e => set(key, e.target.value)}/>
                    </div>
                ))}

                {(localError || error) && <p className={css.error}>{localError || error}</p>}

                <button className={css.submitBtn} onClick={handleSubmit} disabled={loading}>
                    {loading ? <span className={css.spinner}/> : 'Зареєструватись'}
                </button>

                <p className={css.footer}>
                    Вже є акаунт?{' '}
                    <Link to="/login" className={css.link}>Увійти</Link>
                </p>

                {(GOOGLE_CLIENT_ID || FACEBOOK_APP_ID) && (
                    <>
                        <div className={css.divider}><span>або зареєструватись через</span></div>
                        <div className={css.oauthSection}>
                            {GOOGLE_CLIENT_ID && (
                                <div id="google-reg-btn" className={css.googleBtnWrap}/>
                            )}
                            {FACEBOOK_APP_ID && (
                                <button
                                    className={css.oauthFacebook}
                                    onClick={handleFacebook}
                                    disabled={oauthLoading === 'facebook'}
                                >
                                    <svg viewBox="0 0 24 24" width="20" height="20" fill="#fff">
                                        <path
                                            d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.99 3.66 9.12 8.44 9.88V14.89H7.9V12h2.54V9.8c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.23.19 2.23.19v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99C18.34 21.12 22 17 22 12z"/>
                                    </svg>
                                    {oauthLoading === 'facebook' ? 'Завантаження...' : 'Продовжити з Facebook'}
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export {RegisterUser};