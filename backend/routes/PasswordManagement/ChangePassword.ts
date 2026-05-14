import { Router } from "express"
import { hash } from "bcrypt"

import db from "../../database/db"
import { AuthRequestType } from "../../../interfaces/AuthRequest.type"
import { authenticateToken } from "../../middleware/auth"
import unauthorized from "../../errorHttp/unauthorized"
import { validatePassword } from "../../../frontend/src/validators/passwordValidator"
import internalServerError from "../../errorHttp/internalServerError"

const changePasswordRoute = Router()

changePasswordRoute.post("/user/password", authenticateToken, async (req: AuthRequestType, res) => {
    try {
        const userId = req.user?.id
        if (!userId) {
            return unauthorized(res, "Unauthorized")
        }
        const { new_password } = req.body
        if (!new_password) {
            return res.status(400).json({ error: "new_password is required" })
        }
        const passwordError = validatePassword(new_password)
        if (passwordError) {
            return res.status(400).json({ error: passwordError.message, field: passwordError.field })
        }
        const hashedPassword = await hash(new_password, 10)
        await db.getPool().query(
            "UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2;",
            [hashedPassword, userId]
        )
        res.json({ message: "Password updated successfully" })
    } catch (err) {
        return internalServerError(res, err, "Error updating password")
    }
})

export default changePasswordRoute