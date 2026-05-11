import { Router } from "express"
import db from "../database/db"
import { hash, compare } from "bcrypt"
import dotenv from "dotenv"
import path from "path"
const __dirname = path.resolve()
dotenv.config({
    path: path.resolve(__dirname, "../.env")
})
import crypto from "crypto"
import jwt from "jsonwebtoken"
const userRoute = Router()

import { authenticateToken, AuthRequest } from "../middleware/auth"
import { validateUsername } from "../../frontend/src/validators/usernameValidator"
import { validateName } from "../../frontend/src/validators/nameValidator"
import { validatePassword } from "../../frontend/src/validators/passwordValidator"
import { validateGender } from "../../frontend/src/validators/genderValidator"
import { validateSexualPreference } from "../../frontend/src/validators/sexualPreferenceValidator"
import { validateBiography } from "../../frontend/src/validators/biographyValidator"
import { validateLatitude, validateLongitude, validateAllowGps } from "../../frontend/src/validators/coordinatesValidator"

import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GMAIL_MAIL,
        pass: process.env.GMAIL_APP_PWD
    }
})

userRoute.get("/users", async (req, res) => {
    try {
        const result = await db.getPool().query("SELECT * FROM users;")
        res.json(result.rows)
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: "Server error 36" })
    }
})

userRoute.post("/user/check-email-token", async (req, res) => {
    try {
        const { token } = req.body

        if (!token) {
            return res.status(400).json({ error: "Token required" })
        }

        const result = await db.getPool().query(
            "SELECT user_id, new_email, expires_at FROM email_verifications WHERE token = $1;",
            [token]
        )

        if (!result.rows.length) {
            return res.status(401).json({ error: "Invalid token" })
        }

        const { user_id, new_email, expires_at } = result.rows[0]

        if (new Date() > new Date(expires_at)) {
            return res.status(401).json({ error: "Token expired" })
        }

        if (new_email) {
            await db.getPool().query(
                "UPDATE users SET email = $1 WHERE id = $2;",
                [new_email, user_id]
            )
        } else {
            await db.getPool().query(
                "UPDATE users SET is_verified = true WHERE id = $1;",
                [user_id]
            )

            await db.getPool().query(
                "INSERT INTO profiles (user_id, gender) VALUES ($1, $2);",
                [user_id, 'null']
            )
        }

        await db.getPool().query(
            "DELETE FROM email_verifications WHERE token = $1;",
            [token]
        )

        res.json({ message: new_email ? "Email updated successfully" : "Email verified successfully" })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: "Server error 83" })
    }
})

userRoute.post("/user/register", async (req, res) => {
    try {
        const { email, username, password, first_name, last_name } = req.body

        const validationErrors: { field: string; error: string }[] = []
        // Validate username
        const usernameError = validateUsername(username)
        if (usernameError) {
            validationErrors.push({ 
                error: usernameError.message,
                field: usernameError.field 
            })
        }

        // Validate first_name
        const firstNameError = validateName(first_name, 'first_name')
        if (firstNameError) {
            validationErrors.push({ 
                error: firstNameError.message,
                field: firstNameError.field 
            })
        }

        // Validate last_name
        const lastNameError = validateName(last_name, 'last_name')
        if (lastNameError) {
            validationErrors.push({ 
                error: lastNameError.message,
                field: lastNameError.field 
            })
        }

        // Validate password
        const passwordError = validatePassword(password)
        if (passwordError) {
            validationErrors.push({ 
                error: passwordError.message,
                field: passwordError.field 
            })
        }

        if (validationErrors.length > 0) {
            return res.status(400).json({ errors: validationErrors })
        }

        const hashedPassword = await hash(password, 10)
        // console.log("userRegister", req.body, hashedPassword)
        const result = await db.getPool().query("INSERT INTO users (email, username, password_hash, first_name, last_name) VALUES ($1, $2, $3, $4, $5) RETURNING id;", [email, username, hashedPassword, first_name, last_name])

        // Generate verification token
        const verificationToken = crypto.randomBytes(32).toString('hex')
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours


        const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`

        transporter.sendMail({
            from: process.env.GMAIL_MAIL,
            to: email,
            subject: 'Verify your email',
            html: `<p>Welcome to Matcha!</p><p>Please click the link below to verify your email and activate your account:</p><a target="_blank" href="${verificationLink}">Verify Email</a><p>This link will expire in 24 hours.</p>`
        }).then(async response => {
            console.log("Verification email sent", response)
            await db.getPool().query(
                "INSERT INTO email_verifications (user_id, token, expires_at, new_email) VALUES ($1, $2, $3, $4);",
                [result.rows[0].id, verificationToken, expiresAt, null]
            )
            res.json({ message: "Registration successful, please check your email to verify your account" })
        }).catch(err => {
            console.error("Error sending email", err);
            res.status(500).json({ error: "Try again later 152" })
        })

    } catch (err) {
        console.error("user.ts registration error", err)
        
        // Check for database constraint errors
        if (err instanceof Error) {
            const errorMessage = err.message.toLowerCase()
            
            if (errorMessage.includes('username') && errorMessage.includes('unique')) {
                return res.status(400).json({ 
                    error: 'Username already taken',
                    field: 'username'
                })
            }
            
            if (errorMessage.includes('email') && errorMessage.includes('unique')) {
                return res.status(400).json({ 
                    error: 'Email already registered',
                    field: 'email'
                })
            }
        }
        
        res.status(500).json({ error: "Try again later 177" })
    }
})

userRoute.post("/user/login", async (req, res) => {
    try {
        const { email, password } = req.body

        const result = await db.getPool().query("SELECT id, email, username, password_hash, is_verified FROM users WHERE email=$1;", [email])

        if (!result.rows.length) {
            return res.status(401).json({ error: "Invalid credentials" })
        }

        const user = result.rows[0]

        if (!user.is_verified) {
            return res.status(401).json({ error: "Please verify your email before logging in" })
        }

        const isMatch = await compare(password, user.password_hash)

        if (!isMatch) {
            return res.status(401).json({ error: "Invalid credentials" })
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                username: user.username
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        )

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000,
        })

        res.json({
            message: "Login successful",
            user: {
                id: user.id,
                email: user.email,
                username: user.username
            }
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: "Server error 231" })
    }
})

userRoute.post("/user/logout", async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
        })
        res.json({ message: "Logout successful" })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: "Server error 245" })
    }
})

userRoute.get("/user/profile", authenticateToken, async (req: AuthRequest, res) => {
    try {
        const userId = req.user?.id

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" })
        }

        const result = await db.getPool().query(
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
                p.latitude,
                p.longitude,
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
        const user = {
            email: row.email,
            username: row.username,
            first_name: row.first_name,
            last_name: row.last_name,
            fame_rating: row.fame_rating,
            created_at: row.user_created_at,
            updated_at: row.user_updated_at,
        }
        const profile = {   
            gender: row.gender,
            sexual_preference: row.sexual_preference,
            biography: row.biography,
            location: row.location,
            latitude: row.latitude,
            longitude: row.longitude,
            allow_gps: row.allow_gps,
        }

        res.json({user, profile})
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: "Server error 311" })
    }
})

userRoute.put("/user/profile", authenticateToken, async (req: AuthRequest, res) => {
    try {
        const userId = req.user?.id

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" })
        }

        const { user: userUpdates, profile: profileUpdates } = req.body

        if (!userUpdates && !profileUpdates) {
            return res.status(400).json({ error: "No updates provided" })
        }

        // Validation des champs user
        const validationErrors: { field: string; error: string }[] = []

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

            // Username ne peut pas être modifié
            if (userUpdates.username) {
                validationErrors.push({ field: 'username', error: 'Username cannot be modified' })
            }
        }

        // Validation des champs profile
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

            // Mise à jour de l'utilisateur
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

            // Mise à jour ou insertion du profil
            if (profileUpdates && Object.keys(profileUpdates).length > 0) {
                // Vérifier si le profil existe
                const profileExists = await client.query('SELECT user_id FROM profiles WHERE user_id = $1', [userId])

                if (profileExists.rows.length > 0) {
                    // Mise à jour
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

                    if (updateFields.length > 0) {
                        updateFields.push(`updated_at = NOW()`)
                        values.push(userId)
                        const updateQuery = `UPDATE profiles SET ${updateFields.join(', ')} WHERE user_id = $${paramIndex}`
                        await client.query(updateQuery, values)
                    }
                } else {
                    // Insertion
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
                    await transporter.sendMail({
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

            // Retourner le profil mis à jour
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
                    p.latitude,
                    p.longitude,
                    p.allow_gps,
                    p.created_at AS profile_created_at,
                    p.updated_at AS profile_updated_at
                FROM users u
                LEFT JOIN profiles p ON u.id = p.user_id
                WHERE u.id = $1;`,
                [userId]
            )

            const row = result.rows[0]
            const user = {
                email: row.email,
                username: row.username,
                first_name: row.first_name,
                last_name: row.last_name,
                is_verified: row.is_verified,
                fame_rating: row.fame_rating,
                created_at: row.user_created_at,
                updated_at: row.user_updated_at,
            }
            const profile = {
                gender: row.gender,
                sexual_preference: row.sexual_preference,
                biography: row.biography,
                location: row.location,
                latitude: row.latitude,
                longitude: row.longitude,
                allow_gps: row.allow_gps,
            }

            const responsePayload: Record<string, unknown> = { user, profile }
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
        console.error(err)
        res.status(500).json({ error: "Server error 563" })
    }
})

export default userRoute