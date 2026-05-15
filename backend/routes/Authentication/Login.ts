import { Router } from "express"
import jwt from "jsonwebtoken"
import { compare } from "bcrypt"

import unauthorized from "../../errorHttp/unauthorized"
import internalServerError from "../../errorHttp/internalServerError"
import db from "../../database/db"
import {api} from "../../../frontend/src/api/routes"

const loginRoute = Router()
const loginApi = api.auth.login

const maxAge = 24 * 60 * 60 * 1000

loginRoute[loginApi.method](loginApi.path, async (req, res) => {
    try {
        const { email, password } = req.body
        const result = await db.getPool().query("SELECT id, email, username, password_hash, is_verified FROM users WHERE email=$1;", [email])
        if (!result.rows.length) {
            return unauthorized(res, `Invalid credentials for: email: ${email}`)
        }
        const user = result.rows[0]
        if (!user.is_verified) {
            return unauthorized(res, `Please verify your email before logging in for: email: ${email}`)
        }
        const isMatch = await compare(password, user.password_hash)
        if (!isMatch) {
            return unauthorized(res, `Invalid credentials for: email: ${email}`)
        }
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
            maxAge: maxAge,
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
        return internalServerError(res, err, "Error logging in")
    }
})

export default loginRoute