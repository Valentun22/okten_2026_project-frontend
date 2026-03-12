import {useState, useEffect, useCallback} from 'react';
import {useSearchParams} from 'react-router-dom';
import {useAppDispatch, useAppSelector} from '../../../hooks/useReduxHooks';
import {venueSearchActions} from '../../../redux/slices/venueSearchSlice';
import {IVenueSearchQuery, SortOrderEnum, VenueSortByEnum} from '../../../interfaces/IVenueSearchInterface';
import css from './SearchVenue.module.css';
import {SearchFilters} from "../SearchFilters/SearchFilters";
import {VenueSearchCard} from "../VenueSearchCard/VenueSearchCard";

const SearchVenue = () => {
    const dispatch = useAppDispatch();
    const [searchParams] = useSearchParams();
    const {venues, total, offset, limit, query, loading, loadingMore, error} =
        useAppSelector(state => state.venueSearch);

    const [inputValue, setInputValue] = useState(query.search ?? '');
    const hasMore = offset < total;

    useEffect(() => {
        const tagFromUrl = searchParams.get('tag');
        if (tagFromUrl) {
            const q: IVenueSearchQuery = {tag: tagFromUrl, offset: 0};
            dispatch(venueSearchActions.setQuery(q));
            dispatch(venueSearchActions.search(q));
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (inputValue.trim()) {
                const q = {...query, search: inputValue.trim(), offset: 0};
                dispatch(venueSearchActions.setQuery(q));
                dispatch(venueSearchActions.search(q));
            } else if (!inputValue) {
                dispatch(venueSearchActions.resetSearch());
            }
        }, 400);
        return () => clearTimeout(timer);
    }, [inputValue]);

    const handleFiltersApply = useCallback((filters: IVenueSearchQuery) => {
        const q = {...filters, search: inputValue || undefined, offset: 0, limit};
        dispatch(venueSearchActions.setQuery(q));
        dispatch(venueSearchActions.search(q));
    }, [dispatch, inputValue, limit]);

    const handleFiltersReset = () => {
        dispatch(venueSearchActions.resetSearch());
        setInputValue('');
    };

    const handleLoadMore = () => {
        dispatch(venueSearchActions.loadMore({...query, offset, limit}));
    };

    const defaultQuery: IVenueSearchQuery = {
        sortBy: VenueSortByEnum.CREATED,
        sortOrder: SortOrderEnum.DESC,
        ...query,
    };

    return (
        <div className={css.page}>
            <div className={css.hero}>
                <h1 className={css.title}>Знайди своє місце</h1>
                <p className={css.sub}>Ресторани, бари, кафе та інші заклади поруч із тобою</p>
            </div>

            <div className={css.searchRow}>
                <div className={css.searchBox}>
                    <span className={css.searchIcon}>🔍</span>
                    <input
                        className={css.input}
                        type="text"
                        placeholder="Назва закладу, тег, місто..."
                        value={inputValue}
                        onChange={e => setInputValue(e.target.value)}
                        autoFocus
                    />
                    {inputValue && (
                        <button className={css.clearBtn} onClick={() => {
                            setInputValue('');
                            dispatch(venueSearchActions.resetSearch());
                        }}>
                            ✕
                        </button>
                    )}
                </div>
                <SearchFilters query={defaultQuery} onApply={handleFiltersApply} onReset={handleFiltersReset}/>
            </div>

            {!loading && total > 0 && (
                <p className={css.resultsCount}>Знайдено: <strong>{total}</strong> закладів</p>
            )}

            {loading && (
                <div className={css.grid}>
                    {Array.from({length: 8}).map((_, i) => (
                        <div key={i} className={css.skeleton}/>
                    ))}
                </div>
            )}

            {error && !loading && (
                <div className={css.state}>
                    <span>😕</span>
                    <p>{error}</p>
                </div>
            )}

            {!loading && !error && inputValue && venues.length === 0 && (
                <div className={css.state}>
                    <span>🔦</span>
                    <p>За запитом <strong>«{inputValue}»</strong> нічого не знайдено</p>
                </div>
            )}

            {!loading && !error && !inputValue && venues.length === 0 && (
                <div className={css.state}>
                    <span>🗺</span>
                    <p>Введи назву закладу або застосуй фільтри</p>
                </div>
            )}

            {!loading && venues.length > 0 && (
                <>
                    <div className={css.grid}>
                        {venues.map(v => <VenueSearchCard key={v.id} venue={v}/>)}
                    </div>

                    {hasMore && (
                        <div className={css.loadMoreWrap}>
                            <button className={css.loadMoreBtn} onClick={handleLoadMore} disabled={loadingMore}>
                                {loadingMore
                                    ? <span className={css.spinner}/>
                                    : `Показати ще (${total - offset})`
                                }
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export {SearchVenue};