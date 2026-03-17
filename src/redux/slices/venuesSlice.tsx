import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit';
import {IVenueInterface} from '../../interfaces/IVenueInterface';
import {venueService} from '../../services/venue.service';
import {AxiosError} from 'axios';

type VenuesState = {
    venues: IVenueInterface[];
    total: number;
    page: number;
    loading: boolean;
    error: string | null;
    venueCard: IVenueInterface | null;
    loadingCard: boolean;
};

const initialState: VenuesState = {
    venues: [],
    total: 0,
    page: 1,
    loading: false,
    error: null,
    venueCard: null,
    loadingCard: false,
};

const getAll = createAsyncThunk<{data: IVenueInterface[], total: number}, {page: number, limit?: number}, { rejectValue: string }>(
    'venues/getAll',
    async ({page, limit}, {rejectWithValue}) => {
        try {
            const {data} = await venueService.getAll(page, limit);
            return data;
        } catch (e) {
            const err = e as AxiosError;
            return rejectWithValue(typeof err.response?.data === 'string' ? err.response.data : 'Request error');
        }
    }
);

const getByVenueId = createAsyncThunk<IVenueInterface, string, { rejectValue: string }>(
    'venues/getByVenueId',
    async (id, {rejectWithValue}) => {
        try {
            const {data} = await venueService.getByVenueId(id);
            return data;
        } catch (e) {
            const err = e as AxiosError;
            return rejectWithValue(typeof err.response?.data === 'string' ? err.response.data : 'Request error');
        }
    }
);

const venuesSlice = createSlice({
    name: 'venues',
    initialState,
    reducers: {
        setPage: (state, action: PayloadAction<number>) => {
            state.page = action.payload;
        },
        toggleFavoriteLocal: (state, action: PayloadAction<string>) => {
            if (state.venueCard?.id === action.payload) {
                (state.venueCard as any).isFavorite = !(state.venueCard as any).isFavorite;
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getAll.pending, state => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getAll.fulfilled, (state, action) => {
                state.loading = false;
                state.venues = action.payload.data;
                state.total = action.payload.total;
            })
            .addCase(getAll.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? 'Помилка';
            })
            .addCase(getByVenueId.pending, state => {
                state.loadingCard = true;
                state.error = null;
                state.venueCard = null;
            })
            .addCase(getByVenueId.fulfilled, (state, action) => {
                state.loadingCard = false;
                state.venueCard = action.payload;
            })
            .addCase(getByVenueId.rejected, (state, action) => {
                state.loadingCard = false;
                state.error = action.payload ?? 'Помилка';
            });
    },
});

export const venuesActions = {
    ...venuesSlice.actions,
    getAll,
    getByVenueId,
};

export const venuesReducer = venuesSlice.reducer;