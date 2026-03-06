import { FC, useState } from 'react';
import { pyachokService } from '../../../services/pyachok.service';
import {
    ICreatePyachokDto,
    PyachokGenderEnum,
    PyachokPayerEnum,
} from '../../../interfaces/IPyachokInterface';
import css from './PyachokModal.module.css';

interface IProps {
    venueId:   string;
    venueName: string;
    onClose:   () => void;
}

const WARNING_KEY = 'pyachokWarningAccepted';

const PyachokModal: FC<IProps> = ({ venueId, venueName, onClose }) => {
    const warningShown = localStorage.getItem(WARNING_KEY) === 'true';
    const [step,    setStep]    = useState<'warning' | 'form' | 'success'>(warningShown ? 'form' : 'warning');
    const [loading, setLoading] = useState(false);
    const [error,   setError]   = useState<string | null>(null);

    const [dto, setDto] = useState<ICreatePyachokDto>({
        date:    '',
        time:    '',
        purpose: '',
        message: '',
    });

    const set = (field: keyof ICreatePyachokDto, value: any) =>
        setDto(prev => ({ ...prev, [field]: value || undefined }));

    const handleAcceptWarning = () => {
        localStorage.setItem(WARNING_KEY, 'true');
        setStep('form');
    };

    const handleSubmit = async () => {
        if (!dto.date || !dto.time) {
            setError('Вкажіть дату та час');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            await pyachokService.create(venueId, dto);
            setStep('success');
        } catch {
            setError('Помилка при відправці. Спробуйте ще раз.');
        }
        setLoading(false);
    };

    return (
        <div className={css.overlay} onClick={onClose}>
            <div className={css.modal} onClick={e => e.stopPropagation()}>
                <button className={css.closeBtn} onClick={onClose}>✕</button>

                {step === 'warning' && (
                    <div className={css.warning}>
                        <div className={css.warningIcon}>⚠️</div>
                        <h2 className={css.warningTitle}>Будьте обережні!</h2>
                        <p className={css.warningText}>
                            Адміністрація застерігає вас бути обережними і не зустрічатися з незнайомими людьми
                            в небезпечних чи невідомих вам місцях.
                        </p>
                        <div className={css.warningActions}>
                            <button className={css.cancelBtn} onClick={onClose}>Скасувати</button>
                            <button className={css.acceptBtn} onClick={handleAcceptWarning}>
                                Розумію, продовжити
                            </button>
                        </div>
                    </div>
                )}

                {step === 'form' && (
                    <>
                        <div className={css.header}>
                            <h2 className={css.title}>🍺 Пиячок</h2>
                            <p className={css.subtitle}>{venueName}</p>
                        </div>

                        <div className={css.form}>
                            {/* Дата і час */}
                            <div className={css.row}>
                                <div className={css.field}>
                                    <label className={css.label}>📅 Дата *</label>
                                    <input
                                        className={css.input}
                                        type="date"
                                        min={new Date().toISOString().split('T')[0]}
                                        value={dto.date}
                                        onChange={e => set('date', e.target.value)}
                                    />
                                </div>
                                <div className={css.field}>
                                    <label className={css.label}>🕐 Час *</label>
                                    <input
                                        className={css.input}
                                        type="time"
                                        value={dto.time}
                                        onChange={e => set('time', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className={css.field}>
                                <label className={css.label}>🎯 Мета зустрічі</label>
                                <input
                                    className={css.input}
                                    type="text"
                                    placeholder="Наприклад: відпочити після роботи, відсвяткувати..."
                                    value={dto.purpose ?? ''}
                                    onChange={e => set('purpose', e.target.value)}
                                />
                            </div>

                            <div className={css.field}>
                                <label className={css.label}>👥 Кількість людей в компанії</label>
                                <input
                                    className={css.input}
                                    type="number"
                                    min={1} max={50}
                                    placeholder="1–50"
                                    value={dto.peopleCount ?? ''}
                                    onChange={e => set('peopleCount', +e.target.value || undefined)}
                                />
                            </div>

                            <div className={css.field}>
                                <label className={css.label}>🧑‍🤝‍🧑 Бажана стать компанії</label>
                                <div className={css.radioGroup}>
                                    {[
                                        { value: PyachokGenderEnum.ANY,    label: 'Будь-яка' },
                                        { value: PyachokGenderEnum.MALE,   label: '👨 Чоловіча' },
                                        { value: PyachokGenderEnum.FEMALE, label: '👩 Жіноча' },
                                    ].map(o => (
                                        <label key={o.value} className={`${css.radioBtn} ${dto.genderPreference === o.value ? css.radioBtnActive : ''}`}>
                                            <input
                                                type="radio"
                                                name="gender"
                                                value={o.value}
                                                checked={dto.genderPreference === o.value}
                                                onChange={() => set('genderPreference', o.value)}
                                            />
                                            {o.label}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className={css.field}>
                                <label className={css.label}>💳 Хто оплачує</label>
                                <div className={css.radioGroup}>
                                    {[
                                        { value: PyachokPayerEnum.ANY,   label: 'Обговоримо' },
                                        { value: PyachokPayerEnum.ME,    label: '👤 Я пригощаю' },
                                        { value: PyachokPayerEnum.SPLIT, label: '🤝 Поровну' },
                                        { value: PyachokPayerEnum.OTHER, label: '🎁 Мене пригощають' },
                                    ].map(o => (
                                        <label key={o.value} className={`${css.radioBtn} ${dto.payer === o.value ? css.radioBtnActive : ''}`}>
                                            <input
                                                type="radio"
                                                name="payer"
                                                value={o.value}
                                                checked={dto.payer === o.value}
                                                onChange={() => set('payer', o.value)}
                                            />
                                            {o.label}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className={css.field}>
                                <label className={css.label}>💰 Бажана сума витрат (₴)</label>
                                <input
                                    className={css.input}
                                    type="number"
                                    min={0}
                                    placeholder="Наприклад: 500"
                                    value={dto.expectedBudget ?? ''}
                                    onChange={e => set('expectedBudget', +e.target.value || undefined)}
                                />
                            </div>

                            <div className={css.field}>
                                <label className={css.label}>💬 Напишіть мені</label>
                                <textarea
                                    className={css.textarea}
                                    rows={3}
                                    placeholder="Розкажіть про себе або деталі зустрічі..."
                                    value={dto.message ?? ''}
                                    onChange={e => set('message', e.target.value)}
                                />
                            </div>

                            {error && <p className={css.error}>{error}</p>}

                            <div className={css.formActions}>
                                <button className={css.cancelBtn} onClick={onClose}>Скасувати</button>
                                <button
                                    className={css.submitBtn}
                                    onClick={handleSubmit}
                                    disabled={loading}
                                >
                                    {loading ? <span className={css.spinner} /> : '🍺 Відправити запит'}
                                </button>
                            </div>
                        </div>
                    </>
                )}

                {step === 'success' && (
                    <div className={css.success}>
                        <div className={css.successIcon}>🍺</div>
                        <h2 className={css.successTitle}>Запит відправлено!</h2>
                        <p className={css.successText}>
                            Ваш запит «Пиячок» успішно створено для <strong>{venueName}</strong>.
                            Чекайте на відгук від компанії!
                        </p>
                        <button className={css.submitBtn} onClick={onClose}>Чудово!</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export { PyachokModal };