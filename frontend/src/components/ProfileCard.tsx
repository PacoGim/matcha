import { UserProfile } from '../types'
import './ProfileCard.css'

interface ProfileCardProps {
    profile: UserProfile
    onLike?: (userId: string) => void
    onPass?: (userId: string) => void
    onViewProfile?: (userId: string) => void
    compact?: boolean
    gridView?: boolean
}

export default function ProfileCard({
    profile,
    onLike,
    onPass,
    onViewProfile
}: ProfileCardProps) {
    const { id, username, age } = profile
    const { gender, biography, location, sexual_preference } = profile.profile

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
        <div className="profile-card">
            <img src={`${process.env.REACT_APP_BACKEND_ORIGIN || window.location.origin}/images/${id}/1`} alt={`Profile image of ${profile.username}`} />

            <h3>
                {username} {getGenderIcon(gender)} ({age})
            </h3>

            <p>📍 {location}</p>

            <p>Interested in: {getPreferenceText(sexual_preference)}</p>

            <p>{biography}</p>

            <div className="profile-actions">
                <button onClick={() => onPass?.(id)}>❌</button>
                <button onClick={() => onViewProfile?.(id)}>👁️</button>
                <button onClick={() => onLike?.(id)}>❤️</button>
            </div>
        </div>
    )
}