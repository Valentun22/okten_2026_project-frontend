import {FC, useState} from 'react';
import {pyachokService} from '../../../services/pyachok.service';
import {
    ICreatePyachokDto,
    IPyachokItem,
    PyachokGenderEnum,
    PyachokPayerEnum,
} from '../../../interfaces/IPyachokInterface';
import css from './PyachokModal.module.css';

interface IProps {
    venueId: string;
    venueName: string;
    onClose: () => void;
    editItem?: IPyachokItem;
}

const WARNING_KEY = 'pyachokWarningAccepted';

const PyachokModal: FC<IProps> = ({venueId, venueName, onClose, editItem}) => {
    const isEditMode = !!editItem;
    const warningShown = localStorage.getItem(WARNING_KEY) === 'true';
    const [step, setStep] = useState<'warning' | 'form' | 'success'>(
        isEditMode || warningShown ? 'form' : 'warning'
    );
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [dto, setDto] = useState<ICreatePyachokDto>(
        isEditMode ? {
            date: editItem.date,
            time: editItem.time,
            purpose: editItem.purpose ?? '',
            message: editItem.message ?? '',
            peopleCount: editItem.peopleCount,
            genderPreference: editItem.genderPreference as any,
            payer: editItem.payer as any,
            expectedBudget: editItem.expectedBudget,
        } : {
            date: '',
            time: '',
            purpose: '',
            message: '',
        }
    );

    const set = (field: keyof ICreatePyachokDto, value: any) =>
        setDto(prev => ({...prev, [field]: value || undefined}));

    const handleAcceptWarning = () => {
        localStorage.setItem(WARNING_KEY, 'true');
        setStep('form');
    };

    const handleSubmit = async () => {
        // Перевіряємо кожне поле окремо
        if (!dto.date) {
            setError('❌ Вкажіть дату зустрічі');
            return;
        }
        if (!dto.time) {
            setError('❌ Вкажіть час зустрічі');
            return;
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const selectedDate = new Date(dto.date);
        if (isNaN(selectedDate.getTime())) {
            setError('❌ Невірний формат дати. Використовуйте календар');
            return;
        }
        const year = selectedDate.getFullYear();
        if (year < 2020 || year > 2100) {
            setError(`❌ Невірний рік: ${year}. Оберіть реальну дату`);
            return;
        }
        if (selectedDate < today) {
            setError(`❌ Дата ${dto.date} вже в минулому. Оберіть майбутню дату`);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const payload = {
                ...dto,
                message: dto.message?.trim() || undefined,
                purpose: dto.purpose?.trim() || undefined,
            };
            if (isEditMode) {
                await pyachokService.update(editItem.id, payload);
            } else {
                await pyachokService.create(venueId, payload);
            }
            setStep('success');
        } catch (e: any) {
            const resp = e?.response?.data;
            const msg = Array.isArray(resp?.messages)
                ? resp.messages.join(', ')
                : resp?.message || 'Помилка при відправці. Спробуйте ще раз.';
            setError(msg);
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
                            <div className={css.row}>
                                <div className={css.field}>
                                    <label className={css.label}>📅 Дата *</label>
                                    <input
                                        className={`${css.input} ${error?.includes('дат') || error?.includes('рік') ? css.inputError : ''}`}
                                        type="date"
                                        min={new Date().toISOString().split('T')[0]}
                                        max="2100-12-31"
                                        value={dto.date}
                                        onChange={e => {
                                            const val = e.target.value;
                                            set('date', val);
                                            if (val) {
                                                const d = new Date(val);
                                                const yr = d.getFullYear();
                                                const today = new Date();
                                                today.setHours(0, 0, 0, 0);
                                                if (yr < 2020 || yr > 2100) {
                                                    setError(`❌ Невірний рік: ${yr}`);
                                                } else if (d < today) {
                                                    setError('❌ Дата вже в минулому');
                                                } else {
                                                    setError(null);
                                                }
                                            } else {
                                                setError(null);
                                            }
                                        }}
                                    />
                                </div>
                                <div className={css.field}>
                                    <label className={css.label}>🕐 Час *</label>
                                    <input
                                        className={`${css.input} ${error?.includes('час') ? css.inputError : ''}`}
                                        type="time"
                                        value={dto.time}
                                        onChange={e => {
                                            set('time', e.target.value);
                                            setError(null);
                                        }}
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
                                        {value: PyachokGenderEnum.ANY, label: 'Будь-яка'},
                                        {value: PyachokGenderEnum.MALE, label: '👨 Чоловіча'},
                                        {value: PyachokGenderEnum.FEMALE, label: '👩 Жіноча'},
                                    ].map(o => (
                                        <label key={o.value}
                                               className={`${css.radioBtn} ${dto.genderPreference === o.value ? css.radioBtnActive : ''}`}>
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
                                        {value: PyachokPayerEnum.ANY, label: 'Обговоримо'},
                                        {value: PyachokPayerEnum.ME, label: '👤 Я пригощаю'},
                                        {value: PyachokPayerEnum.SPLIT, label: '🤝 Поровну'},
                                        {value: PyachokPayerEnum.OTHER, label: '🎁 Мене пригощають'},
                                    ].map(o => (
                                        <label key={o.value}
                                               className={`${css.radioBtn} ${dto.payer === o.value ? css.radioBtnActive : ''}`}>
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
                                    {loading ? <span className={css.spinner}/> : '🍺 Відправити запит'}
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

export {PyachokModal};