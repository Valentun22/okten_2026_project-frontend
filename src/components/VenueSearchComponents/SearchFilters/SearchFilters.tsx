import { useState } from 'react';
import { IVenueSearchQuery, SortOrderEnum, VenueCategoryEnum, VenueSortByEnum } from '../../../interfaces/IVenueSearchInterface';
import css from './SearchFilters.module.css';

type Props = {
    query:    IVenueSearchQuery;
    onApply:  (q: IVenueSearchQuery) => void;
    onReset:  () => void;
};

const CATEGORIES = Object.values(VenueCategoryEnum);
const CATEGORY_LABELS: Record<VenueCategoryEnum, string> = {
    restaurant:'Ресторан', bar:'Бар', cafe:'Кафе', pub:'Паб',
    club:'Клуб', fast_food:'Фастфуд', pizzeria:'Піцерія', sushi:'Суші',
    brewery:'Пивоварня', lounge:'Лаунж', steakhouse:'Стейкхаус',
    bakery:'Пекарня', coffee_shop:'Кавʼярня', wine_bar:'Вайн-бар',
    food_court:'Фудкорт', street_food:'Стріт-фуд', karaoke:'Караоке', hookah:'Кальян',
};

const FEATURES: { key: keyof IVenueSearchQuery; label: string }[] = [
    { key: 'hasWiFi',       label: '📶 Wi-Fi' },
    { key: 'hasParking',    label: '🅿️ Паркінг' },
    { key: 'liveMusic',     label: '🎵 Live-музика' },
    { key: 'petFriendly',   label: '🐾 Pet-friendly' },
    { key: 'hasTerrace',    label: '☀️ Тераса' },
    { key: 'smokingAllowed',label: '🚬 Куріння' },
    { key: 'cardPayment',   label: '💳 Картка' },
];

const SearchFilters = ({ query, onApply, onReset }: Props) => {
    const [local, setLocal] = useState<IVenueSearchQuery>(query);
    const [open, setOpen] = useState(false);

    const toggleCategory = (c: VenueCategoryEnum) => {
        const cats = local.categories ?? [];
        setLocal(prev => ({
            ...prev,
            categories: cats.includes(c) ? cats.filter(x => x !== c) : [...cats, c],
        }));
    };

    const toggleFeature = (key: keyof IVenueSearchQuery) => {
        setLocal(prev => ({ ...prev, [key]: prev[key] ? undefined : true }));
    };

    const handleApply = () => { onApply(local); setOpen(false); };
    const handleReset = () => { setLocal({}); onReset(); setOpen(false); };

    const activeCount = [
        local.categories?.length,
        local.averageCheckFrom, local.averageCheckTo,
        local.ratingFrom, local.ratingTo,
        ...FEATURES.map(f => local[f.key]),
    ].filter(Boolean).length;

    return (
        <div className={css.wrap}>
            <button className={`${css.toggleBtn} ${open ? css.open : ''}`} onClick={() => setOpen(v => !v)}>
                ⚙ Фільтри {activeCount > 0 && <span className={css.badge}>{activeCount}</span>}
            </button>

            {open && (
                <div className={css.panel}>
                    <div className={css.section}>
                        <p className={css.label}>Сортування</p>
                        <div className={css.row}>
                            <select className={css.select}
                                    value={local.sortBy ?? VenueSortByEnum.CREATED}
                                    onChange={e => setLocal(p => ({ ...p, sortBy: e.target.value as VenueSortByEnum }))}>
                                <option value={VenueSortByEnum.CREATED}>Нові</option>
                                <option value={VenueSortByEnum.RATING}>Рейтинг</option>
                                <option value={VenueSortByEnum.AVERAGE_CHECK}>Середній чек</option>
                                <option value={VenueSortByEnum.NAME}>Назва</option>
                            </select>
                            <select className={css.select}
                                    value={local.sortOrder ?? SortOrderEnum.DESC}
                                    onChange={e => setLocal(p => ({ ...p, sortOrder: e.target.value as SortOrderEnum }))}>
                                <option value={SortOrderEnum.DESC}>↓ Спад</option>
                                <option value={SortOrderEnum.ASC}>↑ Зріст</option>
                            </select>
                        </div>
                    </div>

                    <div className={css.section}>
                        <p className={css.label}>Категорія</p>
                        <div className={css.chips}>
                            {CATEGORIES.map(c => (
                                <button key={c}
                                        className={`${css.chip} ${local.categories?.includes(c) ? css.chipActive : ''}`}
                                        onClick={() => toggleCategory(c)}>
                                    {CATEGORY_LABELS[c]}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={css.section}>
                        <p className={css.label}>Середній чек (₴)</p>
                        <div className={css.row}>
                            <input className={css.input} type="number" placeholder="від"
                                   value={local.averageCheckFrom ?? ''}
                                   onChange={e => setLocal(p => ({ ...p, averageCheckFrom: +e.target.value || undefined }))} />
                            <input className={css.input} type="number" placeholder="до"
                                   value={local.averageCheckTo ?? ''}
                                   onChange={e => setLocal(p => ({ ...p, averageCheckTo: +e.target.value || undefined }))} />
                        </div>
                    </div>

                    <div className={css.section}>
                        <p className={css.label}>Рейтинг (1–10)</p>
                        <div className={css.row}>
                            <input className={css.input} type="number" min={1} max={10} placeholder="від"
                                   value={local.ratingFrom ?? ''}
                                   onChange={e => setLocal(p => ({ ...p, ratingFrom: +e.target.value || undefined }))} />
                            <input className={css.input} type="number" min={1} max={10} placeholder="до"
                                   value={local.ratingTo ?? ''}
                                   onChange={e => setLocal(p => ({ ...p, ratingTo: +e.target.value || undefined }))} />
                        </div>
                    </div>

                    <div className={css.section}>
                        <p className={css.label}>Особливості</p>
                        <div className={css.chips}>
                            {FEATURES.map(({ key, label }) => (
                                <button key={key}
                                        className={`${css.chip} ${local[key] ? css.chipActive : ''}`}
                                        onClick={() => toggleFeature(key)}>
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={css.actions}>
                        <button className={css.resetBtn} onClick={handleReset}>Скинути</button>
                        <button className={css.applyBtn} onClick={handleApply}>Застосувати</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export { SearchFilters };