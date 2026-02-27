import {configureStore} from "@reduxjs/toolkit";
import {venuesReducer} from "../venuesSlice";

export const store = configureStore({
    reducer: {
        venues: venuesReducer,
        // search: searchReducer,
    }
})
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;