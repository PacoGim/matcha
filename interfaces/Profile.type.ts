export interface ProfileType {
    gender: 'male' | 'female' | 'other';
    sexual_preference: 'male' | 'female' | 'both';
    biography: string;
    location: string;
    latitude: number;
    longitude: number;
    allow_gps: boolean;
    user_id?: string;
    age?: number;
    created_at?: string;
    updated_at?: string;
}