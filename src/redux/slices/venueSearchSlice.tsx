import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit';
import {AxiosError} from 'axios';
import {
    IVenueListItem, IVenueListResponse, IVenueSearchQuery,
    SortOrderEnum, VenueSortByEnum,
} from '../../interfaces/IVenueSearchInterface';
import {venueSearchService} from '../../services/venueSearch.service';

interface IVenueSearchState {
    venues: IVenueListItem[];
    total: number;
    offset: number;
    limit: number;
    query: IVenueSearchQuery;
    loading: boolean;
    loadingMore: boolean;
    error: string | null;
}

const DEFAULT_QUERY: IVenueSearchQuery = {
    limit: 12,
    offset: 0,
    sortBy: VenueSortByEnum.CREATED,
    sortOrder: SortOrderEnum.DESC,
};

const initialState: IVenueSearchState = {
    venues: [],
    total: 0,
    offset: 0,
    limit: 12,
    query: DEFAULT_QUERY,
    loading: false,
    loadingMore: false,
    error: null,
};

const search = createAsyncThunk<IVenueListResponse, IVenueSearchQuery, { rejectValue: string }>(
    'venueSearch/search',
    async (query, {rejectWithValue}) => {
        try {
            const {data} = await venueSearchService.search(query);
            return data;
        } catch (e) {
            const err = e as AxiosError;
            return rejectWithValue(
                typeof err.response?.data === 'string' ? err.response.data : 'Помилка пошуку'
            );
        }
    },
    {condition: (q) => {
            const hasSearch = (q.search ?? '').trim() !== '';
            const hasFilters = !!(
                q.categories?.length || q.city || q.tag ||
                q.averageCheckFrom || q.averageCheckTo ||
                q.ratingFrom || q.ratingTo ||
                q.hasWiFi || q.hasParking || q.liveMusic ||
                q.petFriendly || q.hasTerrace || q.smokingAllowed || q.cardPayment ||
                q.sortBy !== VenueSortByEnum.CREATED || q.sortOrder !== SortOrderEnum.DESC
            );
            return hasSearch || hasFilters;
        }}
);

const loadMore = createAsyncThunk<IVenueListResponse, IVenueSearchQuery, { rejectValue: string }>(
    'venueSearch/loadMore',
    async (query, {rejectWithValue}) => {
        try {
            const {data} = await venueSearchService.search(query);
            return data;
        } catch (e) {
            const err = e as AxiosError;
            return rejectWithValue(typeof err.response?.data === 'string' ? err.response.data : 'Error');
        }
    }
);

const venueSearchSlice = createSlice({
    name: 'venueSearch',
    initialState,
    reducers: {
        setQuery(state, action: PayloadAction<IVenueSearchQuery>) {
            state.query = {...action.payload, limit: state.limit, offset: 0};
            state.venues = [];
            state.offset = 0;
        },
        resetSearch(state) {
            state.venues = [];
            state.offset = 0;
            state.total = 0;
            state.query = DEFAULT_QUERY;
            state.error = null;
        },
    },
    extraReducers: builder => builder
        .addCase(search.pending, state => {
            state.loading = true;
            state.error = null;
        })
        .addCase(search.fulfilled, (state, {payload}) => {
            state.loading = false;
            state.venues = payload.data;
            state.total = payload.total;
            state.offset = payload.data.length;
        })
        .addCase(search.rejected, (state, {payload}) => {
            state.loading = false;
            state.error = payload ?? 'Error';
        })
        .addCase(loadMore.pending, state => {
            state.loadingMore = true;
        })
        .addCase(loadMore.fulfilled, (state, {payload}) => {
            state.loadingMore = false;
            state.venues = [...state.venues, ...payload.data];
            state.offset += payload.data.length;
        })
        .addCase(loadMore.rejected, state => {
            state.loadingMore = false;
        }),
});

const {reducer: venueSearchReducer, actions} = venueSearchSlice;
const venueSearchActions = {...actions, search, loadMore};
export {venueSearchReducer, venueSearchActions};