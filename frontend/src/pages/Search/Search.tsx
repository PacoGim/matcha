import React, { useState, useEffect } from 'react';
import './Search.css';
import Navbar from '../../components/Navbar';
import SearchFilters, { SearchFiltersState } from '../../components/SearchFilters';
import SearchResults from '../../components/SearchResults';
import { fetchNearbyUsers } from '../../services/userService';
import { UserProfile } from '../../types';

export interface SearchResultWithDistance extends UserProfile {
  distance_km?: number;
}

export default function Search() {
  const [filters, setFilters] = useState<SearchFiltersState>({
    minAge: 22,
    maxAge: 34,
    minFame: 0,
    maxDistance: 15,
    interests: [],
    sortBy: 'distance',
  });

  const [results, setResults] = useState<SearchResultWithDistance[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(0);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const users = await fetchNearbyUsers(filters);
      setResults(users as SearchResultWithDistance[]);
      setTotalResults(users.length);
    } catch (error) {
      console.error('Error searching nearby users:', error);
      setResults([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: Partial<SearchFiltersState>) => {
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
