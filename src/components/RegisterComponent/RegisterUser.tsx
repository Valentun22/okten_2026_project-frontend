import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/useReduxHooks';
import { authActions } from '../../redux/slices/authSlice';
import css from './RegisterUser.module.css';

const RegisterUser = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { loading, error } = useAppSelector(state => state.auth);

    const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
    const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));
    const [localError, setLocalError] = useState('');

    const handleSubmit = async () => {
        if (form.password !== form.confirm) { setLocalError('Паролі не збігаються'); return; }
        if (form.password.length < 6)       { setLocalError('Пароль мінімум 6 символів'); return; }
        setLocalError('');
        const { name, email, password } = form;
        const res = await dispatch(authActions.register({ name, email, password }));
        if (authActions.register.fulfilled.match(res)) navigate('/');
    };

    return (
        <div className={css.page}>
            <div className={css.card}>
                <h1 className={css.title}>Реєстрація</h1>
                <p className={css.sub}>Приєднуйся до спільноти!</p>

                {[
                    { key: 'name',     label: "Ім'я",           type: 'text',     ph: 'Іван Петренко' },
                    { key: 'email',    label: 'Email',           type: 'email',    ph: 'your@email.com' },
                    { key: 'password', label: 'Пароль',          type: 'password', ph: '••••••••' },
                    { key: 'confirm',  label: 'Підтвердіть пароль', type: 'password', ph: '••••••••' },
                ].map(({ key, label, type, ph }) => (
                    <div className={css.field} key={key}>
                        <label className={css.label}>{label}</label>
                        <input className={css.input} type={type} placeholder={ph}
                               value={(form as any)[key]} onChange={e => set(key, e.target.value)} />
                    </div>
                ))}

                {(localError || error) && <p className={css.error}>{localError || error}</p>}

                <button className={css.submitBtn} onClick={handleSubmit} disabled={loading}>
                    {loading ? <span className={css.spinner} /> : 'Зареєструватись'}
                </button>

                <p className={css.footer}>
                    Вже є акаунт? <Link to="/login" className={css.link}>Увійти</Link>
                </p>
            </div>
        </div>
    );
};

export { RegisterUser};