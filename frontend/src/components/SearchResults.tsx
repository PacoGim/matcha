// @ts-ignore
import './SearchResults.css';
import ProfileCard from './ProfileCard';
import type { SearchResultsType } from '../../../interfaces/SearchResults.type';

export default function SearchResults({
  results,
  loading,
  totalResults,
  onLike,
}: SearchResultsType) {
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
