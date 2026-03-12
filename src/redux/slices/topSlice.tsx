import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit';
import {AxiosError} from 'axios';
import {ITopCategory, ITopCategoryWithVenues} from '../../interfaces/IVenueSearchInterface';
import {topService} from '../../services/top.service';

interface ITopState {
    categories: ITopCategory[];
    activeSlug: string | null;
    activeCategory: ITopCategoryWithVenues | null;
    loadingList: boolean;
    loadingVenues: boolean;
    error: string | null;
}

const initialState: ITopState = {
    categories: [],
    activeSlug: null,
    activeCategory: null,
    loadingList: false,
    loadingVenues: false,
    error: null,
};

const getCategories = createAsyncThunk<ITopCategory[], void, { rejectValue: string }>(
    'top/getCategories',
    async (_, {rejectWithValue}) => {
        try {
            const {data} = await topService.getCategories();
            return data;
        } catch (e) {
            const err = e as AxiosError;
            return rejectWithValue(typeof err.response?.data === 'string' ? err.response.data : 'Помилка');
        }
    }
);

const getCategoryBySlug = createAsyncThunk<ITopCategoryWithVenues, string, { rejectValue: string }>(
    'top/getCategoryBySlug',
    async (slug, {rejectWithValue}) => {
        try {
            const {data} = await topService.getCategoryBySlug(slug);
            return data;
        } catch (e) {
            const err = e as AxiosError;
            return rejectWithValue(typeof err.response?.data === 'string' ? err.response.data : 'Помилка');
        }
    }
);

const topSlice = createSlice({
    name: 'top',
    initialState,
    reducers: {
        setActiveSlug(state, action: PayloadAction<string>) {
            state.activeSlug = action.payload;
        },
    },
    extraReducers: builder => builder
        .addCase(getCategories.pending, state => {
            state.loadingList = true;
            state.error = null;
        })
        .addCase(getCategories.fulfilled, (state, {payload}) => {
            state.loadingList = false;
            state.categories = payload;
        })
        .addCase(getCategories.rejected, (state, {payload}) => {
            state.loadingList = false;
            state.error = payload ?? 'Error';
        })
        .addCase(getCategoryBySlug.pending, state => {
            state.loadingVenues = true;
            state.error = null;
        })
        .addCase(getCategoryBySlug.fulfilled, (state, {payload}) => {
            state.loadingVenues = false;
            state.activeCategory = payload;
        })
        .addCase(getCategoryBySlug.rejected, (state, {payload}) => {
            state.loadingVenues = false;
            state.error = payload ?? 'Error';
        }),
});

const {reducer: topReducer, actions} = topSlice;
const topActions = {...actions, getCategories, getCategoryBySlug};
export {topReducer, topActions};