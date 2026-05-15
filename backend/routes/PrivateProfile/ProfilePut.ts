import { Router } from "express"
import crypto from "crypto"

import { type AuthRequestType } from "../../../interfaces/AuthRequest.type"
import { authenticateToken } from "../../middleware/auth"
import unauthorized from "../../errorHttp/unauthorized"
import {type ValidationErrorType } from "../../../interfaces/ValidationError.type"
import { validateName } from "../../../frontend/src/validators/nameValidator"
import { validateGender } from "../../../frontend/src/validators/genderValidator"
import { validateSexualPreference } from "../../../frontend/src/validators/sexualPreferenceValidator"
import { validateAllowGps, validateLatitude, validateLongitude } from "../../../frontend/src/validators/coordinatesValidator"
import { validateBiography } from "../../../frontend/src/validators/biographyValidator"
import db from "../../database/db"
import getNodeMailer from "../../mailProvider/NodemailerProvider"
import {type UserProfileType } from "../../../interfaces/User.type"
import internalServerError from "../../errorHttp/internalServerError"
import {api} from "../../../frontend/src/api/routes"

const profilePutRoute = Router()
const profilePutApi = api.user.updateProfile

profilePutRoute[profilePutApi.method](profilePutApi.path, authenticateToken, async (req: AuthRequestType, res) => {
    try {
        const userId = req.user?.id
        if (!userId) {
            return unauthorized(res, "Unauthorized")
        }
        const { user: userUpdates, profile: profileUpdates } = req.body
        if (!userUpdates && !profileUpdates) {
            return res.status(400).json({ error: "No updates provided" })
        }
        const validationErrors: ValidationErrorType[] = []
        if (userUpdates) {
            if (userUpdates.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userUpdates.email)) {
                validationErrors.push({ field: 'email', error: 'Invalid email format' })
            }
            if (userUpdates.first_name) {
                const firstNameError = validateName(userUpdates.first_name, 'first_name')
                if (firstNameError) {
                    validationErrors.push({ field: firstNameError.field, error: firstNameError.message })
                }
            }
            if (userUpdates.last_name) {
                const lastNameError = validateName(userUpdates.last_name, 'last_name')
                if (lastNameError) {
                    validationErrors.push({ field: lastNameError.field, error: lastNameError.message })
                }
            }
            if (userUpdates.username) {
                validationErrors.push({ field: 'username', error: 'Username cannot be modified' })
            }
        }
        if (profileUpdates) {
            const genderError = validateGender(profileUpdates.gender)
            if (genderError) {
                validationErrors.push({
                    field: genderError.field,
                    error: genderError.error ?? genderError.message ?? 'Invalid gender value',
                })
            }
            const sexualPreferenceError = validateSexualPreference(profileUpdates.sexual_preference)
            if (sexualPreferenceError) {
                validationErrors.push({
                    field: sexualPreferenceError.field,
                    error: sexualPreferenceError.error ?? sexualPreferenceError.message ?? 'Invalid sexual preference value',
                })
            }
            const latitudeError = validateLatitude(profileUpdates.latitude)
            if (latitudeError) {
                validationErrors.push({
                    field: latitudeError.field,
                    error: latitudeError.error ?? latitudeError.message ?? 'Invalid latitude value',
                })
            }
            const longitudeError = validateLongitude(profileUpdates.longitude)
            if (longitudeError) {
                validationErrors.push({
                    field: longitudeError.field,
                    error: longitudeError.error ?? longitudeError.message ?? 'Invalid longitude value',
                })
            }
            const allowGpsError = validateAllowGps(profileUpdates.allow_gps)
            if (allowGpsError) {
                validationErrors.push({
                    field: allowGpsError.field,
                    error: allowGpsError.error ?? allowGpsError.message ?? 'allow_gps must be a boolean',
                })
            }
            const biographyError = validateBiography(profileUpdates.biography)
            if (biographyError) {
                validationErrors.push({
                    field: biographyError.field,
                    error: biographyError.error ?? biographyError.message ?? 'Invalid biography value',
                })
            }
        }
        if (validationErrors.length > 0) {
            return res.status(400).json({ errors: validationErrors })
        }
        let pendingEmailUpdate: string | null = null
        let pendingEmailVerification: { token: string; email: string } | null = null
        let verificationEmailSent = false
        if (userUpdates?.email) {
            const currentUserResult = await db.getPool().query(
                "SELECT email FROM users WHERE id = $1;",
                [userId]
            )
            if (!currentUserResult.rows.length) {
                return res.status(404).json({ error: "User not found" })
            }
            const currentEmail = currentUserResult.rows[0].email
            if (userUpdates.email !== currentEmail) {
                pendingEmailUpdate = userUpdates.email
            }
        }
        const client = await db.getPool().connect()
        try {
            await client.query('BEGIN')
            if (userUpdates && Object.keys(userUpdates).length > 0) {
                const updateFields = []
                const values = []
                let paramIndex = 1
                if (userUpdates.first_name) {
                    updateFields.push(`first_name = $${paramIndex++}`)
                    values.push(userUpdates.first_name)
                }
                if (userUpdates.last_name) {
                    updateFields.push(`last_name = $${paramIndex++}`)
                    values.push(userUpdates.last_name)
                }
                if (updateFields.length > 0) {
                    updateFields.push(`updated_at = NOW()`)
                    values.push(userId)
                    const updateQuery = `UPDATE users SET ${updateFields.join(', ')} WHERE id = $${paramIndex}`
                    await client.query(updateQuery, values)
                }
            }
            if (profileUpdates && Object.keys(profileUpdates).length > 0) {
                // Vérifier si le profil existe
                const profileExists = await client.query('SELECT user_id FROM profiles WHERE user_id = $1', [userId])
                if (profileExists.rows.length > 0) {
                    const updateFields = []
                    const values = []
                    let paramIndex = 1
                    if (profileUpdates.gender !== undefined) {
                        updateFields.push(`gender = $${paramIndex++}`)
                        values.push(profileUpdates.gender)
                    }
                    if (profileUpdates.sexual_preference !== undefined) {
                        updateFields.push(`sexual_preference = $${paramIndex++}`)
                        values.push(profileUpdates.sexual_preference)
                    }
                    if (profileUpdates.biography !== undefined) {
                        updateFields.push(`biography = $${paramIndex++}`)
                        values.push(profileUpdates.biography)
                    }
                    if (profileUpdates.location !== undefined) {
                        updateFields.push(`location = $${paramIndex++}`)
                        values.push(profileUpdates.location)
                    }
                    if (profileUpdates.latitude !== undefined) {
                        updateFields.push(`latitude = $${paramIndex++}`)
                        values.push(profileUpdates.latitude)
                    }
                    if (profileUpdates.longitude !== undefined) {
                        updateFields.push(`longitude = $${paramIndex++}`)
                        values.push(profileUpdates.longitude)
                    }
                    if (profileUpdates.allow_gps !== undefined) {
                        updateFields.push(`allow_gps = $${paramIndex++}`)
                        values.push(profileUpdates.allow_gps)
                    }
                    const nextLatitude =
                        profileUpdates.latitude !== undefined
                            ? profileUpdates.latitude
                            : null
                    const nextLongitude =
                        profileUpdates.longitude !== undefined
                            ? profileUpdates.longitude
                            : null
                    if (nextLatitude !== null && nextLongitude !== null) {
                        updateFields.push(`
                            coordinates =
                            ST_SetSRID(
                                ST_MakePoint($${paramIndex + 1}, $${paramIndex}),
                                4326
                            )::geography
                        `)
                        values.push(nextLatitude)
                        values.push(nextLongitude)

                        paramIndex += 2
                    }
                    if (updateFields.length > 0) {
                        updateFields.push(`updated_at = NOW()`)
                        values.push(userId)
                        const updateQuery = `UPDATE profiles SET ${updateFields.join(', ')} WHERE user_id = $${paramIndex}`
                        await client.query(updateQuery, values)
                    }
                } else {
                    const insertFields = ['user_id']
                    const placeholders = ['$1']
                    const values = [userId]
                    let paramIndex = 2

                    if (profileUpdates.gender !== undefined) {
                        insertFields.push('gender')
                        placeholders.push(`$${paramIndex++}`)
                        values.push(profileUpdates.gender)
                    }
                    if (profileUpdates.sexual_preference !== undefined) {
                        insertFields.push('sexual_preference')
                        placeholders.push(`$${paramIndex++}`)
                        values.push(profileUpdates.sexual_preference)
                    }
                    if (profileUpdates.biography !== undefined) {
                        insertFields.push('biography')
                        placeholders.push(`$${paramIndex++}`)
                        values.push(profileUpdates.biography)
                    }
                    if (profileUpdates.location !== undefined) {
                        insertFields.push('location')
                        placeholders.push(`$${paramIndex++}`)
                        values.push(profileUpdates.location)
                    }
                    if (profileUpdates.latitude !== undefined) {
                        insertFields.push('latitude')
                        placeholders.push(`$${paramIndex++}`)
                        values.push(profileUpdates.latitude)
                    }
                    if (profileUpdates.longitude !== undefined) {
                        insertFields.push('longitude')
                        placeholders.push(`$${paramIndex++}`)
                        values.push(profileUpdates.longitude)
                    }
                    if (profileUpdates.allow_gps !== undefined) {
                        insertFields.push('allow_gps')
                        placeholders.push(`$${paramIndex++}`)
                        values.push(profileUpdates.allow_gps)
                    }
                    if (
                        profileUpdates.latitude !== undefined &&
                        profileUpdates.longitude !== undefined
                    ) {
                        insertFields.push('coordinates')
                        placeholders.push(`
                            ST_SetSRID(
                                ST_MakePoint($${paramIndex + 1}, $${paramIndex}),
                                4326
                            )::geography
                        `)

                        values.push(profileUpdates.latitude)
                        values.push(profileUpdates.longitude)

                        paramIndex += 2
                    }
                    const insertQuery = `INSERT INTO profiles (${insertFields.join(', ')}) VALUES (${placeholders.join(', ')})`
                    await client.query(insertQuery, values)
                }
            }
            if (pendingEmailUpdate) {
                await client.query('DELETE FROM email_verifications WHERE user_id = $1', [userId])
                const verificationToken = crypto.randomBytes(32).toString('hex')
                const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
                await client.query(
                    "INSERT INTO email_verifications (user_id, token, expires_at, new_email) VALUES ($1, $2, $3, $4)",
                    [userId, verificationToken, expiresAt, pendingEmailUpdate]
                )
                pendingEmailVerification = {
                    token: verificationToken,
                    email: pendingEmailUpdate,
                }
            }
            await client.query('COMMIT')
            if (pendingEmailVerification) {
                try {
                    const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${pendingEmailVerification.token}`
                    await getNodeMailer().sendMail({
                        from: process.env.GMAIL_MAIL,
                        to: pendingEmailVerification.email,
                        subject: 'Verify your new email',
                        html: `<p>You requested an email change for Matcha.</p><p>Please click the link below to confirm your new email address:</p><a target="_blank" href="${verificationLink}">Verify Email</a><p>This link will expire in 24 hours.</p>`
                    })
                    verificationEmailSent = true
                } catch (sendErr) {
                    console.error('Error sending email verification for profile update', sendErr)
                }
            }
            const result = await client.query(
                `SELECT
                    u.id AS user_id,
                    u.email,
                    u.username,
                    u.first_name,
                    u.last_name,
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
            const responsePayload: Record<string, unknown> = { user }
            if (pendingEmailUpdate) {
                responsePayload.email_verification_sent = verificationEmailSent
                responsePayload.message = verificationEmailSent
                    ? 'Profile updated, please verify your new email to complete the change.'
                    : 'Profile updated, but verification email could not be sent. Please retry email change.'
            }
            res.json(responsePayload)
        } catch (dbError) {
            await client.query('ROLLBACK')
            throw dbError
        } finally {
            client.release()
        }
    } catch (err) {
        return internalServerError(res, err, "Error updating user profile")
    }
})

export default profilePutRoute