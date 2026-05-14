import { Router } from "express"
import db from "../../database/db"
import crypto from "crypto"

import internalServerError from "../../errorHttp/internalServerError"
import transporter from "../../mailProvider/NodemailerProvider"

const forgotPasswordRoute = Router()

forgotPasswordRoute.post("/user/forgot-password", async (req, res) => {
    try {
        const { email } = req.body

        console.log("Forgot password request for email:", email)

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ error: "Valid email is required" })
        }
        console.log(-1)
        const result = await db.getPool().query("SELECT id FROM users WHERE email = $1;", [email])
        console.log(0)
        console.log("Database query result for forgot password:", result.rows)
        if (result.rows.length) {
            const userId = result.rows[0].id
            const resetToken = crypto.randomBytes(32).toString('hex')
            const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

            console.log(1)
            await db.getPool().query("DELETE FROM password_resets WHERE user_id = $1;", [userId])
            console.log(2)
            await db.getPool().query(
                "INSERT INTO password_resets (user_id, token, expires_at) VALUES ($1, $2, $3);",
                [userId, resetToken, expiresAt]
            )
            console.log(3)
            const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`
            const response = await transporter.sendMail({
                from: process.env.GMAIL_MAIL,
                to: email,
                subject: 'Reset your Matcha password',
                html: `<p>You requested a password reset for Matcha.</p><p>Please click the link below to reset your password:</p><a target="_blank" href="${resetLink}">Reset Password</a><p>This link will expire in 1 hour.</p>`
            })
            console.log("Password reset email sent:", response)
        }

        res.json({ message: "If an account with that email exists, a password reset link has been sent." })
    } catch (err) {
        return internalServerError(res, err, "Error sending password reset email")
    }
})

export default forgotPasswordRoute