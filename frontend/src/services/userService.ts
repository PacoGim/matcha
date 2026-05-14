import type { UserProfileType } from '../../../interfaces/User.type';

export async function fetchSuggestedProfiles(
    count: number = 20
): Promise<UserProfileType[]> {
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

        const profiles: UserProfileType[] = await response.json();
        console.log('profiles: ', profiles.length);
        return profiles;
    } catch (error) {
        console.error(
            'Failed to fetch suggested profiles:',
            error
        );

        return [];
    }
}

export async function fetchNearbyUsers(
    filters?: {
        minAge?: number;
        maxAge?: number;
        minFame?: number;
        maxDistance?: number;
        interests?: string[];
        sortBy?: 'distance' | 'fame' | 'age';
    }
): Promise<UserProfileType[]> {
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