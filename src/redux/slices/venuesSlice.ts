import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IVenueInterface } from "../../interfaces/IVenueInterface";
import { venueService } from "../../services/venue.service";
import {AxiosError} from "axios";

type VenuesState = {
    venues: IVenueInterface[];
    page: number;
    loading: boolean;
    error: string | null;
    venueCard: IVenueInterface | null;
};

const initialState: VenuesState = {
    venues: [],
    page: 1,
    loading: false,
    error: null,
    venueCard: null,
};

const getAll = createAsyncThunk<
    IVenueInterface[],
    number,
    { rejectValue: string }
>(
    "venues/getAll",
    async (page, { rejectWithValue }) => {
        try {
            const { data } = await venueService.getAll(page);
            return data;
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

const getByVenueId = createAsyncThunk<IVenueInterface, string>(
    'venues/getByVenueId',
    async (id, {rejectWithValue}) => {
        try {
            const {data} = await venueService.getByMovieId(id);
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

const venuesSlice = createSlice({
    name: "venues",
    initialState,
    reducers: {
        setPage: (state, action: PayloadAction<number>) => {
            state.page = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getAll.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getAll.fulfilled, (state, action) => {
                state.loading = false;
                state.venues = action.payload;
            })
            .addCase(getAll.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? "Помилка";
            });
    },
});

export const venuesActions = {
    ...venuesSlice.actions,
    getAll,
    getByVenueId
};

export const venuesReducer = venuesSlice.reducer;