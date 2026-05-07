import { useState, useEffect } from 'react';
import './Profile.css';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../contexts/AuthContext';

interface UserProfile {
    email: string;
    username: string;
    first_name: string;
    last_name: string;
    created_at: string;
}

export default function Profile() {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { isInitializing } = useAuth();

    useEffect(() => {
        const fetchProfile = async () => {
            if (isInitializing) {
                return;
            }

            try {
                const endpoint_profile = `${window.location.origin}/user/profile`
                const response = await fetch(endpoint_profile, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Failed to fetch profile');
                }

                setProfile(data.user);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [isInitializing]);

    if (loading) {
        return (
            <div id="profile-page">
                <Navbar />
                <div className="profile-container">
                    <div className="loading-spinner"></div>
                    <p>Loading profile...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div id="profile-page">
                <Navbar />
                <div className="profile-container">
                    <div className="error-message">{error}</div>
                </div>
            </div>
        );
    }

    return (
        <div id="profile-page">
            <Navbar />
            <div className="profile-container">
                <h1>My Profile</h1>
                {profile && (
                    <div className="profile-card">
                        <div className="profile-field">
                            <label>Username:</label>
                            <span>{profile.username}</span>
                        </div>
                        <div className="profile-field">
                            <label>Email:</label>
                            <span>{profile.email}</span>
                        </div>
                        <div className="profile-field">
                            <label>First Name:</label>
                            <span>{profile.first_name}</span>
                        </div>
                        <div className="profile-field">
                            <label>Last Name:</label>
                            <span>{profile.last_name}</span>
                        </div>
                        <div className="profile-field">
                            <label>Member since:</label>
                            <span>{new Date(profile.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
