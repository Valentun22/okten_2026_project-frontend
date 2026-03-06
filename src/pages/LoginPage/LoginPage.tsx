import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/useReduxHooks';
import { authActions } from '../../redux/slices/authSlice';
import css from './LoginPage.module.css';

const LoginPage = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { loading, error } = useAppSelector(state => state.auth);

    const [form, setForm] = useState({ email: '', password: '' });
    const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

    const handleSubmit = async () => {
        const res = await dispatch(authActions.login(form));
        if (authActions.login.fulfilled.match(res)) navigate('/');
    };

    return (
        <div className={css.page}>
            <div className={css.card}>
                <h1 className={css.title}>Вхід</h1>
                <p className={css.sub}>Раді бачити тебе знову!</p>

                <div className={css.field}>
                    <label className={css.label}>Email</label>
                    <input className={css.input} type="email" placeholder="your@email.com"
                           value={form.email} onChange={e => set('email', e.target.value)} />
                </div>

                <div className={css.field}>
                    <label className={css.label}>Пароль</label>
                    <input className={css.input} type="password" placeholder="••••••••"
                           value={form.password} onChange={e => set('password', e.target.value)}
                           onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
                </div>

                {error && <p className={css.error}>{error}</p>}

                <button className={css.submitBtn} onClick={handleSubmit} disabled={loading}>
                    {loading ? <span className={css.spinner} /> : 'Увійти'}
                </button>

                <p className={css.footer}>
                    Немає акаунту? <Link to="/register" className={css.link}>Зареєструватись</Link>
                </p>
            </div>
        </div>
    );
};

export { LoginPage };