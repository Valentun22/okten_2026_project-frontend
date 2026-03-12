import {useEffect, useCallback} from 'react';
import {useAppDispatch, useAppSelector} from '../../../hooks/useReduxHooks';
import {newsActions} from '../../../redux/slices/newsSlice';
import {NewsTypeEnum} from '../../../interfaces/INewsInterface';
import css from './News.module.css';
import {NewsCard} from "../NewsCard/NewsCard";

const TYPE_FILTERS: { label: string; value: NewsTypeEnum | null }[] = [
    {label: 'Всі', value: null},
    {label: 'Загальне', value: NewsTypeEnum.GENERAL},
    {label: 'Акції', value: NewsTypeEnum.PROMOTION},
    {label: 'Події', value: NewsTypeEnum.EVENT},
];

const News = () => {
    const dispatch = useAppDispatch();
    const {news, total, offset, limit, activeType, loading, loadingMore, error} =
        useAppSelector(state => state.news);

    const hasMore = offset < total;

    const fetchNews = useCallback((reset = false) => {
        dispatch(newsActions.setActiveType(reset ? null : activeType));
        dispatch(newsActions.getAll({
            type: activeType ?? undefined,
            offset: 0,
            limit,
        }));
    }, [dispatch, activeType, limit]);

    useEffect(() => {
        dispatch(newsActions.getAll({offset: 0, limit}));
    }, [dispatch, limit]);

    const handleTypeChange = (type: NewsTypeEnum | null) => {
        dispatch(newsActions.setActiveType(type));
        dispatch(newsActions.getAll({
            type: type ?? undefined,
            offset: 0,
            limit,
        }));
    };

    const handleLoadMore = () => {
        dispatch(newsActions.loadMore({
            type: activeType ?? undefined,
            offset,
            limit,
        }));
    };

    return (
        <div className={css.page}>
            <div className={css.hero}>
                <h1 className={css.heroTitle}>Новини</h1>
                <p className={css.heroSub}>Акції, події та оновлення від найкращих місць міста</p>
            </div>

            <div className={css.filters}>
                {TYPE_FILTERS.map(f => (
                    <button
                        key={String(f.value)}
                        className={`${css.filterBtn} ${activeType === f.value ? css.active : ''}`}
                        onClick={() => handleTypeChange(f.value)}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {loading && (
                <div className={css.skeletonGrid}>
                    {Array.from({length: 6}).map((_, i) => (
                        <div key={i} className={css.skeleton}/>
                    ))}
                </div>
            )}

            {error && !loading && (
                <div className={css.error}>
                    <p>😕 {error}</p>
                    <button className={css.retryBtn} onClick={() => fetchNews()}>Спробувати знову</button>
                </div>
            )}

            {!loading && !error && news.length === 0 && (
                <div className={css.empty}>
                    <span>📭</span>
                    <p>Новин поки немає</p>
                </div>
            )}

            {!loading && news.length > 0 && (
                <>
                    <div className={css.grid}>
                        {news.map(item => (
                            <NewsCard key={item.id} news={item}/>
                        ))}
                    </div>

                    {hasMore && (
                        <div className={css.loadMoreWrap}>
                            <button
                                className={css.loadMoreBtn}
                                onClick={handleLoadMore}
                                disabled={loadingMore}
                            >
                                {loadingMore ? (
                                    <span className={css.spinner}/>
                                ) : (
                                    `Завантажити ще (${total - offset} залишилось)`
                                )}
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export {News};