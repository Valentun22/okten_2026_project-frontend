import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../hooks/useReduxHooks';
import { topActions } from '../../../redux/slices/topSlice';
import { TopVenueCard } from '../TopVenueCard/TopVenueCard';
import css from './TopVenues.module.css';

const TopVenues = () => {
    const dispatch = useAppDispatch();
    const { categories, activeSlug, activeCategory, loadingList, loadingVenues, error } =
        useAppSelector(state => state.top);

    useEffect(() => {
        dispatch(topActions.getCategories());
    }, [dispatch]);

    useEffect(() => {
        const firstActive = categories.find(c => c.isActive);
        if (firstActive && !activeSlug) {
            dispatch(topActions.setActiveSlug(firstActive.slug));
            dispatch(topActions.getCategoryBySlug(firstActive.slug));
        }
    }, [categories]);

    const handleTabClick = (slug: string) => {
        dispatch(topActions.setActiveSlug(slug));
        dispatch(topActions.getCategoryBySlug(slug));
    };

    return (
        <div className={css.page}>
            <div className={css.hero}>
                <div className={css.heroLabel}>Топ рейтинг</div>
                <h1 className={css.heroTitle}>Найкращі заклади</h1>
                <p className={css.heroSub}>Куровані підбірки від нашої редакції</p>
            </div>

            {loadingList ? (
                <div className={css.tabsSkeleton}>
                    {Array.from({ length: 4 }).map((_, i) => <div key={i} className={css.tabSkeleton} />)}
                </div>
            ) : (
                <div className={css.tabs}>
                    {categories.filter(c => c.isActive).map(cat => (
                        <button
                            key={cat.slug}
                            className={`${css.tab} ${activeSlug === cat.slug ? css.tabActive : ''}`}
                            onClick={() => handleTabClick(cat.slug)}
                        >
                            {cat.title}
                        </button>
                    ))}
                </div>
            )}

            {error && !loadingVenues && (
                <div className={css.state}><span>😕</span><p>{error}</p></div>
            )}

            {loadingVenues ? (
                <div className={css.list}>
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className={css.skeleton} />
                    ))}
                </div>
            ) : activeCategory ? (
                <>
                    <div className={css.categoryHeader}>
                        <h2 className={css.categoryTitle}>{activeCategory.category.title}</h2>
                        <span className={css.categoryCount}>
                            {activeCategory.venues.length} закладів
                        </span>
                    </div>

                    {activeCategory.venues.length === 0 ? (
                        <div className={css.state}>
                            <span>🏗</span>
                            <p>У цій категорії поки немає закладів</p>
                        </div>
                    ) : (
                        <div className={css.list}>
                            {activeCategory.venues.map((venue, i) => (
                                <TopVenueCard key={venue.id} venue={venue as any} rank={i + 1} />
                            ))}
                        </div>
                    )}
                </>
            ) : null}
        </div>
    );
};

export { TopVenues };