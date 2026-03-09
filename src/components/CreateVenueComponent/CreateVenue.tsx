import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { venueService } from '../../services/venue.service';
import css from './CreateVenue.module.css';

const CATEGORIES = [
    'restaurant','bar','cafe','pub','club','fast_food','pizzeria',
    'sushi','brewery','lounge','steakhouse','bakery','coffee_shop',
    'wine_bar','food_court','street_food','karaoke','hookah',
];
const CAT_LABELS: Record<string, string> = {
    restaurant:'Ресторан', bar:'Бар', cafe:'Кафе', pub:'Паб', club:'Клуб',
    fast_food:'Фастфуд', pizzeria:'Піцерія', sushi:'Суші', brewery:'Пивоварня',
    lounge:'Лаунж', steakhouse:'Стейкхаус', bakery:'Пекарня',
    coffee_shop:"Кав'ярня", wine_bar:'Вайн-бар', food_court:'Фудкорт',
    street_food:'Стріт-фуд', karaoke:'Караоке', hookah:'Кальян',
};
const DAYS = ['mon','tue','wed','thu','fri','sat','sun'];
const DAYS_UK = ['Пн','Вт','Ср','Чт','Пт','Сб','Нд'];
const BOOLEANS: { key: string; label: string; icon: string }[] = [
    { key:'hasWiFi',       label:'Wi-Fi',        icon:'📶' },
    { key:'hasParking',    label:'Паркінг',       icon:'🅿️' },
    { key:'liveMusic',     label:'Live-музика',   icon:'🎵' },
    { key:'petFriendly',   label:'Pet-friendly',  icon:'🐾' },
    { key:'hasTerrace',    label:'Тераса',        icon:'☀️' },
    { key:'smokingAllowed',label:'Куріння',       icon:'🚬' },
    { key:'cardPayment',   label:'Картка',        icon:'💳' },
];

type Step = 1 | 2 | 3 | 4;

const STEPS = [
    { n: 1, label: 'Основне' },
    { n: 2, label: 'Контакти' },
    { n: 3, label: 'Деталі' },
    { n: 4, label: 'Фото' },
];

const CreateVenue = () => {
    const navigate = useNavigate();
    const [step,  setStep]  = useState<Step>(1);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        name:          '',
        description:   '',
        city:          '',
        address:       '',
        categories:    [] as string[],
        tags:          '',
        phone:         '',
        email:         '',
        website:       '',
        instagram:     '',
        facebook:      '',
        telegram:      '',
        averageCheck:  '',
        menu:          '',
        avatarVenue:   '',
        workingHours:  {} as Record<string, string>,
        hasWiFi:        false,
        hasParking:     false,
        liveMusic:      false,
        petFriendly:    false,
        hasTerrace:     false,
        smokingAllowed: false,
        cardPayment:    false,
    });

    const setF = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));

    const toggleCategory = (c: string) =>
        setF('categories', form.categories.includes(c)
            ? form.categories.filter(x => x !== c)
            : [...form.categories, c]);

    const setHours = (day: string, v: string) =>
        setF('workingHours', { ...form.workingHours, [day]: v });

    const validate = (): boolean => {
        if (!form.name.trim())  { setError("Вкажіть назву закладу"); return false; }
        if (!form.city.trim())  { setError("Вкажіть місто");         return false; }
        if (form.categories.length === 0) { setError("Оберіть хоча б одну категорію"); return false; }
        setError('');
        return true;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        setSaving(true);
        try {
            const payload: any = {
                name:         form.name.trim(),
                description:  form.description.trim() || undefined,
                city:         form.city.trim(),
                address:      form.address.trim() || undefined,
                categories:   form.categories,
                phone:        form.phone.trim() || undefined,
                email:        form.email.trim() || undefined,
                website:      form.website.trim() || undefined,
                averageCheck: form.averageCheck ? Number(form.averageCheck) : undefined,
                menu:         form.menu.trim() || undefined,
                avatarVenue:  form.avatarVenue.trim() || undefined,
                hasWiFi:        form.hasWiFi,
                hasParking:     form.hasParking,
                liveMusic:      form.liveMusic,
                petFriendly:    form.petFriendly,
                hasTerrace:     form.hasTerrace,
                smokingAllowed: form.smokingAllowed,
                cardPayment:    form.cardPayment,
                tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : undefined,
                socials: {
                    instagram: form.instagram.trim() || undefined,
                    facebook:  form.facebook.trim()  || undefined,
                    telegram:  form.telegram.trim()  || undefined,
                },
                workingHours: Object.keys(form.workingHours).length > 0 ? form.workingHours : undefined,
            };

            const { data } = await venueService.create(payload);
            navigate(`/venues/${data.id}`);
        } catch (e: any) {
            setError(e?.response?.data?.message ?? 'Помилка при збереженні');
        }
        setSaving(false);
    };

    return (
        <div className={css.page}>
            <div className={css.container}>
                <div className={css.header}>
                    <h1 className={css.title}>Додати заклад</h1>
                    <p className={css.sub}>Заповніть інформацію. Заклад буде активований після модерації.</p>
                </div>

                <div className={css.stepper}>
                    {STEPS.map(s => (
                        <div key={s.n} className={`${css.stepItem} ${step === s.n ? css.stepActive : step > s.n ? css.stepDone : ''}`}>
                            <div className={css.stepCircle}>{step > s.n ? '✓' : s.n}</div>
                            <span className={css.stepLabel}>{s.label}</span>
                        </div>
                    ))}
                </div>

                <div className={css.card}>
                    {step === 1 && (
                        <div className={css.stepContent}>
                            <h2 className={css.stepTitle}>Основна інформація</h2>

                            <div className={css.field}>
                                <label className={css.label}>Назва закладу *</label>
                                <input className={css.input} placeholder="Наприклад: Ресторан «Карпати»"
                                       value={form.name} onChange={e => setF('name', e.target.value)} />
                            </div>

                            <div className={css.field}>
                                <label className={css.label}>Опис</label>
                                <textarea className={css.textarea} rows={4}
                                          placeholder="Розкажіть про заклад, його атмосферу, спеціалізацію..."
                                          value={form.description} onChange={e => setF('description', e.target.value)} />
                            </div>

                            <div className={css.row}>
                                <div className={css.field}>
                                    <label className={css.label}>Місто *</label>
                                    <input className={css.input} placeholder="Львів"
                                           value={form.city} onChange={e => setF('city', e.target.value)} />
                                </div>
                                <div className={css.field}>
                                    <label className={css.label}>Адреса</label>
                                    <input className={css.input} placeholder="вул.Соборна, 1"
                                           value={form.address} onChange={e => setF('address', e.target.value)} />
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
                                <label className={css.label}>Теги (через кому)</label>
                                <input className={css.input} placeholder="крафтове пиво, вегетаріанське, дитяча зона"
                                       value={form.tags} onChange={e => setF('tags', e.target.value)} />
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className={css.stepContent}>
                            <h2 className={css.stepTitle}>Контакти</h2>

                            <div className={css.row}>
                                <div className={css.field}>
                                    <label className={css.label}>Телефон</label>
                                    <input className={css.input} placeholder="+38 (050) 000-00-00"
                                           value={form.phone} onChange={e => setF('phone', e.target.value)} />
                                </div>
                                <div className={css.field}>
                                    <label className={css.label}>Email</label>
                                    <input className={css.input} type="email" placeholder="info@gmail.ua"
                                           value={form.email} onChange={e => setF('email', e.target.value)} />
                                </div>
                            </div>

                            <div className={css.field}>
                                <label className={css.label}>Вебсайт</label>
                                <input className={css.input} placeholder="https://zaklad.ua"
                                       value={form.website} onChange={e => setF('website', e.target.value)} />
                            </div>

                            <div className={css.row}>
                                <div className={css.field}>
                                    <label className={css.label}>📸 Instagram</label>
                                    <input className={css.input} placeholder="https://instagram.com/zaklad"
                                           value={form.instagram} onChange={e => setF('instagram', e.target.value)} />
                                </div>
                                <div className={css.field}>
                                    <label className={css.label}>👥 Facebook</label>
                                    <input className={css.input} placeholder="https://facebook.com/zaklad"
                                           value={form.facebook} onChange={e => setF('facebook', e.target.value)} />
                                </div>
                            </div>

                            <div className={css.field}>
                                <label className={css.label}>✈️ Telegram</label>
                                <input className={css.input} placeholder="https://t.me/zaklad"
                                       value={form.telegram} onChange={e => setF('telegram', e.target.value)} />
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
                                           value={form.averageCheck} onChange={e => setF('averageCheck', e.target.value)} />
                                </div>
                                <div className={css.field}>
                                    <label className={css.label}>📋 Посилання на меню</label>
                                    <input className={css.input} placeholder="https://menu.zaklad.ua"
                                           value={form.menu} onChange={e => setF('menu', e.target.value)} />
                                </div>
                            </div>

                            <div className={css.field}>
                                <label className={css.label}>Особливості</label>
                                <div className={css.boolGrid}>
                                    {BOOLEANS.map(({ key, label, icon }) => (
                                        <label key={key} className={`${css.boolBtn} ${(form as any)[key] ? css.boolActive : ''}`}>
                                            <input type="checkbox" hidden
                                                   checked={(form as any)[key]}
                                                   onChange={e => setF(key, e.target.checked)} />
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
                                                   onChange={e => setHours(d, e.target.value)} />
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
                                <label className={css.label}>Головне фото (URL)</label>
                                <input className={css.input} placeholder="https://example.com/photo.jpg"
                                       value={form.avatarVenue} onChange={e => setF('avatarVenue', e.target.value)} />
                            </div>

                            {form.avatarVenue && (
                                <div className={css.previewWrap}>
                                    <img src={form.avatarVenue} alt="preview" className={css.preview}
                                         onError={e => (e.currentTarget.style.display = 'none')} />
                                </div>
                            )}

                            <div className={css.summary}>
                                <h3 className={css.summaryTitle}>Перевірте дані</h3>
                                <div className={css.summaryGrid}>
                                    <div><span className={css.summaryKey}>Назва</span><span>{form.name}</span></div>
                                    <div><span className={css.summaryKey}>Місто</span><span>{form.city || '—'}</span></div>
                                    <div><span className={css.summaryKey}>Категорії</span>
                                        <span>{form.categories.map(c => CAT_LABELS[c] ?? c).join(', ') || '—'}</span>
                                    </div>
                                    <div><span className={css.summaryKey}>Телефон</span><span>{form.phone || '—'}</span></div>
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
                        <div style={{ flex: 1 }} />
                        {error && step < 4 && <p className={css.errorInline}>{error}</p>}
                        {step < 4 ? (
                            <button className={css.nextBtn} onClick={() => { if (step === 1 && !form.name.trim()) { setError("Вкажіть назву"); return; } setError(''); setStep(s => (s + 1) as Step); }}>
                                Далі →
                            </button>
                        ) : (
                            <button className={css.submitBtn} onClick={handleSubmit} disabled={saving}>
                                {saving ? <span className={css.spinner} /> : '✅ Опублікувати заклад'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export { CreateVenue };