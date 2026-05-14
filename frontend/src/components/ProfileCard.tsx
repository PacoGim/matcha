import './ProfileCard.css'
import type { ProfileCardType } from '../../../interfaces/ProfileCard.type'

export default function ProfileCard({
    profile,
    onLike,
    onPass,
    onViewProfile
}: ProfileCardType) {
    const getGenderIcon = (gender: string) => {
        switch (gender) {
            case 'male':
                return '♂️'
            case 'female':
                return '♀️'
            default:
                return '⚲'
        }
    }

    const getPreferenceText = (pref: string) => {
        switch (pref) {
            case 'male':
                return '♂️'
            case 'female':
                return '♀️'
            case 'both':
                return '♂️♀️'
            default:
                return ''
        }
    }

    return (
        <div key={profile.id} className="profile-result-card">
            <img src={`${process.env.REACT_APP_BACKEND_ORIGIN || window.location.origin}/images/${profile.id}/1`} alt={`Profile image of ${profile.username}`} />
            <div className="profile-overlay">
                <button className="like-button" onClick={() => onLike(profile.id)}>
                    ♥
                </button>
            </div>
            <div className="profile-info">
                <h3>
                    {profile.first_name}, {profile.age}
                </h3>
                {/* <p className="distance">{profile.distance_km} km away</p> */}
            </div>
        </div>
        // <div className="profile-card">
        //     <img className='profile-photo' src={`${process.env.REACT_APP_BACKEND_ORIGIN || window.location.origin}/images/${id}/1`} alt={`Profile image of ${username}`} />

        //     <h3>
        //         {username} {getGenderIcon(gender)} ({age})
        //     </h3>

        //     <p>📍 {location}</p>

        //     <p>Interested in: {getPreferenceText(sexual_preference)}</p>

        //     <p>{biography}</p>

        //     <div className="profile-actions">
        //         <button onClick={() => onPass?.(id)}>❌</button>
        //         <button onClick={() => onViewProfile?.(id)}>👁️</button>
        //         <button onClick={() => onLike?.(id)}>❤️</button>
        //     </div>
        // </div>
    )
}