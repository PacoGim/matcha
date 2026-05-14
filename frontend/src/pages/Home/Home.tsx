import { useState, useEffect, useRef } from 'react'
//@ts-ignore
import './Home.css'
import Navbar from '../../components/Navbar'
import ProfileCard from '../../components/ProfileCard'
import { fetchSuggestedProfiles } from '../../services/userService'
import type { UserProfileType } from '../../../../interfaces/User.type'

export default function Home() {
  const [suggestedProfiles, setSuggestedProfiles] = useState<UserProfileType[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const hasFetched = useRef(false)

  useEffect(() => {
    if (hasFetched.current) return
    hasFetched.current = true
    loadSuggestedProfiles()
  }, [])

  const loadSuggestedProfiles = async () => {
    setLoading(true)
    const profiles = await fetchSuggestedProfiles(20)
    setSuggestedProfiles(profiles)
    setLoading(false)
  }

  const handleLike = (userId: string) => {
    setSuggestedProfiles(prev => prev.filter(p => p.id !== userId))
  }

  const handlePass = (userId: string) => {
    setSuggestedProfiles(prev => prev.filter(p => p.id !== userId))
  }

  const handleViewProfile = (userId: string) => {
    console.log('Viewing:', userId)
  }

  const filteredProfiles = suggestedProfiles.filter(p =>
    p.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.profile.location.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div id="home-page">
      <Navbar />

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="profiles-grid">
          {filteredProfiles.map(profile => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              onLike={handleLike}
              onPass={handlePass}
              onViewProfile={handleViewProfile}
            />
          ))}
        </div>
      )}
    </div>
  )
}