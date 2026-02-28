import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import {AxiosError} from "axios";
import {categoriesService} from "../../services/categories.service";
import {IVenueInterface} from "../../interfaces/IVenueInterface";
import {IVenueCategoryInterface} from "../../interfaces/IVenueCategoryInterface";

interface IRootState {
    categories: IState;
}

interface IState {
    page: number | null;
    categories: IVenueCategoryInterface[];
    total_pages: number | null;
    total_results: number | null;
    venues: IVenueInterface[];
    activeCategoryId: string | null;
    categoryVenuesCount: { [genreId: string]: number };
}

const initialState: IState = {
    page: null,
    categories: [],
    total_pages: 20,
    total_results: null,
    venues: [],
    activeCategoryId: null,
    categoryVenuesCount: {}
}

const getCategoryVenuesCount = createAsyncThunk<
    Record<string, number>,
    void,
    { rejectValue: string; state: IRootState }
>(
    "categoriesSlice/getCategoryVenuesCount",
    async (_, { getState, rejectWithValue }) => {
        try {
            const categories = getState().categories.categories;
            const counts: Record<string, number> = {};

            for (const category of categories) {
                const { data } = await categoriesService.getByCategoryId(category.id, 1);
                counts[category.id] = data.results.length;
            }

            return counts;
        } catch (e) {
            const err = e as AxiosError;
            return rejectWithValue(
                typeof err.response?.data === "string" ? err.response.data : "Request error"
            );
        }
    }
);

const getByCategoryId = createAsyncThunk<
    { results: IVenueInterface[]; total_pages: number; total_results: number },
    { id: string; page: number }>
(
    'categoriesSlice/getByCategoryId',
    async ({id, page}, {rejectWithValue}) => {
        try {
            const {data} = await categoriesService.getByCategoryId(id, page);
            return {results: data.results, total_pages: data.results.length, total_results: data.results.length}
        } catch (e) {
            const err = e as AxiosError;
            return rejectWithValue(
                typeof err.response?.data === "string"
                    ? err.response.data
                    : "Request error"
            );
        }
    }
);

const getAll = createAsyncThunk<{ categories: IVenueCategoryInterface[] }, void>(
    'categoriesSlice/getAll',
    async (_, {rejectWithValue}) => {
        try {
            const {data} = await categoriesService.getAll()
            return data
        } catch (e) {
            const err = e as AxiosError;
            return rejectWithValue(
                typeof err.response?.data === "string"
                    ? err.response.data
                    : "Request error"
            );
        }
    }
)

const categoriesSlice = createSlice({
    name: 'categoriesSlice',
    initialState,
    reducers: {
        setActiveCategoryId(state, action) {
            state.activeCategoryId = action.payload;
        }
    },
    extraReducers: builder =>
        builder
            .addCase(getAll.fulfilled, (state, action) => {
                state.categories = (action.payload as { categories: IVenueCategoryInterface[] }).categories;
            })
            .addCase(getByCategoryId.fulfilled, (state, action) => {
                const {results, total_pages, total_results} = action.payload;
                state.venues = results;
                state.total_pages = total_pages;
                state.total_results = total_results;
                state.activeCategoryId = action.meta.arg.id;
                state.categoryVenuesCount[action.meta.arg.id] = total_results;
            })
            .addCase(getCategoryVenuesCount.fulfilled, (state, action) => {
                state.categoryVenuesCount = action.payload;
            }),
})

const {reducer: categoriesReducer, actions} = categoriesSlice;
const categoriesAction = {
    ...actions,
    getAll,
    getByCategoryId,
    getCategoryVenuesCount
}

export {
    categoriesReducer,
    categoriesAction
}