import React from 'react';
import './SearchResults.css';
import { UserProfile } from '../types';
import ProfileCard from './ProfileCard';

export interface SearchResultWithDistance extends UserProfile {
  distance_km?: number;
}

interface SearchResultsProps {
  results: SearchResultWithDistance[];
  loading: boolean;
  totalResults: number;
  onLike: (userId: string) => void;
}

export default function SearchResults({
  results,
  loading,
  totalResults,
  onLike,
}: SearchResultsProps) {
  if (loading) {
    return (
      <div className="search-results">
        <p className="loading">Loading results...</p>
      </div>
    );
  }

  if (totalResults === 0) {
    return (
      <div className="search-results">
        <p className="no-results">No matches found. Try adjusting your filters.</p>
      </div>
    );
  }

  const getProfileImage = (profile: SearchResultWithDistance): string => {
    return profile.photos?.large || 'https://via.placeholder.com/300x400?text=No+Photo';
  };

  const getAge = (profile: SearchResultWithDistance): number => {
    return profile.age || 0;
  };

  const getDistance = (profile: SearchResultWithDistance): string => {
    if (profile.distance_km !== undefined) {
      return `${profile.distance_km}km away`;
    }
    return '0km away';
  };

  return (
    <div className="search-results">
      <div className="results-header">
        <h2>Matches Near You</h2>
        <span className="results-count">{totalResults} results</span>
      </div>

      <div className="results-grid">
        {results.map(profile => (
          <ProfileCard
            key={profile.id}
            profile={profile}
            onLike={onLike}
          />
          // <div key={profile.id} className="profile-result-card">
          //   <img src={`${process.env.REACT_APP_BACKEND_ORIGIN || window.location.origin}/images/${profile.id}/1`} alt={`Profile image of ${profile.username}`} />
          //   <div className="profile-overlay">
          //     <button className="like-button" onClick={() => onLike(profile.id)}>
          //       ♥
          //     </button>
          //   </div>
          //   <div className="profile-info">
          //     <h3>
          //       {profile.first_name}, {getAge(profile)}
          //     </h3>
          //     <p className="distance">{getDistance(profile)}</p>
          //   </div>
          // </div>
        ))}
      </div>
    </div>
  );
}
