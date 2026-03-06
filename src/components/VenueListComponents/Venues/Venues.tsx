import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../hooks/useReduxHooks';
import { venuesActions } from '../../../redux/slices/venuesSlice';
import { Venue } from '../Venue/Venue';
import css from './Venues.module.css';

const LIMIT = 12;

const Venues = () => {
    const { venues, loading, error } = useAppSelector(state => state.venues);
    const dispatch  = useAppDispatch();
    const [page, setPage] = useState(1);

    useEffect(() => {
        dispatch(venuesActions.getAll(page));
    }, [dispatch, page]);

    return (
        <div className={css.wrap}>
            <div className={css.headerRow}>
                <h2 className={css.title}>Всі заклади</h2>
                <span className={css.count}>{venues.length > 0 ? `${venues.length}+ закладів` : ''}</span>
            </div>

            {loading && (
                <div className={css.grid}>
                    {Array.from({ length: LIMIT }).map((_, i) => (
                        <div key={i} className={css.skeleton} />
                    ))}
                </div>
            )}

            {error && !loading && (
                <div className={css.state}>
                    <span>😕</span>
                    <p>{error}</p>
                    <button className={css.retryBtn} onClick={() => dispatch(venuesActions.getAll(page))}>
                        Спробувати знову
                    </button>
                </div>
            )}

            {!loading && venues.length === 0 && !error && (
                <div className={css.state}>
                    <span>🏗</span>
                    <p>Заклади ще не додані</p>
                </div>
            )}

            {!loading && venues.length > 0 && (
                <div className={css.grid}>
                    {venues.map(v => <Venue key={v.id} venue={v} />)}
                </div>
            )}

            {!loading && venues.length >= LIMIT && (
                <div className={css.pagination}>
                    <button className={css.pageBtn} disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                        ← Попередня
                    </button>
                    <span className={css.pageNum}>Сторінка {page}</span>
                    <button className={css.pageBtn} onClick={() => setPage(p => p + 1)}>
                        Наступна →
                    </button>
                </div>
            )}
        </div>
    );
};

export { Venues };