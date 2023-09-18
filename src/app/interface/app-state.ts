import { DataState } from "../enum/data-state.enum";

export interface AppState<T> {
    dataState: DataState;
    // either we get the error
    // or we get the data.
    appData?: T;
    error?: string;
}