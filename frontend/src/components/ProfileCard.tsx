// @ts-ignore
import './ProfileCard.css'
import type { ProfileCardType } from '../../../interfaces/ProfileCard.type'
import trimTextFn from '../functions/trimText.fn'

export default function ProfileCard({
    profile,
    onLike,
    onPass,
    onViewProfile
}: ProfileCardType) {
    const { id, username, age } = profile

    return (
        <div className="profile-card">
            <img src={`${process.env.REACT_APP_BACKEND_ORIGIN || window.location.origin}/images/${profile.id}/1`} alt={`Profile image of ${profile.username}`} />
            <div className='card-body'>
                <span className='username'>{trimTextFn(username, 10)} ({age})</span>
                <div className='controls'>
                    <span className='icon' onClick={() => onPass(id)}>
                        <img src="/img/icons/cross.svg" alt="" />
                    </span>
                    <span className='icon' onClick={() => onViewProfile(id)}>
                        <img src="/img/icons/view.svg" alt="" />
                    </span>
                    <span className='icon' onClick={() => onLike(id)}>
                        <img src="/img/icons/love.svg" alt="" />
                    </span>
                </div>
            </div>
        </div>
    )
}