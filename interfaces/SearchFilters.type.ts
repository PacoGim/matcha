import type { SearchFiltersStateType } from './SearchFiltersState.type';

export interface SearchFiltersType {
    filters: SearchFiltersStateType;
    onFilterChange: (filters: Partial<SearchFiltersStateType>) => void;
    onSearch: () => void;
    loading: boolean;
}