import { useState } from 'react';
import Navbar from '../../components/Navbar';
// @ts-ignore
import './Search.css';
import SearchResults from '../../components/SearchResults';
import { fetchNearbyUsers } from '../../services/userService';
import { UserProfileType } from '../../../../interfaces/User.type';
import { SearchFiltersStateType } from '../../../../interfaces/SearchFiltersState.type';
import SearchFilters from '../../components/SearchFilters';


export default function Search() {
  const [filters, setFilters] = useState<SearchFiltersStateType>({
    minAge: 22,
    maxAge: 34,
    minFame: 0,
    maxDistance: 15,
    interests: [],
    sortBy: 'distance',
  });

  const [results, setResults] = useState<UserProfileType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [totalResults, setTotalResults] = useState<number>(0);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const users : UserProfileType[] = await fetchNearbyUsers(filters);
      setResults(users);
      setTotalResults(users.length);
    } catch (error) {
      console.error('Error searching nearby users:', error);
      setResults([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: Partial<SearchFiltersStateType>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleLike = (userId: string) => {
    setResults(prev => prev.filter(p => p.id !== userId));
    setTotalResults(prev => prev - 1);
  };

  return (
    <div id="search-page">
      <Navbar />
      <div className="search-container">
        <SearchFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onSearch={handleSearch}
          loading={loading}
        />
        <SearchResults
          results={results}
          loading={loading}
          totalResults={totalResults}
          onLike={handleLike}
        />
      </div>
    </div>
  );
}
