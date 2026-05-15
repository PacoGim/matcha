import e, { Router } from "express"
import db from "../../database/db"
import unauthorized from "../../errorHttp/unauthorized"
import internalServerError from "../../errorHttp/internalServerError"
import {api} from "../../../frontend/src/api/routes"

const checkMailTokenRoute = Router()
const checkMailApi = api.auth.checkMail

checkMailTokenRoute[checkMailApi.method](checkMailApi.path, async (req, res) => {
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
            return unauthorized(res, "Invalid token")
        }
        const { user_id, new_email, expires_at } = result.rows[0]
        if (new Date() > new Date(expires_at)) {
            return unauthorized(res, "Token expired")
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
                [user_id, null]
            )
        }
        await db.getPool().query(
            "DELETE FROM email_verifications WHERE token = $1;",
            [token]
        )
        res.json({ message: new_email ? "Email updated successfully" : "Email verified successfully" })
    } catch (err) {
        return internalServerError(res, err, "Error checking email token")
    }
})

export default checkMailTokenRoute