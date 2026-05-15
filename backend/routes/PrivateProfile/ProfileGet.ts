import e, { Router } from "express"
import { authenticateToken } from "../../middleware/auth"
import unauthorized from "../../errorHttp/unauthorized"
import db from "../../database/db"
import internalServerError from "../../errorHttp/internalServerError"
import {api} from "../../../frontend/src/api/routes"

//*********************** Types ********************\\
import { type AuthRequestType } from "../../../interfaces/AuthRequest.type"
import { type UserProfileType } from "../../../interfaces/User.type"

const profileGetRoute = Router()
const profileGetApi = api.user.profile

profileGetRoute[profileGetApi.method](profileGetApi.path, authenticateToken, async (req: AuthRequestType, res) => {
    try {
        const userId = req.user?.id

        if (!userId) {
            return unauthorized(res, "Unauthorized")
        }

        const result = await db.getPool().query(
            `SELECT
                u.id AS user_id,
                u.email,
                u.username,
                u.first_name,
                u.last_name,
                DATE_PART('year', AGE(u.birthdate)) AS age,
                u.is_verified,
                u.fame_rating,
                u.created_at AS user_created_at,
                u.updated_at AS user_updated_at,
                p.gender,
                p.sexual_preference,
                p.biography,
                p.location,
                ST_Y(p.coordinates::geometry) AS latitude,
                ST_X(p.coordinates::geometry) AS longitude,
                p.allow_gps,
                p.created_at AS profile_created_at,
                p.updated_at AS profile_updated_at
            FROM users u
            LEFT JOIN profiles p ON u.id = p.user_id
            WHERE u.id = $1;`,
            [userId]
        )

        if (!result.rows.length) {
            return res.status(404).json({ error: "User not found" })
        }

        const row = result.rows[0]
        const user: UserProfileType = {
            id: row.user_id,
            email: row.email,
            username: row.username,
            first_name: row.first_name,
            last_name: row.last_name,
            age: row.age,
            is_verified: row.is_verified,
            fame_rating: row.fame_rating,
            created_at: row.user_created_at,
            updated_at: row.user_updated_at,
            profile: {
                gender: row.gender,
                sexual_preference: row.sexual_preference,
                biography: row.biography,
                location: row.location,
                latitude: row.latitude,
                longitude: row.longitude,
                allow_gps: row.allow_gps,
            },
        }

        res.json(user)
    } catch (err) {
        return internalServerError(res, err, "Error fetching user profile")
    }
})

export default profileGetRoute
