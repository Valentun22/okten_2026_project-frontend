import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit';
import {AxiosError} from 'axios';
import {INewsItem, INewsListResponse, INewsQuery, NewsTypeEnum} from '../../interfaces/INewsInterface';
import {newsService} from '../../services/news.service';

interface INewsState {
    news: INewsItem[];
    total: number;
    offset: number;
    limit: number;
    activeType: NewsTypeEnum | null;
    loading: boolean;
    loadingMore: boolean;
    error: string | null;
}

const initialState: INewsState = {
    news: [],
    total: 0,
    offset: 0,
    limit: 10,
    activeType: null,
    loading: false,
    loadingMore: false,
    error: null,
};

const getAll = createAsyncThunk<INewsListResponse, INewsQuery, { rejectValue: string }>(
    'news/getAll',
    async (query, {rejectWithValue}) => {
        try {
            const {data} = await newsService.getAll(query);
            return data;
        } catch (e) {
            const err = e as AxiosError;
            return rejectWithValue(
                typeof err.response?.data === 'string' ? err.response.data : 'Помилка завантаження'
            );
        }
    }
);

const loadMore = createAsyncThunk<INewsListResponse, INewsQuery, { rejectValue: string }>(
    'news/loadMore',
    async (query, {rejectWithValue}) => {
        try {
            const {data} = await newsService.getAll(query);
            return data;
        } catch (e) {
            const err = e as AxiosError;
            return rejectWithValue(
                typeof err.response?.data === 'string' ? err.response.data : 'Помилка завантаження'
            );
        }
    }
);

const newsSlice = createSlice({
    name: 'news',
    initialState,
    reducers: {
        setActiveType(state, action: PayloadAction<NewsTypeEnum | null>) {
            state.activeType = action.payload;
            state.offset = 0;
            state.news = [];
        },
        resetNews(state) {
            state.news = [];
            state.offset = 0;
            state.error = null;
        },
    },
    extraReducers: builder =>
        builder
            .addCase(getAll.pending, state => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getAll.fulfilled, (state, action) => {
                state.loading = false;
                state.news = action.payload.data;
                state.total = action.payload.total;
                state.offset = action.payload.offset + action.payload.data.length;
                state.limit = action.payload.limit;
            })
            .addCase(getAll.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? 'Error';
            })
            .addCase(loadMore.pending, state => {
                state.loadingMore = true;
            })
            .addCase(loadMore.fulfilled, (state, action) => {
                state.loadingMore = false;
                state.news = [...state.news, ...action.payload.data];
                state.offset = state.offset + action.payload.data.length;
            })
            .addCase(loadMore.rejected, state => {
                state.loadingMore = false;
            }),
});

const {reducer: newsReducer, actions} = newsSlice;
const newsActions = {...actions, getAll, loadMore};

export {newsReducer, newsActions};