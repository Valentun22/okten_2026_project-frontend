import {store} from "../redux/slices/store/store";
import {AxiosResponse} from "axios";

type IPromise<T> = Promise<AxiosResponse<T>>;
type RootState = ReturnType<typeof store.getState>
type AppDispatch = typeof store.dispatch

export type {
    RootState,
    AppDispatch,
    IPromise
}