import { Router } from "express"
import { compare, hash } from "bcrypt"

import { validatePassword } from "../../../frontend/src/validators/passwordValidator"
import unauthorized from "../../errorHttp/unauthorized"
import db from "../../database/db"
import internalServerError from "../../errorHttp/internalServerError"
import {api} from "../../../frontend/src/api/routes"

const resetPasswordRoute = Router()
const resetPasswordApi = api.user.resetPassword

resetPasswordRoute[resetPasswordApi.method](resetPasswordApi.path, async (req, res) => {
    try {
        const { token, new_password } = req.body
        if (!token || !new_password) {
            return res.status(400).json({ error: "Token and new_password are required" })
        }
        const passwordError = validatePassword(new_password)
        if (passwordError) {
            return res.status(400).json({ error: passwordError.message, field: passwordError.field })
        }
        const result = await db.getPool().query(
            "SELECT user_id, expires_at FROM password_resets WHERE token = $1;",
            [token]
        )
        if (!result.rows.length) {
            return unauthorized(res, "Invalid or expired token")
        }
        const { user_id, expires_at } = result.rows[0]
        if (new Date() > new Date(expires_at)) {
            return unauthorized(res, "Invalid or expired token")
        }
        const userResult = await db.getPool().query("SELECT password_hash FROM users WHERE id = $1;", [user_id])
        if (!userResult.rows.length) {
            return res.status(404).json({ error: "User not found" })
        }
        const isSamePassword = await compare(new_password, userResult.rows[0].password_hash)
        if (isSamePassword) {
            return res.status(400).json({ error: "New password cannot be the same as the current password" })
        }
        const hashedPassword = await hash(new_password, 10)
        await db.getPool().query(
            "UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2;",
            [hashedPassword, user_id]
        )
        await db.getPool().query("DELETE FROM password_resets WHERE token = $1;", [token])
        res.json({ message: "Password has been reset successfully" })
    } catch (err) {
        return internalServerError(res, err, "Error resetting password")
    }
})

export default resetPasswordRoute