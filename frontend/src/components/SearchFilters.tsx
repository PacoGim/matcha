import React from 'react';
import './SearchFilters.css';

export interface SearchFiltersState {
  minAge: number;
  maxAge: number;
  minFame: number;
  maxDistance: number;
  interests: string[];
  sortBy: 'distance' | 'fame' | 'age';
}

interface SearchFiltersProps {
  filters: SearchFiltersState;
  onFilterChange: (filters: Partial<SearchFiltersState>) => void;
  onSearch: () => void;
  loading: boolean;
}

const AVAILABLE_INTERESTS = [
  'Ceramics',
  'Meditation',
  'Minimalism',
  'Tea Tasting',
  'Analog Photo',
  'Hiking',
  'Yoga',
  'Reading',
  'Cooking',
  'Photography',
  'Travel',
  'Music',
];

export default function SearchFilters({
  filters,
  onFilterChange,
  onSearch,
  loading,
}: SearchFiltersProps) {
  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (e.target.id === 'minAge') {
      onFilterChange({ minAge: Math.min(value, filters.maxAge) });
    } else {
      onFilterChange({ maxAge: Math.max(value, filters.minAge) });
    }
  };

  const handleFameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ minFame: parseFloat(e.target.value) });
  };

  const handleDistanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ maxDistance: parseInt(e.target.value) });
  };

  const handleInterestToggle = (interest: string) => {
    const newInterests = filters.interests.includes(interest)
      ? filters.interests.filter((i: string) => i !== interest)
      : [...filters.interests, interest];
    onFilterChange({ interests: newInterests });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({
      sortBy: e.target.value as 'distance' | 'fame' | 'age',
    });
  };

  return (
    <div className="search-filters">
      <h2>Search Filters</h2>
      <button
          className="search-button"
          onClick={onSearch}
          disabled={loading}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>

      <div className="filter-group">
        <label htmlFor="ageRange">Age Range</label>
        <div className="slider-container">
          <div className="age-inputs">
            <input
              type="number"
              id="minAge"
              min="18"
              max="99"
              value={filters.minAge}
              onChange={handleAgeChange}
              className="age-input"
            />
            <span> - </span>
            <input
              type="number"
              id="maxAge"
              min="18"
              max="99"
              value={filters.maxAge}
              onChange={handleAgeChange}
              className="age-input"
            />
          </div>
          <input
            type="range"
            min="18"
            max="99"
            value={filters.minAge}
            onChange={handleAgeChange}
            id="minAge"
            className="slider"
          />
          <input
            type="range"
            min="18"
            max="99"
            value={filters.maxAge}
            onChange={handleAgeChange}
            id="maxAge"
            className="slider"
          />
          <div className="age-display">
            {filters.minAge} - {filters.maxAge}
          </div>
        </div>
      </div>

      <div className="filter-group">
        <label htmlFor="fameRating">Fame Rating</label>
        <div className="slider-container">
          <input
            type="range"
            min="0"
            max="5"
            step="0.1"
            value={filters.minFame}
            onChange={handleFameChange}
            id="fameRating"
            className="slider"
          />
          <div className="fame-display">
            {filters.minFame.toFixed(1)}+ Stars
          </div>
        </div>
      </div>

      <div className="filter-group">
        <label htmlFor="distance">Distance</label>
        <div className="slider-container">
          <input
            type="range"
            min="1"
            max="100"
            value={filters.maxDistance}
            onChange={handleDistanceChange}
            id="distance"
            className="slider"
          />
          <div className="distance-display">
            Within {filters.maxDistance}km
          </div>
        </div>
      </div>

      <div className="filter-group">
        <label>Interests</label>
        <div className="interests-container">
          {AVAILABLE_INTERESTS.map(interest => (
            <button
              key={interest}
              className={`interest-tag ${
                filters.interests.includes(interest) ? 'selected' : ''
              }`}
              onClick={() => handleInterestToggle(interest)}
            >
              {interest}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-actions">
        <select
          value={filters.sortBy}
          onChange={handleSortChange}
          className="sort-select"
        >
          <option value="distance">Sort By: Distance</option>
          <option value="fame">Sort By: Fame</option>
          <option value="age">Sort By: Age</option>
        </select>

        
      </div>
    </div>
  );
}
