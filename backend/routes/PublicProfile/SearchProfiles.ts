import { Router } from "express"
import db from "../../database/db"
import dotenv from "dotenv"
import path from "path"
import {api} from "../../../frontend/src/api/routes"

const __dirname = path.resolve()
dotenv.config({
    path: path.resolve(__dirname, "../.env")
})

const searchProfilesRoute = Router()
const searchProfilesApi = api.app.search

import { authenticateToken } from "../../middleware/auth"
import unauthorized from "../../errorHttp/unauthorized"
import internalServerError from "../../errorHttp/internalServerError"
import { AuthRequestType } from "../../../interfaces/AuthRequest.type"

searchProfilesRoute[searchProfilesApi.method](
    searchProfilesApi.path,
    authenticateToken,
    async (req: AuthRequestType, res) => {
        try {
            const userId = req.user?.id

            if (!userId) {
                return unauthorized(res, "Unauthorized")
            }
            const currentResult = await db.getPool().query(
                `
                SELECT
                    u.id,
                    u.birthdate,
                    u.fame_rating,
                    p.gender,
                    p.sexual_preference,
                    p.allow_gps,
                    p.coordinates,
                    ST_Y(p.coordinates::geometry) AS latitude,
                    ST_X(p.coordinates::geometry) AS longitude
                FROM users u
                JOIN profiles p
                    ON u.id = p.user_id
                WHERE u.id = $1
                `,
                [userId]
            )

            if (!currentResult.rows.length) {
                return res.status(404).json({
                    error: "User not found",
                })
            }

            const current = currentResult.rows[0]

            if (!current.allow_gps || !current.coordinates) {
                return res.status(400).json({
                    error:
                        "Current user location is required and GPS must be allowed",
                })
            }

            // Parse query parameters with defaults
            const maxDistanceKm = Number(req.query.max_distance) || 50
            const minAge = Number(req.query.min_age) || 18
            const maxAge = Number(req.query.max_age) || 99
            const minFame = Number(req.query.min_fame) || 0
            const sortBy = (req.query.sort_by as string) || "distance" // distance, fame, age
            const interests = req.query.interests ? (req.query.interests as string).split(",") : []

            const maxDistanceMeters = maxDistanceKm * 1000

            const currentGender = current.gender ?? null
            const currentPreference = current.sexual_preference ?? "both"

            // Build age filter
            const ageFilterCondition = `
                AND DATE_PART('year', AGE(u.birthdate)) >= $6
                AND DATE_PART('year', AGE(u.birthdate)) <= $7
            `

            // Build fame filter
            const fameFilterCondition = `
                AND u.fame_rating >= $8
            `

            // Build interests filter
            let interestsJoin = ""
            let interestsCondition = ""
            if (interests.length > 0) {
                interestsJoin = `
                    LEFT JOIN user_tags ut ON u.id = ut.user_id
                    LEFT JOIN tags t ON ut.tag_id = t.id
                `
                interestsCondition = `
                    AND t.name IN (${interests.map((_, i) => `$${9 + i}`).join(",")})
                `
            }

            // Build order by clause
            let orderByClause = "distance_km ASC"
            if (sortBy === "fame") {
                orderByClause = "u.fame_rating DESC"
            } else if (sortBy === "age") {
                orderByClause = "DATE_PART('year', AGE(u.birthdate))"
            }

            const nearbyQuery = `
                SELECT DISTINCT
                    u.id,
                    u.username,
                    u.first_name,
                    u.last_name,
                    DATE_PART('year', AGE(u.birthdate)) AS age,
                    u.fame_rating,
                    p.gender,
                    p.sexual_preference,
                    p.biography,
                    p.location,
                    p.allow_gps,
                    ST_Y(p.coordinates::geometry) AS latitude,
                    ST_X(p.coordinates::geometry) AS longitude,
                    ROUND(
                        (
                            ST_Distance(
                                p.coordinates,
                                $1
                            ) / 1000
                        )::numeric,
                        2
                    ) AS distance_km
                FROM users u
                JOIN profiles p ON u.id = p.user_id
                ${interestsJoin}
                WHERE u.id != $2
                    AND p.allow_gps = true
                    AND p.coordinates IS NOT NULL
                    AND p.gender::text != 'null'
                    AND (
                        $3 = 'both'
                        OR p.gender::text = $3
                    )
                    AND (
                        $4::text IS NULL
                        OR p.sexual_preference::text = 'both'
                        OR p.sexual_preference::text = $4::text
                    )
                    AND ST_DWithin(
                        p.coordinates,
                        $1,
                        $5
                    )
                    ${ageFilterCondition}
                    ${fameFilterCondition}
                    ${interestsCondition}
                ORDER BY ${orderByClause}
                LIMIT 50;
            `

            // Build query parameters array
            const queryParams: any[] = [
                current.coordinates,
                userId,
                currentPreference,
                currentGender,
                maxDistanceMeters,
                minAge,
                maxAge,
                minFame
            ]

            // Add interest parameters if any
            if (interests.length > 0) {
                queryParams.push(...interests)
            }

            const nearbyResult = await db.getPool().query(nearbyQuery, queryParams)

            return res.json({
                current_location: {
                    latitude: current.latitude,
                    longitude: current.longitude,
                },
                filters: {
                    max_distance_km: maxDistanceKm,
                    min_age: minAge,
                    max_age: maxAge,
                    min_fame: minFame,
                    sort_by: sortBy,
                    interests: interests
                },
                users: nearbyResult.rows,
            })

        } catch (err) {
            return internalServerError(res, err, "Error finding nearby users")
        }
    }
)

export default searchProfilesRoute
