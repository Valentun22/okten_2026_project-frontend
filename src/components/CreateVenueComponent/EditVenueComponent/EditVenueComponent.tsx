import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import css from '../../CreateVenueComponent/CreateVenue.module.css';
import {venueService} from "../../../services/venue.service";

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
const BOOLEANS = [
    { key:'hasWiFi',       label:'Wi-Fi',        icon:'📶' },
    { key:'hasParking',    label:'Паркінг',       icon:'🅿️' },
    { key:'liveMusic',     label:'Live-музика',   icon:'🎵' },
    { key:'petFriendly',   label:'Pet-friendly',  icon:'🐾' },
    { key:'hasTerrace',    label:'Тераса',        icon:'☀️' },
    { key:'smokingAllowed',label:'Куріння',       icon:'🚬' },
    { key:'cardPayment',   label:'Картка',        icon:'💳' },
];

const EditVenueComponent = () => {
    const { id }    = useParams<{ id: string }>();
    const navigate  = useNavigate();
    const [loading, setLoading]  = useState(true);
    const [saving,  setSaving]   = useState(false);
    const [error,   setError]    = useState('');
    const [success, setSuccess]  = useState(false);

    const [form, setForm] = useState({
        name: '', description: '', city: '', address: '',
        categories: [] as string[], tags: '',
        phone: '', email: '', website: '',
        instagram: '', facebook: '', telegram: '',
        averageCheck: '', menu: '', avatarVenue: '',
        workingHours: {} as Record<string, string>,
        hasWiFi: false, hasParking: false, liveMusic: false,
        petFriendly: false, hasTerrace: false, smokingAllowed: false, cardPayment: false,
    });

    const setF = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));
    const toggleCat = (c: string) =>
        setF('categories', form.categories.includes(c)
            ? form.categories.filter(x => x !== c)
            : [...form.categories, c]);
    const setHours = (day: string, v: string) =>
        setF('workingHours', { ...form.workingHours, [day]: v });

    useEffect(() => {
        if (!id) return;
        venueService.getByVenueId(id).then(({ data }) => {
            const v = data as any;
            setForm({
                name:         v.name ?? '',
                description:  v.description ?? '',
                city:         v.city ?? '',
                address:      v.address ?? '',
                categories:   (v.categories ?? []).map((c: any) => c?.name ?? c),
                tags:         (v.tags ?? []).map((t: any) => t?.name ?? t).join(', '),
                phone:        v.phone ?? '',
                email:        v.email ?? '',
                website:      v.website ?? '',
                instagram:    v.socials?.instagram ?? '',
                facebook:     v.socials?.facebook  ?? '',
                telegram:     v.socials?.telegram  ?? '',
                averageCheck: v.averageCheck ? String(v.averageCheck) : '',
                menu:         v.menu ?? '',
                avatarVenue:  v.avatarVenue ?? '',
                workingHours: v.workingHours ?? {},
                hasWiFi:        !!v.hasWiFi,
                hasParking:     !!v.hasParking,
                liveMusic:      !!v.liveMusic,
                petFriendly:    !!v.petFriendly,
                hasTerrace:     !!v.hasTerrace,
                smokingAllowed: !!v.smokingAllowed,
                cardPayment:    !!v.cardPayment,
            });
        }).catch(() => setError('Не вдалося завантажити заклад'))
            .finally(() => setLoading(false));
    }, [id]);

    const handleSave = async () => {
        if (!form.name.trim()) { setError("Вкажіть назву"); return; }
        if (!form.city.trim()) { setError("Вкажіть місто");  return; }
        setError(''); setSaving(true);
        try {
            const payload: any = {
                name: form.name.trim(), description: form.description.trim() || undefined,
                city: form.city.trim(), address: form.address.trim() || undefined,
                categories: form.categories, phone: form.phone.trim() || undefined,
                email: form.email.trim() || undefined, website: form.website.trim() || undefined,
                averageCheck: form.averageCheck ? Number(form.averageCheck) : undefined,
                menu: form.menu.trim() || undefined, avatarVenue: form.avatarVenue.trim() || undefined,
                hasWiFi: form.hasWiFi, hasParking: form.hasParking, liveMusic: form.liveMusic,
                petFriendly: form.petFriendly, hasTerrace: form.hasTerrace,
                smokingAllowed: form.smokingAllowed, cardPayment: form.cardPayment,
                tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : undefined,
                socials: { instagram: form.instagram || undefined, facebook: form.facebook || undefined, telegram: form.telegram || undefined },
                workingHours: Object.keys(form.workingHours).length > 0 ? form.workingHours : undefined,
            };
            await venueService.update(id!, payload);
            setSuccess(true);
            setTimeout(() => navigate(`/venues/${id}`), 1500);
        } catch (e: any) {
            setError(e?.response?.data?.message ?? 'Помилка при збереженні');
        }
        setSaving(false);
    };

    if (loading) return (
        <div style={{ padding: '60px', textAlign: 'center', color: '#888' }}>
            Завантаження...
        </div>
    );

    return (
        <div className={css.page}>
            <div className={css.container}>
                <div className={css.header}>
                    <h1 className={css.title}>Редагувати заклад</h1>
                    <button style={{ background:'none', border:'none', cursor:'pointer', color:'#888', fontSize:'14px' }}
                            onClick={() => navigate(`/venues/${id}`)}>
                        ← Назад до закладу
                    </button>
                </div>

                {success && (
                    <div style={{ background:'#f0fdf4', border:'1.5px solid #86efac', borderRadius:'12px', padding:'16px 20px', marginBottom:'20px', color:'#16a34a', fontWeight:700 }}>
                        ✅ Зміни збережено! Перенаправлення...
                    </div>
                )}

                <div className={css.card}>
                    <div className={css.stepContent}>
                        <h2 className={css.stepTitle}>Основна інформація</h2>

                        <div className={css.field}>
                            <label className={css.label}>Назва *</label>
                            <input className={css.input} value={form.name} onChange={e => setF('name', e.target.value)} />
                        </div>
                        <div className={css.field}>
                            <label className={css.label}>Опис</label>
                            <textarea className={css.textarea} rows={4} value={form.description} onChange={e => setF('description', e.target.value)} />
                        </div>
                        <div className={css.row}>
                            <div className={css.field}>
                                <label className={css.label}>Місто *</label>
                                <input className={css.input} value={form.city} onChange={e => setF('city', e.target.value)} />
                            </div>
                            <div className={css.field}>
                                <label className={css.label}>Адреса</label>
                                <input className={css.input} value={form.address} onChange={e => setF('address', e.target.value)} />
                            </div>
                        </div>

                        <div className={css.field}>
                            <label className={css.label}>Категорії</label>
                            <div className={css.catGrid}>
                                {CATEGORIES.map(c => (
                                    <button key={c} type="button"
                                            className={`${css.catBtn} ${form.categories.includes(c) ? css.catActive : ''}`}
                                            onClick={() => toggleCat(c)}>
                                        {CAT_LABELS[c] ?? c}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className={css.field}>
                            <label className={css.label}>Теги (через кому)</label>
                            <input className={css.input} value={form.tags} onChange={e => setF('tags', e.target.value)} />
                        </div>

                        <h2 className={css.stepTitle} style={{ marginTop: '28px' }}>Контакти</h2>
                        <div className={css.row}>
                            <div className={css.field}>
                                <label className={css.label}>Телефон</label>
                                <input className={css.input} value={form.phone} onChange={e => setF('phone', e.target.value)} />
                            </div>
                            <div className={css.field}>
                                <label className={css.label}>Email</label>
                                <input className={css.input} type="email" value={form.email} onChange={e => setF('email', e.target.value)} />
                            </div>
                        </div>
                        <div className={css.field}>
                            <label className={css.label}>Вебсайт</label>
                            <input className={css.input} value={form.website} onChange={e => setF('website', e.target.value)} />
                        </div>
                        <div className={css.row}>
                            <div className={css.field}>
                                <label className={css.label}>📸 Instagram</label>
                                <input className={css.input} value={form.instagram} onChange={e => setF('instagram', e.target.value)} />
                            </div>
                            <div className={css.field}>
                                <label className={css.label}>👥 Facebook</label>
                                <input className={css.input} value={form.facebook} onChange={e => setF('facebook', e.target.value)} />
                            </div>
                        </div>
                        <div className={css.field}>
                            <label className={css.label}>✈️ Telegram</label>
                            <input className={css.input} value={form.telegram} onChange={e => setF('telegram', e.target.value)} />
                        </div>

                        <h2 className={css.stepTitle} style={{ marginTop: '28px' }}>Деталі</h2>
                        <div className={css.row}>
                            <div className={css.field}>
                                <label className={css.label}>💰 Середній чек (₴)</label>
                                <input className={css.input} type="number" value={form.averageCheck} onChange={e => setF('averageCheck', e.target.value)} />
                            </div>
                            <div className={css.field}>
                                <label className={css.label}>📋 Меню (URL)</label>
                                <input className={css.input} value={form.menu} onChange={e => setF('menu', e.target.value)} />
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
                                        <span>{icon}</span> <span>{label}</span>
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
                                        <input className={css.hoursInput} placeholder="09:00–22:00"
                                               value={form.workingHours[d] ?? ''}
                                               onChange={e => setHours(d, e.target.value)} />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <h2 className={css.stepTitle} style={{ marginTop: '28px' }}>Головне фото</h2>
                        <div className={css.field}>
                            <label className={css.label}>URL фото</label>
                            <input className={css.input} value={form.avatarVenue} onChange={e => setF('avatarVenue', e.target.value)} />
                        </div>
                        {form.avatarVenue && (
                            <div className={css.previewWrap}>
                                <img src={form.avatarVenue} alt="preview" className={css.preview}
                                     onError={e => (e.currentTarget.style.display = 'none')} />
                            </div>
                        )}
                    </div>

                    <div className={css.navBtns}>
                        <button className={css.prevBtn} onClick={() => navigate(`/venues/${id}`)}>Скасувати</button>
                        <div style={{ flex: 1 }} />
                        {error && <p className={css.errorInline}>{error}</p>}
                        <button className={css.submitBtn} onClick={handleSave} disabled={saving}>
                            {saving ? <span className={css.spinner} /> : '💾 Зберегти зміни'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export { EditVenueComponent };