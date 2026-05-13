import { UserProfile } from '../types';

const PARIS_LAT = 48.8566;
const PARIS_LON = 2.3522;

/* -----------------------------
   Main API
------------------------------ */

export async function fetchSuggestedProfiles(
    count: number = 20
): Promise<UserProfile[]> {
    try {
        const endpoint = `${process.env.REACT_APP_BACKEND_ORIGIN || window.location.origin}/profiles?count=${count}`
        
        const response = await fetch(endpoint, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        if (!response.ok) {
            throw new Error(`Failed to fetch profiles: ${response.status}`)
        }
        
        const profiles: UserProfile[] = await response.json();
        return profiles;
    } catch (error) {
        console.error(
            'Failed to fetch suggested profiles:',
            error
        );

        return [];
    }
}

/* -----------------------------
   Current user
------------------------------ */

export function getCurrentUser(): UserProfile {
    return {
        id: 'current-user',

        email: 'user@example.com',

        username: 'currentuser',

        first_name: 'Alex',

        age: 30,
        
        last_name: 'Johnson',

        is_verified: true,

        fame_rating: 75,

        created_at: new Date(
            Date.now() - 30 * 24 * 60 * 60 * 1000
        ).toISOString(),

        updated_at: new Date().toISOString(),

        photos: {
            large:
                'https://randomuser.me/api/portraits/men/32.jpg',

            medium:
                'https://randomuser.me/api/portraits/med/men/32.jpg',

            thumbnail:
                'https://randomuser.me/api/portraits/thumb/men/32.jpg'
        },

        profile: {
            user_id: 'current-user',

            gender: 'male',

            age: 30,

            sexual_preference: 'female',

            biography:
                "Hey! I'm Alex, a software developer who loves hiking and trying new restaurants. Looking for someone to share adventures with!",

            location: 'Paris, France',

            latitude: PARIS_LAT,

            longitude: PARIS_LON,

            allow_gps: true,

            created_at: new Date(
                Date.now() - 30 * 24 * 60 * 60 * 1000
            ).toISOString(),

            updated_at: new Date().toISOString()
        }
    };
}

/* -----------------------------
   Search/Nearby Users
------------------------------ */

export async function fetchNearbyUsers(
    filters?: {
        minAge?: number;
        maxAge?: number;
        minFame?: number;
        maxDistance?: number;
        interests?: string[];
        sortBy?: 'distance' | 'fame' | 'age';
    }
): Promise<UserProfile[]> {
    try {
        const queryParams = new URLSearchParams({
            min_age: (filters?.minAge || 18).toString(),
            max_age: (filters?.maxAge || 99).toString(),
            min_fame: (filters?.minFame || 0).toString(),
            max_distance: (filters?.maxDistance || 50).toString(),
            sort_by: filters?.sortBy || 'distance',
        });

        if (filters?.interests && filters.interests.length > 0) {
            queryParams.append('interests', filters.interests.join(','));
        }

        const endpoint = `${process.env.REACT_APP_BACKEND_ORIGIN || window.location.origin}/user/nearby?${queryParams.toString()}`;
        
        const response = await fetch(endpoint, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        if (!response.ok) {
            throw new Error(`Failed to fetch nearby users: ${response.status}`);
        }
        
        const data = await response.json();
        return data.users || [];
    } catch (error) {
        console.error('Failed to fetch nearby users:', error);
        return [];
    }
}