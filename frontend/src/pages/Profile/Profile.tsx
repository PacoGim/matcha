import { useState, useEffect } from 'react';
import './Profile.css';
import Navbar from '../../components/Navbar';
import LocationPicker from '../../components/LocationPicker';
import { useAuth } from '../../contexts/AuthContext';

interface User {
    email: string;
    username: string;
    first_name: string;
    last_name: string;
    is_verified: boolean;
    fame_rating: number;
    created_at: string;
    updated_at: string;
}

interface Profile {
    gender: string;
    sexual_preference: string;
    biography: string;
    location: string;
    latitude: number;
    longitude: number;
    allow_gps: boolean;
}

interface ProfileResponse {
    user: User;
    profile: Profile;
}

interface FieldErrors {
    [key: string]: string;
}

export default function ProfilePage() {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt' | null>(null);
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

    const [formData, setFormData] = useState({
        email: '',
        first_name: '',
        last_name: '',
        gender: '',
        sexual_preference: '',
        biography: '',
        location: '',
        latitude: 0,
        longitude: 0,
        allow_gps: false,
    });

    const { isInitializing } = useAuth();

    useEffect(() => {
        const fetchProfile = async () => {
            if (isInitializing) {
                return;
            }

            try {
                const endpoint_profile = `${process.env.REACT_APP_BACKEND_ORIGIN || window.location.origin}/user/profile`
                const response = await fetch(endpoint_profile, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                const data: ProfileResponse = await response.json();

                if (!response.ok) {
                    throw new Error('Failed to fetch profile');
                }
                console.log('Profile data: ', JSON.stringify(data));
                setUser(data.user);
                setProfile(data.profile);
                setFormData({
                    email: data.user.email,
                    first_name: data.user.first_name,
                    last_name: data.user.last_name,
                    gender: data.profile.gender,
                    sexual_preference: data.profile.sexual_preference,
                    biography: data.profile.biography,
                    location: data.profile.location,
                    latitude: data.profile.latitude,
                    longitude: data.profile.longitude,
                    allow_gps: data.profile.allow_gps,
                });
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [isInitializing]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const target = e.target;
        const { name, value } = target;
        const checked = target instanceof HTMLInputElement ? target.checked : false;
        const type = target instanceof HTMLInputElement ? target.type : '';

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        if (fieldErrors[name]) {
            setFieldErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const getFieldError = (field: string) => fieldErrors[field] || '';

    const inputClass = (field: string) => `form-input${fieldErrors[field] ? ' error' : ''}`;

    const handleSave = async () => {
        setIsSaving(true);
        setError('');
        setSuccessMessage('');
        setFieldErrors({});

        try {
            const endpoint_profile = `${process.env.REACT_APP_BACKEND_ORIGIN || window.location.origin}/user/profile`;
            const response = await fetch(endpoint_profile, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user: {
                        email: formData.email,
                        first_name: formData.first_name,
                        last_name: formData.last_name,
                    },
                    profile: {
                        gender: formData.gender,
                        sexual_preference: formData.sexual_preference,
                        biography: formData.biography,
                        location: formData.location,
                        latitude: formData.latitude,
                        longitude: formData.longitude,
                        allow_gps: formData.allow_gps,
                    }
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                if (data && Array.isArray(data.errors)) {
                    const errors = data.errors.reduce((acc: FieldErrors, err: any) => {
                        if (err && err.field && err.error) {
                            acc[err.field] = err.error;
                        }
                        return acc;
                    }, {});

                    setFieldErrors(errors);
                    setError(data.message || data.errors[0]?.error || 'Please fix validation errors.');
                    return;
                }

                throw new Error(data.error || 'Failed to update profile');
            }

            const result: ProfileResponse = data;
            setUser(result.user);
            setProfile(result.profile);
            setIsEditing(false);
            setSuccessMessage('Profile updated successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        if (user && profile) {
            setFormData({
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                gender: profile.gender,
                sexual_preference: profile.sexual_preference,
                biography: profile.biography,
                location: profile.location,
                latitude: profile.latitude,
                longitude: profile.longitude,
                allow_gps: profile.allow_gps,
            });
        }
        setFieldErrors({});
        setError('');
        setIsEditing(false);
    };

    const requestLocationPermission = async () => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by this browser.');
            return;
        }

        try {
            const permission = await navigator.permissions.query({ name: 'geolocation' });
            setLocationPermission(permission.state);

            if (permission.state === 'granted') {
                getCurrentLocation();
            } else if (permission.state === 'prompt') {
                // Will ask for permission when getCurrentLocation is called
                getCurrentLocation();
            } else {
                setError('Location permission denied. Please enable location services in your browser settings.');
            }
        } catch (err) {
            // Fallback for browsers that don't support permissions API
            getCurrentLocation();
        }
    };

    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by this browser.');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setFormData(prev => ({
                    ...prev,
                    latitude,
                    longitude,
                    allow_gps: true,
                }));
                setLocationPermission('granted');
                setError('');
            },
            (err) => {
                let errorMessage = 'Unable to retrieve your location.';
                switch (err.code) {
                    case err.PERMISSION_DENIED:
                        errorMessage = 'Location access denied by user.';
                        setLocationPermission('denied');
                        break;
                    case err.POSITION_UNAVAILABLE:
                        errorMessage = 'Location information is unavailable.';
                        break;
                    case err.TIMEOUT:
                        errorMessage = 'Location request timed out.';
                        break;
                }
                setError(errorMessage);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000, // 5 minutes
            }
        );
    };

    const handleLocationChange = (lat: number, lng: number) => {
        setFormData(prev => ({
            ...prev,
            latitude: lat,
            longitude: lng,
        }));
    };

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

    return (
        <div id="profile-page">
            <Navbar />
            <div className="profile-container">
                <h1>My Profile</h1>

                {error && <div className="error-message">{error}</div>}
                {successMessage && <div className="success-message">{successMessage}</div>}

                {user && profile && (
                    <div className="profile-content">
                        {!isEditing ? (
                            <>
                                <div className="two-pane-grid">
                                    {/* User Data Pane */}
                                    <div className="pane user-pane">
                                        <h2>User Information</h2>
                                        <div className="info-group">
                                            <div className="info-field">
                                                <label>Username:</label>
                                                <span>{user.username}</span>
                                            </div>
                                            <div className="info-field">
                                                <label>Email:</label>
                                                <span>{user.email}</span>
                                            </div>
                                            <div className="info-field">
                                                <label>First Name:</label>
                                                <span>{user.first_name}</span>
                                            </div>
                                            <div className="info-field">
                                                <label>Last Name:</label>
                                                <span>{user.last_name}</span>
                                            </div>
                                            <div className="info-field">
                                                <label>Fame Rating:</label>
                                                <span>{user.fame_rating}</span>
                                            </div>
                                            <div className="info-field">
                                                <label>Member since:</label>
                                                <span>{new Date(user.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Profile Data Pane */}
                                    <div className="pane profile-pane">
                                        <h2>Profile</h2>
                                        <div className="info-group">
                                            <div className="info-field">
                                                <label>Gender:</label>
                                                <span>{profile.gender}</span>
                                            </div>
                                            <div className="info-field">
                                                <label>Sexual Preference:</label>
                                                <span>{profile.sexual_preference}</span>
                                            </div>
                                            <div className="info-field">
                                                <label>Location:</label>
                                                <span>{profile.location}</span>
                                            </div>
                                            <div className="info-field">
                                                <label>Latitude:</label>
                                                <span>{profile.latitude}</span>
                                            </div>
                                            <div className="info-field">
                                                <label>Longitude:</label>
                                                <span>{profile.longitude}</span>
                                            </div>
                                            <div className="info-field">
                                                <label>Allow GPS Tracking:</label>
                                                <span>{profile.allow_gps ? 'Yes' : 'No'}</span>
                                            </div>
                                            <div className="info-field">
                                                <label>Biography:</label>
                                                <span className="biography-text">{profile.biography}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="button-group">
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => {
                                            setFieldErrors({});
                                            setError('');
                                            setIsEditing(true);
                                        }}
                                    >
                                        Edit Profile
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="two-pane-grid">
                                    {/* User Data Edit Form */}
                                    <div className="pane user-pane">
                                        <h2>Edit User Information</h2>
                                        <div className="form-group">
                                            <label htmlFor="email">Email:</label>
                                            <input
                                                type="email"
                                                id="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                className={inputClass('email')}
                                            />
                                            {getFieldError('email') && <div className="field-error">{getFieldError('email')}</div>}
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="first_name">First Name:</label>
                                            <input
                                                type="text"
                                                id="first_name"
                                                name="first_name"
                                                value={formData.first_name}
                                                onChange={handleInputChange}
                                                className={inputClass('first_name')}
                                            />
                                            {getFieldError('first_name') && <div className="field-error">{getFieldError('first_name')}</div>}
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="last_name">Last Name:</label>
                                            <input
                                                type="text"
                                                id="last_name"
                                                name="last_name"
                                                value={formData.last_name}
                                                onChange={handleInputChange}
                                                className={inputClass('last_name')}
                                            />
                                            {getFieldError('last_name') && <div className="field-error">{getFieldError('last_name')}</div>}
                                        </div>
                                    </div>

                                    {/* Profile Data Edit Form */}
                                    <div className="pane profile-pane">
                                        <h2>Edit Profile</h2>
                                        <div className="form-group">
                                            <label htmlFor="location">Location:</label>
                                            <input
                                                type="text"
                                                id="location"
                                                name="location"
                                                value={formData.location}
                                                onChange={handleInputChange}
                                                className={inputClass('location')}
                                            />
                                            {getFieldError('location') && <div className="field-error">{getFieldError('location')}</div>}
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="latitude">Latitude:</label>
                                            <input
                                                type="number"
                                                id="latitude"
                                                name="latitude"
                                                value={formData.latitude}
                                                onChange={handleInputChange}
                                                className={inputClass('latitude')}
                                                step="any"
                                            />
                                            {getFieldError('latitude') && <div className="field-error">{getFieldError('latitude')}</div>}
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="longitude">Longitude:</label>
                                            <input
                                                type="number"
                                                id="longitude"
                                                name="longitude"
                                                value={formData.longitude}
                                                onChange={handleInputChange}
                                                className={inputClass('longitude')}
                                                step="any"
                                            />
                                            {getFieldError('longitude') && <div className="field-error">{getFieldError('longitude')}</div>}
                                        </div>
                                        <div className="form-group">
                                            <label className="checkbox-label">
                                                <input
                                                    type="checkbox"
                                                    id="allow_gps"
                                                    name="allow_gps"
                                                    checked={formData.allow_gps}
                                                    onChange={handleInputChange}
                                                />
                                                Allow GPS Tracking
                                            </label>
                                            {getFieldError('allow_gps') && <div className="field-error">{getFieldError('allow_gps')}</div>}
                                        </div>
                                        {isEditing && (
                                            <div className="form-group">
                                                <label>Location on Map:</label>
                                                <div className="map-container">
                                                    <LocationPicker
                                                        latitude={formData.latitude}
                                                        longitude={formData.longitude}
                                                        onLocationChange={handleLocationChange}
                                                        allowEdit={true}
                                                    />
                                                </div>
                                                <div className="location-controls">
                                                    <button
                                                        type="button"
                                                        className="btn btn-secondary btn-small"
                                                        onClick={requestLocationPermission}
                                                        disabled={!formData.allow_gps}
                                                    >
                                                        Use Current Location
                                                    </button>
                                                    {locationPermission === 'denied' && (
                                                        <small className="permission-denied">
                                                            Location permission denied. Check browser settings.
                                                        </small>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                        <div className="form-group">
                                            <label htmlFor="gender">Gender:</label>
                                            <select
                                                id="gender"
                                                name="gender"
                                                value={formData.gender}
                                                onChange={handleInputChange}
                                                className={inputClass('gender')}
                                            >
                                                <option value="">Select gender</option>
                                                <option value="male">Male</option>
                                                <option value="female">Female</option>
                                                <option value="other">Other</option>
                                            </select>
                                            {getFieldError('gender') && <div className="field-error">{getFieldError('gender')}</div>}
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="sexual_preference">Sexual Preference:</label>
                                            <select
                                                id="sexual_preference"
                                                name="sexual_preference"
                                                value={formData.sexual_preference}
                                                onChange={handleInputChange}
                                                className={inputClass('sexual_preference')}
                                            >
                                                <option value="">Select preference</option>
                                                <option value="male">Male</option>
                                                <option value="female">Female</option>
                                                <option value="both">Both</option>
                                            </select>
                                            {getFieldError('sexual_preference') && <div className="field-error">{getFieldError('sexual_preference')}</div>}
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="biography">Biography:</label>
                                            <textarea
                                                id="biography"
                                                name="biography"
                                                value={formData.biography}
                                                onChange={handleInputChange}
                                                className={inputClass('biography')}
                                                rows={4}
                                            />
                                            {getFieldError('biography') && <div className="field-error">{getFieldError('biography')}</div>}
                                        </div>
                                    </div>
                                </div>

                                <div className="button-group">
                                    <button
                                        className="btn btn-primary"
                                        onClick={handleSave}
                                        disabled={isSaving}
                                    >
                                        {isSaving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                    <button
                                        className="btn btn-secondary"
                                        onClick={handleCancel}
                                        disabled={isSaving}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
