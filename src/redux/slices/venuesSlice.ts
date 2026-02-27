import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IVenueInterface } from "../../interfaces/IVenueInterface";
import { venueService } from "../../services/venue.service";

type VenuesState = {
    venues: IVenueInterface[];
    page: number;
    loading: boolean;
    error: string | null;
};

const initialState: VenuesState = {
    venues: [],
    page: 1,
    loading: false,
    error: null,
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
            return data; // якщо бек повертає масив
        } catch {
            return rejectWithValue("Не вдалося завантажити venues");
        }
    }
);

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
};

export const venuesReducer = venuesSlice.reducer;