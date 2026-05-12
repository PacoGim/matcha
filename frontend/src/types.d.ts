declare module '*.css';

export interface User {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  age: number;
  is_verified: boolean;
  fame_rating: number;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  user_id: string;
  gender: 'male' | 'female' | 'other' | 'null';
  sexual_preference: 'male' | 'female' | 'both';
  biography: string;
  location: string;
  latitude: number;
  age: number;
  longitude: number;
  allow_gps: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserProfile extends User {
  profile: Profile;
    photos: {
    large: string;
    medium: string;
    thumbnail: string;
    };
}

export interface RandomUserAPI {
    results: {
        email: string;

        gender: string;

        name: {
            first: string;
            last: string;
        };

        login: {
            uuid: string;
            username: string;
        };

        location: {
            city: string;
            state: string;
            country: string;
        };

        picture: {
            large: string;
            medium: string;
            thumbnail: string;
        };
    }[];
}