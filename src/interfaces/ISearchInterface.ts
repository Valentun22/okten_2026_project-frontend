import {IVenueInterface} from "./IVenueInterface";

export interface ISearchInterface {
    page: number;
    results: IVenueInterface[];
    total_pages: number;
    total_results: number;
}