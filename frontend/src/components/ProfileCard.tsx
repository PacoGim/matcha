import React from 'react';
import { UserProfile } from '../types';
import './ProfileCard.css';

interface ProfileCardProps {
    profile: UserProfile;
    onLike?: (userId: string) => void;
    onPass?: (userId: string) => void;
    onViewProfile?: (userId: string) => void;
    compact?: boolean;
    gridView?: boolean;
}

export default function ProfileCard({
    profile,
    onLike,
    onPass,
    onViewProfile,
    compact = false,
    gridView = false
}: ProfileCardProps) {
    const { first_name, age, last_name, fame_rating } = profile;
    const { gender, biography, location, sexual_preference } = profile.profile;

    const photos = profile.photos;

    const getGenderIcon = (gender: string) => {
        switch (gender) {
            case 'male':
                return '♂️';
            case 'female':
                return '♀️';
            default:
                return '⚲';
        }
    };

    const getPreferenceText = (pref: string) => {
        switch (pref) {
            case 'male':
                return '♂️';
            case 'female':
                return '♀️';
            case 'both':
                return '♂️♀️';
            default:
                return '';
        }
    };

    const interestTag =
        biography.split(/[\s,]+/).slice(-2).join(' ') || 'Interests';

    if (gridView) {
        return (
            <div
                className="profile-card grid-view"
                style={{ backgroundImage: `url(${photos?.large})` }}
                onClick={() => onViewProfile?.(profile.id)}
            >
                <div className="profile-overlay"></div>

                <div className="profile-grid-content">
                    <div className="profile-info-top">
                        <h2>({age}) {first_name}</h2>
                        <h2>{getGenderIcon(gender)} ❤️‍🔥 {getPreferenceText(sexual_preference)}</h2>
                    </div>

                    <div className="profile-info-bottom">
                        <div className="profile-stats">
                            <span className="match-badge">{fame_rating}% Match</span>
                            <span className="interest-tag">{interestTag}</span>
                        </div>

                        <div className="profile-actions">
                            <button onClick={(e) => { e.stopPropagation(); onPass?.(profile.id); }}>
                                ❌
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); onLike?.(profile.id); }}>
                                ❤️
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-card">
            <img src={photos.large} alt={`${first_name}`} />

            <h3>
                {first_name} {last_name} {getGenderIcon(gender)} ({age})
            </h3>

            <p>📍 {location}</p>

            <p>Interested in: {getPreferenceText(sexual_preference)}</p>

            <p>{biography}</p>

            <div className="profile-actions">
                <button onClick={() => onPass?.(profile.id)}>❌</button>
                <button onClick={() => onViewProfile?.(profile.id)}>👁️</button>
                <button onClick={() => onLike?.(profile.id)}>❤️</button>
            </div>
        </div>
    );
}