import {configureStore} from "@reduxjs/toolkit";
import {venuesReducer} from "../venuesSlice";
import {categoriesReducer} from "../categoriesSlice";
import {searchReducer} from "../searchSlice";
import {newsReducer} from "../newsSlice";
import {topReducer} from "../topSlice";
import {venueSearchReducer} from "../venueSearchSlice";

export const store = configureStore({
    reducer: {
        venues: venuesReducer,
        search: searchReducer,
        categories: categoriesReducer,
        news: newsReducer,
        venueSearch: venueSearchReducer,
        top: topReducer,
    }
})
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;