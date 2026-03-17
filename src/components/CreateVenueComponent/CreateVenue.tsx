import React, {useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {axiosInstance} from '../../services/axiosInstance.service';
import {venueService} from '../../services/venue.service';
import {urls} from '../../constants/urls';
import css from './CreateVenue.module.css';
import {toast} from "../../services/toast.service";

const CATEGORIES = [
    'restaurant', 'bar', 'cafe', 'pub', 'club', 'fast_food', 'pizzeria',
    'sushi', 'brewery', 'lounge', 'steakhouse', 'bakery', 'coffee_shop',
    'wine_bar', 'food_court', 'street_food', 'karaoke', 'hookah',
];
const CAT_LABELS: Record<string, string> = {
    restaurant: 'Ресторан', bar: 'Бар', cafe: 'Кафе', pub: 'Паб', club: 'Клуб',
    fast_food: 'Фастфуд', pizzeria: 'Піцерія', sushi: 'Суші', brewery: 'Пивоварня',
    lounge: 'Лаунж', steakhouse: 'Стейкхаус', bakery: 'Пекарня',
    coffee_shop: "Кав'ярня", wine_bar: 'Вайн-бар', food_court: 'Фудкорт',
    street_food: 'Стріт-фуд', karaoke: 'Караоке', hookah: 'Кальян',
};
const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const DAYS_UK = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];
const BOOLEANS: { key: string; label: string; icon: string }[] = [
    {key: 'hasWiFi', label: 'Wi-Fi', icon: '📶'},
    {key: 'hasParking', label: 'Паркінг', icon: '🅿️'},
    {key: 'liveMusic', label: 'Live-музика', icon: '🎵'},
    {key: 'petFriendly', label: 'Pet-friendly', icon: '🐾'},
    {key: 'hasTerrace', label: 'Тераса', icon: '☀️'},
    {key: 'smokingAllowed', label: 'Куріння', icon: '🚬'},
    {key: 'cardPayment', label: 'Картка', icon: '💳'},
];

type Step = 1 | 2 | 3 | 4;

const STEPS = [
    {n: 1, label: 'Основне'},
    {n: 2, label: 'Контакти'},
    {n: 3, label: 'Деталі'},
    {n: 4, label: 'Фото'},
];

const CreateVenue = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState<Step>(1);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [photoUploading, setPhotoUploading] = useState(false);
    const [photoError, setPhotoError] = useState('');
    const photoInputRef = useRef<HTMLInputElement>(null);
    const [galleryFiles, setGalleryFiles] = useState<{ file: File; preview: string; url?: string }[]>([]);
    const [galleryUploading, setGalleryUploading] = useState(false);
    const galleryInputRef = useRef<HTMLInputElement>(null);

    const [form, setForm] = useState({
        name: '',
        description: '',
        city: '',
        address: '',
        categories: [] as string[],
        tags: '',
        phone: '',
        email: '',
        website: '',
        instagram: '',
        facebook: '',
        telegram: '',
        averageCheck: '',
        menu: '',
        avatarVenue: '',
        workingHours: {} as Record<string, string>,
        hasWiFi: false,
        hasParking: false,
        liveMusic: false,
        petFriendly: false,
        hasTerrace: false,
        smokingAllowed: false,
        cardPayment: false,
    });

    const URL_FIELDS = ['website'];
    const setF = (k: string, v: any) => {
        const val = URL_FIELDS.includes(k) ? v.replace(/^https?:\/\//, '') : v;
        setForm(p => ({...p, [k]: val}));
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setPhotoError('');
        setPhotoUploading(true);
        try {
            const fd = new FormData();
            fd.append('photo', file);
            const {data} = await axiosInstance.post(urls.venue.uploadPhoto, fd, {
                headers: {'Content-Type': 'multipart/form-data'},
            });
            setF('avatarVenue', data.url);
        } catch {
            setPhotoError('Помилка завантаження фото');
        }
        setPhotoUploading(false);
        if (photoInputRef.current) photoInputRef.current.value = '';
    };

    const handleGallerySelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []).slice(0, 10 - galleryFiles.length);
        const newItems = files.map(file => ({file, preview: URL.createObjectURL(file)}));
        setGalleryFiles(p => [...p, ...newItems]);
        if (galleryInputRef.current) galleryInputRef.current.value = '';
    };

    const uploadGallery = async (): Promise<string[]> => {
        const notUploaded = galleryFiles.filter(g => !g.url);
        if (!notUploaded.length) return galleryFiles.map(g => g.url!).filter(Boolean);
        setGalleryUploading(true);
        const result = [...galleryFiles];
        for (let i = 0; i < result.length; i++) {
            if (result[i].url) continue;
            try {
                const fd = new FormData();
                fd.append('photo', result[i].file);
                const {data} = await axiosInstance.post(urls.venue.uploadPhoto, fd, {
                    headers: {'Content-Type': 'multipart/form-data'},
                });
                result[i] = {...result[i], url: data.url};
            } catch {
            }
        }
        setGalleryFiles(result);
        setGalleryUploading(false);
        return result.map(g => g.url!).filter(Boolean);
    };

    const toggleCategory = (c: string) =>
        setF('categories', form.categories.includes(c)
            ? form.categories.filter(x => x !== c)
            : [...form.categories, c]);

    const setHours = (day: string, v: string) =>
        setF('workingHours', {...form.workingHours, [day]: v});

    const handlePhoneChange = (raw: string) => {
        const digits = raw.replace(/\D/g, '').slice(0, 10);
        let formatted = digits;
        if (digits.length > 6) {
            formatted = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 8)}-${digits.slice(8, 10)}`;
        } else if (digits.length > 3) {
            formatted = `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
        } else if (digits.length > 0) {
            formatted = `(${digits}`;
        }
        setF('phone', formatted);
    };

    const validate = (): boolean => {
        if (!form.name.trim()) {
            setError("Вкажіть назву закладу (мін. 3 символи)");
            return false;
        }
        if (form.name.trim().length < 3) {
            setError("Назва мінімум 3 символи");
            return false;
        }
        if (!form.city.trim()) {
            setError("Вкажіть місто");
            return false;
        }
        if (!form.address.trim()) {
            setError("Вкажіть адресу");
            return false;
        }
        if (!form.description.trim()) {
            setError("Додайте опис закладу");
            return false;
        }
        if (form.categories.length === 0) {
            setError("Оберіть хоча б одну категорію");
            return false;
        }
        if (form.phone.trim()) {
            const digits = form.phone.replace(/\D/g, '');
            if (digits.length < 9 || digits.length > 13) {
                setError("Невірний номер телефону");
                return false;
            }
        }
        if (form.tags.trim()) {
            const tagList = form.tags.split(',').map(t => t.trim()).filter(Boolean);
            if (tagList.length > 5) {
                setError("Максимум 5 тегів");
                return false;
            }
            const badTag = tagList.find(t => t.length < 3 || t.length > 30);
            if (badTag) {
                setError(`Тег "${badTag}" має бути від 3 до 30 символів`);
                return false;
            }
        }
        setError('');
        return true;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        setSaving(true);
        try {
            const payload: any = {
                name: form.name.trim(),
                description: form.description.trim() || '',
                city: form.city.trim(),
                address: form.address.trim() || '',
                categories: form.categories,
                phone: (() => {
                    if (!form.phone.trim()) return undefined;
                    const digits = form.phone.replace(/\D/g, '');
                    return `+38${digits.slice(-9)}`;
                })(),
                email: form.email.trim() || undefined,
                website: form.website.trim() ? `https://${form.website.trim().replace(/^https?:\/\//, '')}` : undefined,
                averageCheck: form.averageCheck && !isNaN(Number(form.averageCheck)) ? Number(form.averageCheck) : undefined,
                menu: form.menu.trim() ? form.menu.trim().replace(/^https?:\/\//, '') : undefined,
                avatarVenue: form.avatarVenue.trim() || undefined,
                hasWiFi: form.hasWiFi || undefined,
                hasParking: form.hasParking || undefined,
                liveMusic: form.liveMusic || undefined,
                petFriendly: form.petFriendly || undefined,
                hasTerrace: form.hasTerrace || undefined,
                smokingAllowed: form.smokingAllowed || undefined,
                cardPayment: form.cardPayment || undefined,
                tags: (() => {
                    if (!form.tags.trim()) return undefined;
                    const list = form.tags.split(',').map(t => t.trim().toLowerCase()).filter(t => t.length >= 3);
                    return list.length ? list.slice(0, 5) : undefined;
                })(),
                socials: (form.instagram.trim() || form.facebook.trim() || form.telegram.trim()) ? {
                    instagram: form.instagram.trim() ? form.instagram.trim().replace(/^https?:\/\//, '') : undefined,
                    facebook: form.facebook.trim() ? form.facebook.trim().replace(/^https?:\/\//, '') : undefined,
                    telegram: form.telegram.trim() ? form.telegram.trim().replace(/^https?:\/\//, '') : undefined,
                } : undefined,
                workingHours: (() => {
                    const filled = Object.entries(form.workingHours).filter(([, v]) => v && (v as string).trim());
                    if (!filled.length) return undefined;
                    return Object.fromEntries(filled);
                })(),
            };

            const galleryUrls = await uploadGallery();
            if (galleryUrls.length) payload.image = galleryUrls;
            await venueService.create(payload);
            setSuccess(true);
            toast.success('Заклад подано на модерацію!');
        } catch (e: any) {
            const resp = e?.response?.data;
            if (Array.isArray(resp?.message)) {
                setError(resp.message.join(' | '));
            } else {
                const msg = resp?.message ?? 'Помилка при збереженні';
                setError(typeof msg === 'string' ? msg : msg.join(' | '));
                toast.error(typeof msg === 'string' ? msg : 'Помилка при збереженні');
            }
            console.error('create venue error:', resp ?? e);
        }
        setSaving(false);
    };

    if (success) {
        return (
            <div className={css.page}>
                <div className={css.container}>
                    <div className={css.successWrap}>
                        <div className={css.successIcon}>✅</div>
                        <h2 className={css.successTitle}>Заклад успішно подано!</h2>
                        <p className={css.successText}>Ваш заклад буде активований після перевірки модератором. Зазвичай
                            це займає до 24 годин.</p>
                        <div className={css.successBtns}>
                            <button className={css.btnSecondary} onClick={() => navigate('/')}>На головну</button>
                            <button className={css.btnPrimary} onClick={() => {
                                setSuccess(false);
                                setStep(1);
                                setForm({
                                    name: '',
                                    description: '',
                                    city: '',
                                    address: '',
                                    categories: [],
                                    tags: '',
                                    phone: '',
                                    email: '',
                                    website: '',
                                    averageCheck: '',
                                    menu: '',
                                    avatarVenue: '',
                                    instagram: '',
                                    facebook: '',
                                    telegram: '',
                                    hasWiFi: false,
                                    hasParking: false,
                                    liveMusic: false,
                                    petFriendly: false,
                                    hasTerrace: false,
                                    smokingAllowed: false,
                                    cardPayment: false,
                                    workingHours: {}
                                });
                            }}>Додати ще один
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={css.page}>
            <div className={css.container}>
                <div className={css.header}>
                    <h1 className={css.title}>Додати заклад</h1>
                    <p className={css.sub}>Заповніть інформацію. Заклад буде активований після модерації.</p>
                </div>

                <div className={css.stepper}>
                    {STEPS.map((s, i) => (
                        <>
                            <div key={s.n}
                                 className={`${css.stepItem} ${step === s.n ? css.stepActive : step > s.n ? css.stepDone : ''}`}>
                                <div className={css.stepCircle}>{step > s.n ? '✓' : s.n}</div>
                                <span className={css.stepLabel}>{s.label}</span>
                            </div>
                            {i < STEPS.length - 1 && (
                                <div className={`${css.stepConnector} ${step > s.n ? css.stepConnectorDone : ''}`}/>
                            )}
                        </>
                    ))}
                </div>

                <div className={css.card}>
                    {step === 1 && (
                        <div className={css.stepContent}>
                            <h2 className={css.stepTitle}>Основна інформація</h2>

                            <div className={css.field}>
                                <label className={css.label}>Назва закладу *</label>
                                <input className={css.input} placeholder="Наприклад: Ресторан «Карпати»"
                                       value={form.name} onChange={e => setF('name', e.target.value)}/>
                            </div>

                            <div className={css.field}>
                                <label className={css.label}>Опис *</label>
                                <textarea className={css.textarea} rows={4}
                                          placeholder="Розкажіть про заклад, його атмосферу, спеціалізацію..."
                                          value={form.description} onChange={e => setF('description', e.target.value)}/>
                            </div>

                            <div className={css.row}>
                                <div className={css.field}>
                                    <label className={css.label}>Місто *</label>
                                    <input className={css.input} placeholder="Львів"
                                           value={form.city} onChange={e => setF('city', e.target.value)}/>
                                </div>
                                <div className={css.field}>
                                    <label className={css.label}>Адреса *</label>
                                    <input className={css.input} placeholder="вул.Соборна, 1"
                                           value={form.address} onChange={e => setF('address', e.target.value)}/>
                                </div>
                            </div>

                            <div className={css.field}>
                                <label className={css.label}>Категорії *</label>
                                <div className={css.catGrid}>
                                    {CATEGORIES.map(c => (
                                        <button key={c} type="button"
                                                className={`${css.catBtn} ${form.categories.includes(c) ? css.catActive : ''}`}
                                                onClick={() => toggleCategory(c)}>
                                            {CAT_LABELS[c] ?? c}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className={css.field}>
                                <label className={css.label}>Теги (через кому, макс. 5, кожен 3-30 символів)</label>
                                <input className={css.input} placeholder="крафтове пиво, вегетаріанське, дитяча зона"
                                       value={form.tags} onChange={e => setF('tags', e.target.value)}/>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className={css.stepContent}>
                            <h2 className={css.stepTitle}>Контакти</h2>

                            <div className={css.row}>
                                <div className={css.field}>
                                    <label className={css.label}>Телефон</label>
                                    <input className={css.input} placeholder="(050) 000-00-00"
                                           value={form.phone} onChange={e => handlePhoneChange(e.target.value)}/>
                                </div>
                                <div className={css.field}>
                                    <label className={css.label}>Email</label>
                                    <input className={css.input} type="email" placeholder="info@gmail.ua"
                                           value={form.email} onChange={e => setF('email', e.target.value)}/>
                                </div>
                            </div>

                            <div className={css.field}>
                                <label className={css.label}>Вебсайт</label>
                                <input className={css.input} placeholder="https://zaklad.ua"
                                       value={form.website} onChange={e => setF('website', e.target.value)}/>
                            </div>

                            <div className={css.row}>
                                <div className={css.field}>
                                    <label className={css.label}>📸 Instagram</label>
                                    <input className={css.input} placeholder="instagram.com/zaklad"
                                           value={form.instagram} onChange={e => setF('instagram', e.target.value)}/>
                                </div>
                                <div className={css.field}>
                                    <label className={css.label}>👥 Facebook</label>
                                    <input className={css.input} placeholder="facebook.com/zaklad"
                                           value={form.facebook} onChange={e => setF('facebook', e.target.value)}/>
                                </div>
                            </div>

                            <div className={css.field}>
                                <label className={css.label}>✈️ Telegram</label>
                                <input className={css.input} placeholder="t.me/zaklad"
                                       value={form.telegram} onChange={e => setF('telegram', e.target.value)}/>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className={css.stepContent}>
                            <h2 className={css.stepTitle}>Деталі та особливості</h2>

                            <div className={css.row}>
                                <div className={css.field}>
                                    <label className={css.label}>💰 Середній чек (₴)</label>
                                    <input className={css.input} type="number" placeholder="300"
                                           value={form.averageCheck}
                                           onChange={e => setF('averageCheck', e.target.value)}/>
                                </div>
                                <div className={css.field}>
                                    <label className={css.label}>📋 Посилання на меню</label>
                                    <input className={css.input} placeholder="menu.zaklad.ua"
                                           value={form.menu} onChange={e => setF('menu', e.target.value)}/>
                                </div>
                            </div>

                            <div className={css.field}>
                                <label className={css.label}>Особливості</label>
                                <div className={css.boolGrid}>
                                    {BOOLEANS.map(({key, label, icon}) => (
                                        <label key={key}
                                               className={`${css.boolBtn} ${(form as any)[key] ? css.boolActive : ''}`}>
                                            <input type="checkbox" hidden
                                                   checked={(form as any)[key]}
                                                   onChange={e => setF(key, e.target.checked)}/>
                                            <span>{icon}</span>
                                            <span>{label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className={css.field}>
                                <label className={css.label}>🕐 Графік роботи</label>
                                <div className={css.hoursGrid}>
                                    {DAYS.map((d, i) => (
                                        <div key={d} className={css.hoursRow}>
                                            <span className={css.dayLabel}>{DAYS_UK[i]}</span>
                                            <input className={css.hoursInput}
                                                   placeholder="09:00–22:00"
                                                   value={form.workingHours[d] ?? ''}
                                                   onChange={e => setHours(d, e.target.value)}/>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className={css.stepContent}>
                            <h2 className={css.stepTitle}>Фото</h2>
                            <p className={css.stepDesc}>Вкажіть URL зображень. Перше буде головним фото закладу.</p>

                            <div className={css.field}>
                                <label className={css.label}>Головне фото</label>
                                <label className={css.photoUploadBtn}>
                                    {photoUploading ? '⏳ Завантаження...' : '📷 Вибрати фото'}
                                    <input ref={photoInputRef} type="file" accept="image/*"
                                           style={{display: 'none'}} onChange={handlePhotoUpload}
                                           disabled={photoUploading}/>
                                </label>
                                {photoError && <p style={{color: 'red', fontSize: 13}}>{photoError}</p>}
                            </div>

                            {form.avatarVenue && (
                                <div className={css.previewWrap}>
                                    <img src={form.avatarVenue} alt="preview" className={css.preview}/>
                                    <button type="button" onClick={() => setF('avatarVenue', '')}
                                            style={{
                                                display: 'block',
                                                marginTop: 8,
                                                fontSize: 12,
                                                color: '#c18a66',
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer'
                                            }}>
                                        ✕ Видалити фото
                                    </button>
                                </div>
                            )}

                            <div className={css.field}>
                                <label className={css.label}>Галерея (до 10 фото)</label>
                                <label className={css.photoUploadBtn}>
                                    {galleryUploading ? '⏳ Завантаження...' : '🖼 Додати фото до галереї'}
                                    <input ref={galleryInputRef} type="file" accept="image/*" multiple
                                           style={{display: 'none'}} onChange={handleGallerySelect}
                                           disabled={galleryUploading || galleryFiles.length >= 10}/>
                                </label>
                                {galleryFiles.length > 0 && (
                                    <div className={css.galleryGrid}>
                                        {galleryFiles.map((g, i) => (
                                            <div key={i} className={css.galleryItem}>
                                                <img src={g.preview} alt={`фото ${i + 1}`}/>
                                                {g.url && <span className={css.galleryUploaded}>✓</span>}
                                                <button type="button" onClick={() =>
                                                    setGalleryFiles(f => f.filter((_, j) => j !== i))
                                                }>✕
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className={css.summary}>
                                <h3 className={css.summaryTitle}>Перевірте дані</h3>
                                <div className={css.summaryGrid}>
                                    <div><span className={css.summaryKey}>Назва</span><span>{form.name}</span></div>
                                    <div><span className={css.summaryKey}>Місто</span><span>{form.city || '—'}</span>
                                    </div>
                                    <div><span className={css.summaryKey}>Категорії</span>
                                        <span>{form.categories.map(c => CAT_LABELS[c] ?? c).join(', ') || '—'}</span>
                                    </div>
                                    <div><span className={css.summaryKey}>Телефон</span><span>{form.phone || '—'}</span>
                                    </div>
                                </div>
                            </div>

                            {error && <p className={css.error}>{error}</p>}
                        </div>
                    )}

                    <div className={css.navBtns}>
                        {step > 1 && (
                            <button className={css.prevBtn} onClick={() => setStep(s => (s - 1) as Step)}>
                                ← Назад
                            </button>
                        )}
                        <div style={{flex: 1}}/>
                        {error && step < 4 && <p className={css.errorInline}>{error}</p>}
                        {step < 4 ? (
                            <button className={css.nextBtn} onClick={() => {
                                if (step === 1 && !form.name.trim()) {
                                    setError("Вкажіть назву");
                                    return;
                                }
                                setError('');
                                setStep(s => (s + 1) as Step);
                            }}>
                                Далі →
                            </button>
                        ) : (
                            <button className={css.submitBtn} onClick={handleSubmit} disabled={saving}>
                                {saving ? <span className={css.spinner}/> : '✅ Опублікувати заклад'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export {CreateVenue};