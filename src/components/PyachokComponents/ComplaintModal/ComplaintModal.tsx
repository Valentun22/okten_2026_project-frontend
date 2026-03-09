import { FC, useState } from 'react';
import { axiosInstance } from '../../../services/axiosInstance.service';
import { urls } from '../../../constants/urls';
import css from './ComplaintModal.module.css';

export enum ComplaintTypeEnum {
    VENUE   = 'venue',
    NEWS    = 'news',
    COMMENT = 'comment',
    OTHER   = 'other',
}

interface IProps {
    venueId:   string;
    venueName: string;
    onClose:   () => void;
}

const TYPE_OPTIONS = [
    { value: ComplaintTypeEnum.VENUE,   label: '🏠 На заклад' },
    { value: ComplaintTypeEnum.OTHER,   label: '🔹 Інше' },
];

const ComplaintModal: FC<IProps> = ({ venueId, venueName, onClose }) => {
    const [type,      setType]      = useState<ComplaintTypeEnum>(ComplaintTypeEnum.VENUE);
    const [reason,    setReason]    = useState('');
    const [loading,   setLoading]   = useState(false);
    const [error,     setError]     = useState('');
    const [success,   setSuccess]   = useState(false);

    const handleSubmit = async () => {
        if (reason.trim().length < 5) { setError('Опишіть проблему детальніше (мінімум 5 символів)'); return; }
        setError('');
        setLoading(true);
        try {
            await axiosInstance.post(urls.complaint.create(venueId), { type, reason: reason.trim() });
            setSuccess(true);
        } catch (e: any) {
            setError(e?.response?.data?.message ?? 'Помилка при надсиланні скарги');
        }
        setLoading(false);
    };

    return (
        <div className={css.overlay} onClick={onClose}>
            <div className={css.modal} onClick={e => e.stopPropagation()}>
                <button className={css.closeBtn} onClick={onClose}>✕</button>

                {success ? (
                    <div className={css.success}>
                        <div className={css.successIcon}>✅</div>
                        <h2>Скаргу надіслано</h2>
                        <p>Дякуємо! Ми розглянемо вашу скаргу якнайшвидше.</p>
                        <button className={css.doneBtn} onClick={onClose}>Закрити</button>
                    </div>
                ) : (
                    <>
                        <div className={css.header}>
                            <h2 className={css.title}>⚠️ Поскаржитися</h2>
                            <p className={css.sub}>{venueName}</p>
                        </div>

                        <div className={css.field}>
                            <label className={css.label}>Тип скарги</label>
                            <div className={css.typeRow}>
                                {TYPE_OPTIONS.map(({ value, label }) => (
                                    <button key={value}
                                            className={`${css.typeBtn} ${type === value ? css.typeActive : ''}`}
                                            onClick={() => setType(value)}>
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className={css.field}>
                            <label className={css.label}>Опишіть проблему *</label>
                            <textarea className={css.textarea} rows={5}
                                      placeholder="Розкажіть детально про проблему..."
                                      value={reason} onChange={e => setReason(e.target.value)} />
                            <span className={css.counter}>{reason.length} / 2000</span>
                        </div>

                        {error && <p className={css.error}>{error}</p>}

                        <div className={css.actions}>
                            <button className={css.cancelBtn} onClick={onClose}>Скасувати</button>
                            <button className={css.submitBtn} onClick={handleSubmit} disabled={loading}>
                                {loading ? <span className={css.spinner} /> : 'Надіслати скаргу'}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export { ComplaintModal };