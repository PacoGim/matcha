import { Router } from "express"
import { hash } from "bcrypt"
import crypto from "crypto"

import db from "../../database/db"
import transporter from "../../mailProvider/NodemailerProvider"
import type { FieldErrorType } from "../../../interfaces/FieldError.type"
import { validateUsername } from "../../../frontend/src/validators/usernameValidator"
import { validateName } from "../../../frontend/src/validators/nameValidator"
import { validatePassword } from "../../../frontend/src/validators/passwordValidator"
import { validateBirthdate } from "../../../frontend/src/validators/birthdateValidator"
import internalServerError from "../../errorHttp/internalServerError"
import {api} from "../../../frontend/src/api/routes"

const registerRoute = Router()
const registerApi = api.auth.register

registerRoute[registerApi.method](registerApi.path, async (req, res) => {
    try {
        const { email, username, password, first_name, last_name, birthdate } = req.body
        const validationErrors: FieldErrorType = {}
        const usernameError = validateUsername(username)
        if (usernameError) {
            validationErrors[usernameError.field] = usernameError.message
        }
        const firstNameError = validateName(first_name, 'first_name')
        if (firstNameError) {
            validationErrors[firstNameError.field] = firstNameError.message
        }
        const lastNameError = validateName(last_name, 'last_name')
        if (lastNameError) {
            validationErrors[lastNameError.field] = lastNameError.message
        }
        const passwordError = validatePassword(password)
        if (passwordError) {
            validationErrors[passwordError.field] = passwordError.message
        }
        const birthdateError = validateBirthdate(birthdate)
        if (birthdateError) {
            validationErrors[birthdateError.field] = birthdateError.message
        }
        if (Object.keys(validationErrors).length > 0) {
            return res.status(400).json({ errors: validationErrors })
        }
        const hashedPassword = await hash(password, 10)
        const result = await db.getPool().query("INSERT INTO users (email, username, password_hash, first_name, last_name, birthdate) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id;", [email, username, hashedPassword, first_name, last_name, birthdate])
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
            return internalServerError(res, err, "Error sending verification email")
        })
    } catch (err) {
        console.error("user.ts registration error", err)
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
        return internalServerError(res, err, "Error registering user")
    }
})

export default registerRoute