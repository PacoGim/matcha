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
        // console.log("userRoute", req)
        const result = await db.getPool().query("SELECT * FROM users;")
        res.json(result.rows)
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: "DB error" })
    }
})

userRoute.post("/user/check-email-token", async (req, res) => {
    try {
        const { token } = req.body

        if (!token) {
            return res.status(400).json({ error: "Token required" })
        }

        const result = await db.getPool().query(
            "SELECT user_id, expires_at FROM email_verifications WHERE token = $1;",
            [token]
        )

        if (!result.rows.length) {
            return res.status(401).json({ error: "Invalid token" })
        }

        const { user_id, expires_at } = result.rows[0]

        if (new Date() > new Date(expires_at)) {
            return res.status(401).json({ error: "Token expired" })
        }

        // Update user as verified
        await db.getPool().query(
            "UPDATE users SET is_verified = true WHERE id = $1;",
            [user_id]
        )

        // Delete the token
        await db.getPool().query(
            "DELETE FROM email_verifications WHERE token = $1;",
            [token]
        )

        res.json({ message: "Email verified successfully" })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: "Server error" })
    }
})

userRoute.post("/user/register", async (req, res) => {
    try {
        const { email, username, password, first_name, last_name } = req.body

        // Validate username
        const usernameError = validateUsername(username)
        if (usernameError) {
            return res.status(400).json({ 
                error: usernameError.message,
                field: usernameError.field 
            })
        }

        // Validate first_name
        const firstNameError = validateName(first_name, 'first_name')
        if (firstNameError) {
            return res.status(400).json({ 
                error: firstNameError.message,
                field: firstNameError.field 
            })
        }

        // Validate last_name
        const lastNameError = validateName(last_name, 'last_name')
        if (lastNameError) {
            return res.status(400).json({ 
                error: lastNameError.message,
                field: lastNameError.field 
            })
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
                "INSERT INTO email_verifications (user_id, token, expires_at) VALUES ($1, $2, $3);",
                [result.rows[0].id, verificationToken, expiresAt]
            )
            res.json({ message: "Registration successful, please check your email to verify your account" })
        }).catch(err => {
            console.error("Error sending email", err);
            res.status(500).json({ error: "Try again later 106" })
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
        
        res.status(500).json({ error: "Try again later 111" })
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
        res.status(500).json({ error: "Server error" })
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
        res.status(500).json({ error: "Server error" })
    }
})

userRoute.get("/user/profile", authenticateToken, async (req: AuthRequest, res) => {
    try {
        const userId = req.user?.id

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" })
        }

        const result = await db.getPool().query(
            "SELECT id, email, username, first_name, last_name, is_verified, created_at FROM users WHERE id=$1;",
            [userId]
        )

        if (!result.rows.length) {
            return res.status(404).json({ error: "User not found" })
        }

        res.json({ user: result.rows[0] })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: "Server error" })
    }
})

export default userRoute