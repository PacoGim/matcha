import { UserType } from './User.type'

export interface ProfileCardType {
    profile: UserType
    onLike: (userId: string) => void
    onPass: (userId: string) => void
    onViewProfile: (userId: string) => void
    compact?: boolean
    gridView?: boolean
}