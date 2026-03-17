import {useEffect, useState} from 'react';
import {useAppDispatch, useAppSelector} from '../../../hooks/useReduxHooks';
import {venuesActions} from '../../../redux/slices/venuesSlice';
import {Venue} from '../Venue/Venue';
import css from './Venues.module.css';

const LIMIT = 12;

const Venues = () => {
    const {venues, loading, error, total} = useAppSelector(state => state.venues);
    const dispatch = useAppDispatch();
    const [page, setPage] = useState(1);

    useEffect(() => {
        dispatch(venuesActions.getAll({page, limit: LIMIT}));
    }, [dispatch, page]);

    return (
        <div className={css.wrap}>
            <div className={css.headerRow}>
                <h2 className={css.title}>Всі заклади</h2>
                <span className={css.count}>{total > 0 ? `${total} закладів` : ''}</span>
            </div>

            {loading && (
                <div className={css.grid}>
                    {Array.from({length: LIMIT}).map((_, i) => (
                        <div key={i} className={css.skeleton}/>
                    ))}
                </div>
            )}

            {error && !loading && (
                <div className={css.state}>
                    <span>😕</span>
                    <p>{error}</p>
                    <button className={css.retryBtn}
                            onClick={() => dispatch(venuesActions.getAll({page, limit: LIMIT}))}>
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
                    {venues.map(v => <Venue key={v.id} venue={v}/>)}
                </div>
            )}

            {!loading && total > LIMIT && (
                <div className={css.pagination}>
                    <button className={css.pageBtn} disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                        ← Попередня
                    </button>
                    <span className={css.pageNum}>Сторінка {page} / {Math.ceil(total / LIMIT)}</span>
                    <button className={css.pageBtn} disabled={page >= Math.ceil(total / LIMIT)}
                            onClick={() => setPage(p => p + 1)}>
                        Наступна →
                    </button>
                </div>
            )}
        </div>
    );
};

export {Venues};