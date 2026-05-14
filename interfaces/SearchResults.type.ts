import { UserType } from "./User.type";

export interface SearchResultsType {
    results: UserType[];
    loading: boolean;
    totalResults: number;
    onLike: (userId: string) => void;
}
