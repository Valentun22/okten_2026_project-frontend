import {useEffect} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {useAppDispatch, useAppSelector} from '../../../hooks/useReduxHooks';
import {VenueCard} from '../VenueCard/VenueCard';
import {venuesActions} from '../../../redux/slices/venuesSlice';
import css from './VenuesCard.module.css';

const VenuesCard = () => {
    const {venueCard, loadingCard, error} = useAppSelector(state => state.venues);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const {id} = useParams<{ id: string }>();

    useEffect(() => {
        if (!id) return;
        dispatch(venuesActions.getByVenueId(id));
    }, [dispatch, id]);

    return (
        <div className={css.wrap}>
            <button className={css.backBtn} onClick={() => navigate(-1)}>
                ← Назад
            </button>

            {loadingCard && (
                <div className={css.skeletonWrap}>
                    <div className={css.skeletonHero}/>
                    <div className={css.skeletonBody}>
                        {Array.from({length: 4}).map((_, i) => <div key={i} className={css.skeletonLine}/>)}
                    </div>
                </div>
            )}

            {error && !loadingCard && (
                <div className={css.error}>
                    <span>😕</span>
                    <p>{error}</p>
                    <button className={css.retryBtn} onClick={() => id && dispatch(venuesActions.getByVenueId(id))}>
                        Спробувати знову
                    </button>
                </div>
            )}

            {venueCard && !loadingCard && <VenueCard venueCard={venueCard}/>}
        </div>
    );
};

export {VenuesCard};