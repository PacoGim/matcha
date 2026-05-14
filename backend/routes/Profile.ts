import { Router } from "express"
import db from "../database/db"
import { authenticateToken } from "../middleware/auth"
import unauthorized from "../errorHttp/unauthorized"
import internalServerError from "../errorHttp/internalServerError"
import type { AuthRequestType } from "../../interfaces/AuthRequest.type"
import type { UserProfileType } from "../../interfaces/User.type"

const profileRoute = Router()

profileRoute.get("/profile/:id", async (req, res) => {
    try {
        const userId = req.params.id
        const result = await db.getPool().query("SELECT email,username,first_name,last_name,created_at FROM profiles WHERE user_id=$1;", [userId])
        res.json(result.rows)
    } catch (err) {
        return internalServerError(res, err, "Error fetching profile")
    }
})

profileRoute.get("/profiles", authenticateToken, async (req: AuthRequestType, res) => {
    try {
        const currentUserId = req.user?.id
        if (!currentUserId) {
            return unauthorized(res, "User not authenticated")
        }

        const count = parseInt(req.query.count as string) || 20

        // Get all users with profiles (excluding current user)
        const result = await db.getPool().query(`
            SELECT u.id, u.first_name, u.last_name, u.email, u.username,
                u.is_verified, u.fame_rating, u.created_at, u.updated_at,
                p.gender, p.sexual_preference, DATE_PART('year', AGE(u.birthdate)) AS age,
                p.biography, p.location, p.latitude,p.longitude, p.coordinates, p.allow_gps,
                p.created_at as profile_created_at, p.updated_at as profile_updated_at
            FROM users u
            LEFT JOIN profiles p ON u.id = p.user_id
            WHERE u.id != $1 AND p.user_id IS NOT NULL
            LIMIT $2
        `, [currentUserId, count])

        // Transform to UserProfile format with mocked photos
        const userProfiles : UserProfileType[] = result.rows.map(profile => ({
            id: profile.id,
            email: profile.email,
            username: profile.username,
            first_name: profile.first_name,
            last_name: profile.last_name,
            is_verified: profile.is_verified,
            fame_rating: profile.fame_rating,
            age: profile.age,
            created_at: profile.created_at,
            updated_at: profile.updated_at,
            profile: {
                user_id: profile.id,
                gender: profile.gender,
                sexual_preference: profile.sexual_preference,
                biography: profile.biography,
                location: profile.location,
                latitude: profile.latitude,
                longitude: profile.longitude,
                coordinates: profile.coordinates,
                allow_gps: profile.allow_gps,
                created_at: profile.profile_created_at,
                updated_at: profile.profile_updated_at
            }
        }))

        res.json(userProfiles)
    } catch (err) {
        return internalServerError(res, err, "Error fetching profiles")
    }
})

export default profileRoute