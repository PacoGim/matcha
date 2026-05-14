export interface SearchFiltersStateType {
    minAge: number;
    maxAge: number;
    minFame: number;
    maxDistance: number;
    interests: string[];
    sortBy: 'distance' | 'fame' | 'age';
}