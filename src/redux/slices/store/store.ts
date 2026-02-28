import {configureStore} from "@reduxjs/toolkit";
import {venuesReducer} from "../venuesSlice";
import {categoriesReducer} from "../categoriesSlice";
import {searchReducer} from "../searchSlice";

export const store = configureStore({
    reducer: {
        venues: venuesReducer,
        search: searchReducer,
        categories: categoriesReducer,
    }
})
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;