import type { ProfileType } from "./Profile.type";

export interface BaseUserType {
    id: string;
    email: string;
    username: string;
}

export interface UserType extends BaseUserType {
    first_name: string;
    last_name: string;
    age: number;
    is_verified: boolean;
    fame_rating: number;
    created_at: string;
    updated_at: string;
}

export interface UserProfileType extends UserType {
    profile: ProfileType
}

interface PublicUserType {
    id: string;
    username: string;
}
